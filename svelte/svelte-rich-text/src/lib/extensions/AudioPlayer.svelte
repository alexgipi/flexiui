<svelte:options customElement={{
    tag: 'fl-audio-player',
}} /> 

<script lang="ts">
  import { onMount, tick } from "svelte";
  import WaveSurfer from "wavesurfer.js";
  import { activeAudioId } from "./audioStore";

  export let id: string;
  export let src: string;
  export let controls: any
  export let showSeekbar: boolean = true;
  export let config: any = {};
  export let playerType: "waveform" | "seekbar" = "waveform";
  export let bgColor: string;
  export let textColor: string;
  export let borderRadius: string;
  export let accentColor: string;
  export let accentColorPaused: string;
  export let playBtnBgColor: string;
  export let playBtnTextColor: string;
  export let colorPlay: string;
  export let maxWidth: string;

  let wavesurfer: WaveSurfer | null = null;
  let waveformEl: HTMLDivElement | null = null;
  let wavesurferReady: boolean = false;
  let loading: boolean = true;
  // let audio: any = null;
  let audio: HTMLAudioElement | null = null;

  let playing: boolean = false;
  let mounted: boolean = false;
  let seekbarEl: HTMLDivElement | null = null;
  let progressEl: HTMLSpanElement | null = null;

  let volume: number = 0.5;
  let volumeSeekbarEl: HTMLDivElement | null = null;
  let volumeProgressEl: HTMLSpanElement | null = null;

  let audioDuration: number = 0;
  let audioCurrentTime: number = 0;

  id = id + "-" + Math.random().toString(36).substring(2, 15);

  function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return "0:00";

    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secondsLeft = totalSeconds % 60;

    return `${minutes}:${secondsLeft.toString().padStart(2, "0")}`;
  }

  function togglePlayPause() {
    playing = !playing;
    console.log({ playing });

    if (playing) {
      activeAudioId.set(id);

      if (wavesurferReady) {
        wavesurfer?.play();
      } else {
        audio.play();
      }
    } else {
      if (wavesurferReady) {
        wavesurfer?.pause();
      } else {
        audio.pause();
      }
    }
  }

  function handleSeekClick(e: MouseEvent) {
    if (!audio || !seekbarEl || !audio.duration) return;
    const rect = seekbarEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audio.duration;
    audio.currentTime = newTime;
  }

  function handleVolumeClick(e: MouseEvent) {
    if (!audio || !volumeSeekbarEl || !audio.duration) return;
    const rect = volumeSeekbarEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    let volumeValue = clickX / rect.width;
    if (volumeValue > 1) {
      volumeValue = 1;
    }
    // if (percentage > 100) {
    //   percentage = 100;
    // }

    volume = volumeValue;
    audio.volume = volume;

    if (wavesurferReady) {
      wavesurfer?.setVolume(volume);
    }
  }

  onMount(async () => {
    const unsubscribe = activeAudioId.subscribe((currentId) => {
      if (currentId !== id && playing) {
        // Otro reproductor ha sido activado → este se pausa
        playing = false;
        audio?.pause();
        wavesurfer?.pause();
      }
    });
    console.log({ src });
    console.log({ WaveSurfer });

    if (WaveSurfer) {
        
        setTimeout(() => {
          const identifier = "waveform-" + id;
          console.log({ identifier });
          console.log({ waveformEl });

          wavesurfer = WaveSurfer?.create({
            container: waveformEl,
            height: 46,
            normalize: false,
            waveColor: "#b0b0b0",
            progressColor: "#5e17eb",
            cursorColor: "#ddd5e9",
            cursorWidth: 4,
            barWidth: 3,
            barGap: 3,
            barRadius: 30,
            barHeight: 1,
            minPxPerSec: 40,
            fillParent: true,
            mediaControls: false,
            autoplay: false,
            interact: true,
            dragToSeek: true,
            hideScrollbar: true,
            audioRate: 1,
            autoScroll: true,
            autoCenter: true,
            sampleRate: 8000,
            url: src,
          });
        });
      
    }

    // wavesurfer.on("ready", () => {
    //   console.log("WaveSurfer is ready");
    //   wavesurferReady = true;
    //   wavesurfer?.setVolume(volume);
    // });

    // wavesurfer.on("finish", () => {
    //   playing = false;
    //   console.log("Playback finished");
    //   // stop the audio
    //   wavesurfer?.stop();
    // });

    // audio = new Audio(src);
    // audio.load();
    audio.volume = volume;
    audio.preload = "auto";

    audio.addEventListener("loadedmetadata", () => {
      audioDuration = audio.duration;
    });

    audio.onended = () => {
      playing = false;
      console.log("Audio playback ended");
    };

    audio.addEventListener("timeupdate", () => {
      audioCurrentTime = audio.currentTime;
      if (seekbarEl && progressEl) {
        progressEl.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
      }
    });

    audio.onended = () => {
      playing = false;
      console.log("Audio playback ended");
    };

    audio.addEventListener("play", () => {
      playing = true;
    });

    audio.addEventListener("pause", () => {
      playing = false;
    });

    setTimeout(() => {
      loading = false;
    }, 500);
    mounted = true;
  });

  let isDragging = false;
  let playingBeforeDragging = false;

  function onCurrentTimeGrabMouseDown(e: MouseEvent) {
    e.preventDefault();
    isDragging = true;
    playingBeforeDragging = playing;
    if (playing) togglePlayPause(); // Pause

    window.addEventListener("mousemove", onCurrentTimeGrabMouseMove);
    window.addEventListener("mouseup", onCurrentTimeGrabMouseUp);
  }

  function onCurrentTimeGrabMouseMove(e: MouseEvent) {
    if (!isDragging || !seekbarEl || !progressEl || !audio || !audio.duration)
      return;

    const rect = seekbarEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);

    // Actualiza visualmente el progreso
    progressEl.style.width = `${percentage * 100}%`;

    // Muestra el tiempo actual estimado
    audioCurrentTime = percentage * audio.duration;
  }

  function onCurrentTimeGrabMouseUp(e: MouseEvent) {
    if (!isDragging) return;
    isDragging = false;

    if (playingBeforeDragging) togglePlayPause(); // Resume

    window.removeEventListener("mousemove", onCurrentTimeGrabMouseMove);
    window.removeEventListener("mouseup", onCurrentTimeGrabMouseUp);

    if (!seekbarEl || !audio || !audio.duration) return;

    const rect = seekbarEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);

    // Ajusta el tiempo real del audio
    audio.currentTime = percentage * audio.duration;
  }

  function onVolumeGrabMouseDown(e: MouseEvent) {
    e.preventDefault();
    isDragging = true;

    window.addEventListener("mousemove", onVolumeGrabMouseMove);
    window.addEventListener("mouseup", onVolumeGrabMouseUp);
  }

  function onVolumeGrabMouseMove(e: MouseEvent) {
    if (!isDragging || !volumeSeekbarEl || !volumeProgressEl || !audio) return;

    const rect = volumeSeekbarEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max(x / rect.width, 0), 1);

    // Actualiza visualmente el progreso
    volumeProgressEl.style.width = `${percentage * 100}%`;

    // Muestra el tiempo actual estimado

    audio.volume = percentage;

    if (wavesurferReady) {
      wavesurfer?.setVolume(percentage);
    }
  }

  function onVolumeGrabMouseUp(e: MouseEvent) {
    if (!isDragging) return;
    isDragging = false;

    window.removeEventListener("mousemove", onVolumeGrabMouseMove);
    window.removeEventListener("mouseup", onVolumeGrabMouseUp);
  }

