<script lang="ts">
  import { NodeViewWrapper } from 'svelte-tiptap'
  import type { NodeViewProps } from '@tiptap/core'
  import AudioPlayer from './AudioPlayer.svelte';
  import { onDestroy } from 'svelte';

  export let node: NodeViewProps['node']
  export let selected: NodeViewProps['selected'] // 👈 aquí
  export let getPos: NodeViewProps['getPos']
  export let editor: NodeViewProps['editor']

  const attrs = node.attrs

  export let targetElement: any = null;

  let minWidth = 316;
  let maxWidth = "100%";

  let startX = 0;
  let startWidth = 0;

  function onMouseDown(e: MouseEvent) {
    e.preventDefault();

    if (!targetElement) return;

    startX = e.clientX;
    startWidth = targetElement.offsetWidth;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!targetElement) return;

    // 🔥 Obtenemos el DOM node de ProseMirror
    const domNode = editor.view.nodeDOM(getPos()) as HTMLElement

    const deltaX = (e.clientX - startX); 
    let newWidth = startWidth + deltaX;

    if (newWidth < minWidth) {
      newWidth = minWidth;
    }

    domNode.style.maxWidth = `${newWidth}px`;

  }

  function onMouseUp() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  onDestroy(() => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  });
</script>

<NodeViewWrapper class="fl-audio-player-wrapper">
  <div
    bind:this={targetElement}
    class="fl-audio-player-container"
    class:selected={selected}
  >
    <!-- <audio
      src={attrs.src}
      controls={attrs.controls}
      autoplay={attrs.autoplay}
      loop={attrs.loop}
    ></audio> -->

    <AudioPlayer 
    id={attrs.id}
    controls={true}
    src={attrs.src}
    bgColor={attrs.bgColor}
    textColor={attrs.textColor}
    borderRadius={attrs.borderRadius}
    accentColor={attrs.accentColor}
    accentColorPaused={attrs.accentColorPaused}
    playBtnBgColor={attrs.playBtnBgColor}
    playBtnTextColor={attrs.playBtnTextColor}
    colorPlay={attrs.colorPlay}
    maxWidth={attrs.maxWidth}
    rewriteStyles={attrs.rewriteStyles}
    ></AudioPlayer>

    {#if selected}
        <span
        class="resize-grab"
        role="button"
        tabindex="0"
        aria-label="Arrastra para cambiar el tamaño"
        contenteditable="false"
        on:mousedown={onMouseDown}
        >
        </span>
    {/if}
  </div> 
</NodeViewWrapper>

<style>
  .fl-audio-player-container {
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 1em;
    margin-bottom: 1em;

    :global(.audio-player) {
      margin: 0
    }
  }

  .resize-grab {
    position: absolute;
    right: -4px;
    width: 6px;
    background: #535bf2;
    height: 50%;
    border-radius: 13px;
    cursor: col-resize;
    display: flex;
    align-items: center;

    &::after {
        content: "";
        position: absolute;
        width: 14px;
        height: 14px;
        left: -4px;
        background: inherit;
        border-radius: 100%;
    }
}
</style>