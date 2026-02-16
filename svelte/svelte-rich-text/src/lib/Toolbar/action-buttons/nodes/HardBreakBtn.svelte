<script lang="ts">
  const { editor, ariaLabel = "Hard break" } = $props();
</script>

<button
  class="fl-bubble-menu-mark-button"
  type="button"
  onclick={() => $editor.chain().focus().setHardBreak().run()}
  aria-label={ariaLabel}
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
    class="icon icon-tabler icons-tabler-outline icon-tabler-corner-down-left"
    ><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path
      d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"
    ></path></svg
  >
</button>
