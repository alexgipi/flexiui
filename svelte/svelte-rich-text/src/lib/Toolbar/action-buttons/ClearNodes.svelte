<script lang="ts">
  const { 
    editor,
    accenSoft = false,
    ariaLabel = "Clear nodes",
  } = $props();
</script>

<button
class="fl-bubble-menu-mark-button"
type="button"
onclick={() => $editor.chain().focus().clearNodes().run()}
aria-label={ariaLabel}
>
    Clear
</button>