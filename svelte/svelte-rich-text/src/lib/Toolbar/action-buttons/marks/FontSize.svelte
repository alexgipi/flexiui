<script lang="ts">
  import { isNodeFullySelected } from "../../toolbar-utils";

  let { 
    editor, 
    accenSoft = false,
    ariaLabel = "Blockquote",
    fontSize
  } = $props();

  const aplyToNode = $derived.by(() => {
    return $editor.state.selection.empty || isNodeFullySelected($editor);
  })

  function decrementFontSize() {
    fontSize = fontSize - 1;

    if (aplyToNode) {
      $editor
        .chain()
        .focus()
        .setNodeFontSize(fontSize + "px")
        .run();
    } else {
      $editor
        .chain()
        .focus()
        .setFontSize(fontSize + "px")
        .run();
    }
  }

  function incrementFontSize() {
    fontSize = Number(fontSize) + 1;
    
    if (aplyToNode) {
      $editor
        .chain()
        .focus()
        .setNodeFontSize(fontSize + "px")
        .run();
    } else {
      $editor
        .chain()
        .focus()
        .setFontSize(fontSize + "px")
        .run();
    }
  }
  
</script>

<div class="fl-font-size-editor">
  <button
    type="button"
    aria-label="Decrease font size"
    onclick={decrementFontSize}
    class="fl-font-size-editor-button"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-minus"
      ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
        d="M5 12l14 0"
      /></svg
    >
  </button>
  <input type="text" bind:value={fontSize} />
  <button
    type="button"
    aria-label="Increase font size"
    onclick={incrementFontSize}
    class="fl-font-size-editor-button"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon icon-tabler icons-tabler-outline icon-tabler-plus"
      ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
        d="M12 5l0 14"
      /><path d="M5 12l14 0" /></svg
    >
  </button>
</div>