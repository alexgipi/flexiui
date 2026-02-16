<script lang="ts">
  import { isNodeFullySelected } from "../../toolbar-utils";
  
  let { 
    editor, 
    nodesLimit,
    currentNodeCount,
    accenSoft = false, 
    ariaLabel = "Media grid"
  } = $props();

  function addMediaGrid() {
    const hasSelected = isNodeFullySelected($editor);

    if (currentNodeCount >= nodesLimit && !hasSelected) {
      return;
    }

    // Si el nodo está completamente seleccionado, reemplazarlo
    if (hasSelected) {
      $editor
        .chain()
        .deleteSelection() // Elimina el nodo seleccionado
        .insertGrid({ cols: 2 })
        .run();
    } else {
      // Comportamiento normal: insertar
      $editor.chain().focus().insertGrid({ cols: 2 }).run();
    }
  }
</script>

<!-- Grid -->
<button
  type="button"
  onclick={addMediaGrid}
  aria-label={ariaLabel}
  class:is-active={$editor.isActive("MediaGridComponent")}
  class:accent-soft={accenSoft}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="icon icon-tabler icons-tabler-filled icon-tabler-layout-grid"
    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
      d="M9 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
    /><path
      d="M19 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
    /><path
      d="M9 13a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
    /><path
      d="M19 13a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
    /></svg
  >
</button>
