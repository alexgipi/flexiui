<script lang="ts">
  let {
    editor,
    ariaLabel = "Add inline LaTeX math",
  } = $props();

  function addInlineMath() {
    const hasSelection = !$editor.state.selection.empty;

    if (hasSelection) {
      const latex = prompt("Enter inline math LaTeX expression:", "");
      if (latex) {
        return $editor
          .chain()
          .deleteSelection()
          .insertInlineMath({ latex })
          .focus()
          .run();
      }
      return;
    }

    const latex = prompt("Enter inline math LaTeX expression:", "");
    if (latex) {
      return $editor.chain().insertInlineMath({ latex }).focus().run();
    }
  }
</script>

<button
  type="button"
  onclick={addInlineMath}
  aria-label={ariaLabel}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="icon icon-tabler icons-tabler-outline icon-tabler-math"
    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
      d="M19 5h-7l-4 14l-3 -6h-2"
    /><path d="M14 13l6 6" /><path d="M14 19l6 -6" /></svg
  >
</button>