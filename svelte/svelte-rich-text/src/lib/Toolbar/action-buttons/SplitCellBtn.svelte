<script lang="ts">
  const { editor, ariaLabel = "Split cell" } = $props();
</script>

<button
  class="fl-bubble-menu-mark-button"
  type="button"
  aria-label={ariaLabel}
  title={ariaLabel}
  onclick={() => $editor?.chain().focus().splitCell().run()}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="opacity:1;"
    ><path d="M12 15V9m-9 6h18M3 9h18" /><rect
      width="18"
      height="18"
      x="3"
      y="3"
      rx="2"
    /></svg
  >
</button>
