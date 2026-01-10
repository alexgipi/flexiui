<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let id: string = 'flexi-quote';
  export let className: string = '';
  export let editable = false;
  export let bgColor = 'transparent';
  export let textColor = '#fff';
  export let borderWidth = "3px";
  export let borderColor = "currentColor";
  export let borderRadius = "0";
  export let value: string = '';

  const dispatch = createEventDispatcher()

  function handleFocus(e: any) {
    dispatch('focus', { innerHTML: e.target.innerHTML, event: e });
  }

  function handleKeydown(e: any) {
    dispatch('keydown', { innerHTML: e.target.innerHTML, event: e });
  }

  function handleInput(e: any) {
    dispatch('input', { innerHTML: e.target.innerHTML, event: e });
  }
</script>

<blockquote class="{className}" class:editable={editable} style="background-color: {bgColor}; color: {textColor}; border-width: {borderWidth}; border-color: {borderColor}; border-radius: {borderRadius};">
  <div class="quote-icon-box">
    <svg class="quote-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14"><path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" class="s-bt4TO7lDzZnF"></path></svg>
  </div>

  {#if editable}
    <div class="quote-content"
    role="textbox"
    tabindex="0"
    id={id}
    contenteditable="true"
    on:focus={(e) => handleFocus(e)}
    on:keydown={(e) => handleKeydown(e)}
    on:input={(e) => handleInput(e)}
    bind:innerHTML={value}
    >
      <slot></slot>
    </div>
  {:else}
    <div class="quote-content">
      <slot></slot>
    </div>
  {/if}
</blockquote>

<style>
  blockquote {
    border-color: #fff;
    border-left: 3px solid;
    margin: 0;
    position: relative;
    flex: 1;

    &.editable {
      cursor: text;
    }
  }

  .quote-icon-box {
    display: flex;
    /* align-items: center; */
    width: 66px;
    justify-content: center;
    position: absolute;
    height: 100%;
    padding: 1.25rem;
    box-sizing: border-box;
  }

  .quote-icon {
    width: 18px;
    height: 18px;
  }

  .quote-content {
    outline: none;
    min-width: 25px;
    padding: 1rem;
    padding-left: 64px;
    position: relative;
    display: block;
    text-align: left;
    min-height: 56px;
  }
</style>