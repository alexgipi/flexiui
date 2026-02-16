<script lang="ts">
  const {
    editor,
    accenSoft = false,
    ariaLabel = "Clear formatting",
  } = $props();
</script>

<button
  aria-label={ariaLabel}
  type="button"
  onclick={() => $editor.chain().focus().unsetAllMarks().run()}
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
    class="icon icon-tabler icons-tabler-outline icon-tabler-clear-formatting"
    ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
      d="M17 15l4 4m0 -4l-4 4"
    /><path d="M7 6v-1h11v1" /><path d="M7 19l4 0" /><path
      d="M13 5l-4 14"
    /></svg
  >
</button>
