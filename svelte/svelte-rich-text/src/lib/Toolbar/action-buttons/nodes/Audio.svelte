<script lang="ts">
  import { isNodeFullySelected } from "../../toolbar-utils";

  let {
    editor,
    nodesLimit,
    currentNodeCount,
    accenSoft = false,
    ariaLabel = "Audio",
  } = $props();

  function addAudio() {
    const hasSelected = isNodeFullySelected($editor);

    if (currentNodeCount >= nodesLimit && !hasSelected) {
      return;
    }

    const previousSrc = $editor.getAttributes("audio").src;
    const src = window.prompt("Enter the URL of the audio:", previousSrc);

    if (!src) {
      alert("Please enter a valid URL");
      return;
    }

    // Si el nodo está completamente seleccionado, reemplazarlo
    if (hasSelected) {
      $editor
        .chain()
        .deleteSelection() // Elimina el nodo seleccionado
        .setAudio({ src, controls: true })
        .run();
    } else {
      // Comportamiento normal: insertar
      $editor.chain().focus().setAudio({ src, controls: true }).run();
    }
  }
</script>

<!-- Audio -->
<button
  type="button"
  onclick={addAudio}
  aria-label={ariaLabel}
  class:is-active={$editor.isActive("audio")}
  class:accent-soft={accenSoft}
>
  <svg
    style="transform: scale(1.1);"
    fill="currentColor"
    width="24px"
    viewBox="0 -960 960 960"
    height="24px"
    xmlns="http://www.w3.org/2000/svg"
    ><path
      d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"
    ></path></svg
  >
</button>