const styleVars = [
  bgColor && `--player-bg-color: ${bgColor};`,
  playBtnBgColor && `--player-play-btn-bg: ${playBtnBgColor};`,
  playBtnTextColor && `--player-play-btn-color: ${playBtnTextColor};`,
  accentColor && `--player-primary-color: ${accentColor};`,
  accentColorPaused && `--player-progress-default-bg: ${accentColorPaused};`,
  textColor && `--player-text-color: ${textColor};`,
  borderRadius && `--player-border-radius: ${borderRadius};`,
].filter(Boolean).join('\n');
</script>

<div 
class="audio-player" 
{id} 
class:playing
style={styleVars}
>
  <button
    onclick={() => togglePlayPause()}
    type="button"
    class="media-item-play-btn"
    class:playing
    aria-label="Reproducir audio"
  >
    {#if playing}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="icon icon-tabler icons-tabler-filled icon-tabler-player-pause"
        ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
          d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
        /><path
          d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
        /></svg
      >
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"
        ><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path
          d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"
        ></path></svg
      >
    {/if}
  </button>
  <!-- <span class="media-item-number">{index+1}</span> -->

  <div
    bind:this={waveformEl}
    class="audio-player-wave"
    id={"waveform-" + id}
    class:hidden={mounted && !wavesurferReady}
  ></div>

  <!-- {#if playerType === 'seekbar'}
        <div class="audio-player-seekbar">
            <span class="audio-player-seekbar-progress"></span>
        </div>
    {/if} -->

  <div class="audio-player-time">
    <span class="audio-player-current-time"
      >{formatTime(audioCurrentTime || 0)}</span
    >
    <span class="audio-player-sep">/</span>
    <span class="audio-player-duration">{formatTime(audioDuration)}</span>
  </div>

  {#if (playerType === "waveform" && !wavesurferReady && !loading) || playerType === "seekbar"}
    <div
      role="slider"
      tabindex="0"
      aria-label="Seekbar"
      aria-controls="audio-player-seekbar"
      aria-valuemin="0"
      aria-valuemax={audio.duration}
      aria-valuenow={audio.currentTime}
      bind:this={seekbarEl}
      class="audio-player-seekbar"
      onclick={handleSeekClick}
      onkeydown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          audio.currentTime = audio.currentTime + 10;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          audio.currentTime = audio.currentTime - 10;
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          togglePlayPause();
        }
      }}
    >
      <div bind:this={progressEl} class="audio-player-seekbar-progress">
        <button
          aria-label="Mover al punto actual"
          type="button"
          tabindex="-1"
          class="audio-player-seekbar-grab"
          onmousedown={onCurrentTimeGrabMouseDown}
        ></button>
      </div>
    </div>
  {/if}

  {#if loading}
    <div
      role="slider"
      tabindex="0"
      aria-label="Seekbar"
      aria-controls="audio-player-seekbar"
      aria-valuemin="0"
      class="audio-player-seekbar"
    >
      <div class="audio-player-seekbar-progress">
        <button
          aria-label="Mover al punto actual"
          type="button"
          tabindex="-1"
          class="audio-player-seekbar-grab"
        ></button>
      </div>
    </div>
  {/if}

  <div
    style="display: flex;gap: 5px;flex: unset;align-items: center;white-space: nowrap;"
    class="audio-player-options"
  >
    <div class="audio-player-volume">
      <div
        role="slider"
        tabindex="0"
        aria-label="Volume"
        aria-controls="audio-player-volume-slider"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={volume * 100}
        bind:this={volumeSeekbarEl}
        onclick={handleVolumeClick}
        onkeydown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            volume = Math.min(audio.volume + 0.1, 1);
            audio.volume = volume;
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            volume = Math.max(audio.volume - 0.1, 0);
            audio.volume = volume;
          }
        }}
        class="audio-player-seekbar audio-player-seekbar--volume"
        style="max-width: 70px;"
      >
        <span
          bind:this={volumeProgressEl}
          class="audio-player-seekbar-progress"
          style="width: {volume * 100}%;"
        >
          <button
            aria-label="Mover al punto actual"
            type="button"
            tabindex="-1"
            class="audio-player-seekbar-grab"
            onmousedown={onVolumeGrabMouseDown}
          >
          </button>
        </span>
      </div>
      <button
        aria-label="Silenciar audio"
        type="button"
        class="fl-audio-volume-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="currentColor"
          ><path
            d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"
          ></path></svg
        >
      </button>
    </div>
  </div>

  <!-- Reproductor de audo nativo -->
  <audio
    bind:this={audio}
    src={src}
    id={'native-audio-' + id}
  ></audio>
