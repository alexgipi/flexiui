<script lang="ts">
  let { 
    editor, 
    accenSoft = false,
    ariaLabel = "Line height",
    lineHeight
  } = $props();

  function handleRangeInput(e: any) {
    $editor.commands.setNodeLineHeight(lineHeight.toString());
  }
</script>

<div class="fl-range-element">
  <span class="fl-range-element-value">
    {lineHeight.toFixed(2)}
  </span>
  <input
    oninput={handleRangeInput}
    type="range"
    min="0.5"
    max="4"
    step="0.05"
    bind:value={lineHeight}
  />
</div>
