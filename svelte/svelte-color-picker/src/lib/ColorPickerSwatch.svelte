<script lang="ts">
  let {
    class: className,
    showAlpha = false,
    value,
    ...restProps
  }: {
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<span
  class="color-picker-swatch w-5 h-5 rounded border border-border {className}"
  class:show-alpha={showAlpha}
  style="--current-color: {value ?? '#000000'};"
  {...restProps}
></span>


<style>
  .color-picker-swatch {
    background: var(--current-color);
    
    &.show-alpha {
        position: relative;
        background: linear-gradient(var(--current-color), var(--current-color)), repeating-conic-gradient(rgb(204, 204, 204) 0%, rgb(204, 204, 204) 25%, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%) 0% 50% / 8px 8px;
        background-size: 8px 8px;
    }
  }
</style>