<script lang="ts">
  import { getContext } from "svelte";

  const COLOR_PICKER_CONTEXT_KEY = "color-picker";

  interface ColorPickerContext {
    color: string;
    currentColor: string;
  }

  let {
    class: className,
    showAlpha = false,
    ...restProps
  }: {
    class?: string;
    [key: string]: any;
  } = $props();

  const context = getContext<ColorPickerContext>(COLOR_PICKER_CONTEXT_KEY);
</script>

<span
  class="color-picker-swatch w-5 h-5 rounded border border-border {className}"
  class:show-alpha={showAlpha}
  style="--current-color: {context?.currentColor ?? '#000000'};"
  {...restProps}
></span>


<style>
  .color-picker-swatch {
    background: var(--current-color);
    
    &.show-alpha {
        position: relative;
        background-image: repeating-conic-gradient(rgb(255, 255, 255) 0%, rgb(255, 255, 255) 25%, rgb(183, 183, 183) 0%, rgb(183, 183, 183) 50%);
        background-size: 8px 8px;
        
        &::after {
            content: "";
            position: absolute;
            inset: 0;
            background: var(--current-color);
            border-radius: inherit;
        }
    }
  }
</style>