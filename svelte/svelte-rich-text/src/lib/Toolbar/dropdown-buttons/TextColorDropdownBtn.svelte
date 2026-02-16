<script lang="ts">
  const { editor, ariaLabel = "Text color", onToggleDropdown } = $props();

  function handleClick(event: MouseEvent) {
    onToggleDropdown?.(event, "text-color-dropdown");
  }
</script>

<!-- Text color -->
<button
  aria-label={ariaLabel}
  type="button"
  onclick={handleClick}
  class="fl-bubble-menu-mark-button"
>
  <span
    class="fl-button-color-text-popover"
    style="background: {$editor?.getAttributes('textStyle')?.color ||
      'currentColor'}"
  ></span>

  <svg
    class="toogle-dropdown-button-icon"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 10 6"
  >
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="m1 1 4 4 4-4"
    ></path>
  </svg>
</button>
