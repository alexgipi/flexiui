<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let variant: "text" | "contained" | "outlined" = "text";
  export let size: "small" | "medium" | "large" = "medium";
  export let disabled:boolean = false;
  export let href:string | null = null;
  export let id:string | null = null;

  // event dispatcher click
  const dispatch = createEventDispatcher();

  function handleClick(e:any) {
    dispatch('click', e);
  }
</script>

<svelte:element 
this={href ? 'a' : 'button'} 
class="fl-button fl-button-size--{size} fl-button-variant--{variant}"
disabled={disabled}
href={href}
on:click={handleClick}
role="button"
tabindex="0"
{...$$restProps}
>
    <slot></slot>
</svelte:element>

<style>
  .fl-button {
    --variant-textColor: #90caf9;
    --variant-outlinedColor: #90caf9;
    --variant-outlinedBorder: rgba(144, 202, 249, 0.5);

    appearance: none;
    border-radius: 9px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    color: var(--variant-textColor);
    cursor: pointer;
    transition:
      background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
      border-color 250ms cubic-bezier(0.4, 0, 0.2, 1);

    &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
        color: #ffffffc7;
    }

    &:hover:not(:disabled) {
      --variant-containedBg: #42a5f5;
      --variant-textBg: rgba(144, 202, 249, 0.08);
      --variant-outlinedBorder: #90caf9;
      --variant-outlinedBg: rgba(144, 202, 249, 0.08);
    }
  }

  .fl-button-variant--text {
    background-color: transparent;

    &:hover {
      background-color: var(--variant-textBg);
    }
  }

  .fl-button-variant--contained {
    --variant-containedBg: #90caf9;
    background-color: var(--variant-containedBg);
    color: #080808;
    line-height: 1.3;

    &:disabled {
        background-color: #cfcfcf3b;
    }

    &:hover:not(:disabled) {
      --variant-containedBg: #42a5f5;
      background-color: var(--variant-containedBg);
    }
  }

  .fl-button-variant--outlined {
    --variant-outlinedBg: transparent;
    background-color: var(--variant-outlinedBg);
    color: var(--variant-outlinedColor);
    border: 1px solid var(--variant-outlinedBorder);

    &:hover {
      background-color: var(--variant-outlinedBg);
    }
  }

  .fl-button.fl-button-size--small {
    padding: 0.5em 0.75em;
    font-size: 0.85em;
    line-height: 1.1;
  }

  .fl-button.fl-button-size--medium {
    padding: 0.6em 1em;
    font-size: 0.95em;
    line-height: 1.25;
  }

  .fl-button.fl-button-size--large {
    padding: 0.7em 1.25em;
    font-size: 1.05em;
  }
</style>
