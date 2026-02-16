<script lang="ts">
  import { isNodeFullySelected } from "../../toolbar-utils";

  let {
    editor,
    nodesLimit,
    currentNodeCount,
    accenSoft = false,
    ariaLabel = "Table",
  } = $props();

  function addTable() {
    const hasSelected = isNodeFullySelected($editor);

    if (currentNodeCount >= nodesLimit && !hasSelected) {
      return;
    }

    // Si el nodo está completamente seleccionado, reemplazarlo
    if (hasSelected) {
      $editor
        .chain()
        .deleteSelection() // Elimina el nodo seleccionado
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    } else {
      // Comportamiento normal: insertar
      $editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  }
</script>

<!-- Table -->
<button
  type="button"
  onclick={addTable}
  aria-label={ariaLabel}
  class:is-active={$editor.isActive("table")}
  class:accent-soft={accenSoft}
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
    class="icon icon-tabler icons-tabler-outline icon-tabler-table"
    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
      d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14"
    /><path d="M3 10h18" /><path d="M10 3v18" /></svg
  >
</button>
