<script lang="ts">
  const { editor, accentSoft = false, ariaLabel = "Special box" } = $props();

  function toggleSpecialBox() {
    if ($editor) {
      $editor.chain().focus().specialBox().run();
    }
  }
</script>

<!-- Special box -->
<button
  class="fl-bubble-menu-mark-button"
  class:is-active={$editor?.isActive("specialBox")}
  class:accent-soft={accentSoft}
  onclick={toggleSpecialBox}
  type="button"
  aria-label={ariaLabel}
>
  <span class="special-box-icon">A</span>
</button>
