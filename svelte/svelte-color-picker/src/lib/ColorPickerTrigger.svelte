<script lang="ts">
  import * as Popover from "$lib/components/ui/popover/index.js";
  import type { Snippet } from "svelte";

  let {
    children,
    class: className,
    ...restProps
  }: {
    children?: Snippet;
    class?: string;
    [key: string]: any;
  } = $props();
</script>

<Popover.Trigger
  class="flex items-center gap-2 {className}"
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</Popover.Trigger>