</div>

<style>
  :host {
    display: block;
    width: 100%;
  }

  .audio-player {
    --player-primary-color: #5e17eb;
    --player-bg-color: #8c8c8c45;
    --player-border-radius: 18px;
    --player-seekbar-bg: #8d8d8d3a;
    --player-seekbar-height: 6px;
    --player-progress-default-bg: #f5f5f5;
    --player-play-btn-bg: #8d8d8d26;
    --player-play-btn-color: currentColor;
    --player-text-color: currentColor;

    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--player-bg-color);
    border-radius: var(--player-border-radius);
    padding: 12px;
    width: 100%;
    box-sizing: border-box;
    color: var(--player-text-color);

    &.playing {
      .audio-player-wave {
        filter: grayscale(0);
      }

      .audio-player-seekbar-progress {
        color: var(--player-primary-color);
      }
    }
  }

  .media-item-play-btn {
    min-width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--player-play-btn-bg);
    color: var(--player-play-btn-color);
    border: 2px solid transparent;
    border-radius: 100%;
    outline-offset: 4px;
    outline-color: var(--player-play-btn-bg);
    cursor: pointer;
    transition: filter 0.3s ease, transform 0.3s ease, background 0.3s ease;

    &:hover {
      /* background: var(--player-primary-color); */
      &:not(.playing) {
        filter: brightness(1.2);
      }
      transform: scale(1.06);
    }

    svg {
      width: 20px;
      height: 20px;
    }

    &.playing {
      background: var(--player-primary-color);
      color: #fff;
      outline-color: var(--player-primary-color);
    }
  }

  .audio-player-wave {
    width: 100%;
    width: 200px;
    flex: auto;
    filter: grayscale(1);

    &.hidden {
      display: none;
    }
  }

  .audio-player-seekbar {
    height: var(--player-seekbar-height);
    flex: auto;
    background: var(--player-seekbar-bg);
    border-radius: 16px;
    position: relative;
    cursor: pointer;
    min-width: 0;
    transition: all 0.3s ease;

    &::before {
      content: "";
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transform: scaleY(3);
    }

    &:hover,
    &:focus-within {
      .audio-player-seekbar-progress {
        .audio-player-seekbar-grab {
          visibility: visible;
          transform: scale(1);
          border: none;
          padding: 0;
        }
      }
    }
  }

  .audio-player-seekbar-progress {
    width: 0;
    height: 100%;
    color: var(--player-progress-default-bg);
    background: currentColor;
    display: flex;
    border-radius: inherit;
    position: relative;

    .audio-player-seekbar-grab {
      content: "";
      width: 12px;
      height: 12px;
      background: currentColor;
      border-radius: 100%;
      position: absolute;
      right: calc(-1 * var(--player-seekbar-height));
      top: calc((12px - var(--player-seekbar-height)) / -2);
      box-shadow: 1px 1px 12px rgba(0, 0, 0, 0.1);
      visibility: hidden;
      transition: transform 0.3s ease;
      transform: scale(0);
      color: inherit;
      background: currentColor;
    }
  }

  .audio-player-volume {
    display: flex;
    align-items: center;
    border-radius: 20px;
    margin-right: 4px;

    &:hover {
      background: #7a7a7a17;
    }

    &:hover .audio-player-seekbar,
    &:focus-within .audio-player-seekbar {
      min-width: 70px;
      margin-left: 14px;
      margin-right: 4px;
    }
  }

  .audio-player-time {
    min-width: 70px;
    font-size: 0.8rem;
    color: inherit;
    text-align: center;
  }

  .audio-player-current-time {
    display: inline-block;
    min-width: 32px;
    font-variant-numeric: tabular-nums;
  }

  .audio-player-duration {
    display: inline-block;
    min-width: 32px;
    font-variant-numeric: tabular-nums;
  }

  .fl-audio-volume-btn {
    border: none;
    padding: 4px;
    background: #0d121600;
    color: currentColor;
    border-radius: 100%;
    height: 36px;
    width: 36px;
  }
</style>
