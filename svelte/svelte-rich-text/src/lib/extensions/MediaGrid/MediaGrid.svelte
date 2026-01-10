<script lang="ts">
  import type { NodeViewProps } from "@tiptap/core";
  import cx from "clsx";
  import { NodeViewContent, NodeViewWrapper } from "svelte-tiptap";

  const { node, updateAttributes, selected, getPos, editor }: NodeViewProps = $props();

  console.log(node);
  let cols = $state(node.attrs.cols || 2);
  let gap = $state(node.attrs.gap || 1);
  let showIndicator = $state(node.attrs.showIndicator || false);
  let indicatorType = $state(node.attrs.indicatorType || 'numeric');

  function handleColsChange(e) {
    cols = e.target.value;
    updateAttributes({ cols });
  }

  function handleGapChange(e) {
    gap = e.target.value;
    updateAttributes({ gap });
  }

  function handleShowIndicatorChange(e) {
    showIndicator = e.target.checked;
    updateAttributes({ showIndicator });
  }

  function handleIndicatorTypeChange(e) {
    indicatorType = e.target.value;
    updateAttributes({ indicatorType });
  }
</script>

<NodeViewWrapper
  id="svelte-component"
  data-selected={selected}
  class={cx("fl-editor-custom-component svelte-component")}
  data-drag-handle=""
>
  <div class="flex fl-editor-component-header" contentEditable={false}>

    <button
    type="button"
    class="fl-add-grid-item-btn"
    onclick={() => {
      const pos = getPos();
      if (typeof pos === "number") {
        // Coloca el cursor dentro del grid (contentDOM)
        editor
          .chain()
          .focus()
          .setTextSelection(pos + 1) // 👈 entra dentro del content
          .addGridItem()
          .run();
      } else {
        editor.chain().focus().addGridItem().run();
      }
    }}
  >
    Add grid item
  </button>

    <div class="fl-editor-component-options">
      <div class="fl-editor-component-option">
        <label>
          <span class="fl-editor-component-option-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-columns"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 6l5.5 0"></path><path d="M4 10l5.5 0"></path><path d="M4 14l5.5 0"></path><path d="M4 18l5.5 0"></path><path d="M14.5 6l5.5 0"></path><path d="M14.5 10l5.5 0"></path><path d="M14.5 14l5.5 0"></path><path d="M14.5 18l5.5 0"></path></svg>
          </span>
          <input
            class="fl-editor-option-input input-number option--cols"
            oninput={handleColsChange}
            type="number"
            id="cols"
            value={cols}
            min="1"
            max="10"
            step="1"
          />
        </label>
      </div>

      <div class="fl-editor-component-option">
        <label>
          <span class="fl-editor-component-option-icon">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="19"  height="19"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-spacing-horizontal"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 20h-2a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h2" /><path d="M4 20h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M12 8v8" /></svg>
          </span>
          <input
            class="fl-editor-option-input input-text option--gap"
            oninput={handleGapChange}
            type="text"
            id="gap"
            value={gap}
          />
        </label>
      </div>

      <div class="fl-editor-component-option m-l-small">
        <label>
          <input
            class="fl-editor-option-input input-checkbox option--show-indicator"
            oninput={handleShowIndicatorChange}
            type="checkbox"
            id="show-indicator"
            checked={showIndicator}
          />
          Show indicators
        </label>
      </div>

      {#if showIndicator}
        <div class="fl-editor-component-option">
          <label>
            <select id="indicator-type" value={indicatorType} onchange={handleIndicatorTypeChange}>
              <option value="numeric">Numeric</option>
              <option value="alphabetic">Alphabetic</option>
            </select>
          </label>
        </div>
      {/if}
    </div>
  </div>


    <!-- <div class="fl-grid" >
      {#each Array(node.childCount) as _, i}
      <div class="fl-grid-item">
        <span class="fl-grid-item-badge">
          {i + 1}
        </span>
        <img src="https://template.tiptap.dev/images/tiptap-ui-placeholder-image.jpg" alt="Imagen de ejemplo" />
        <div class="fl-grid-item-actions">
          <button type="button" onclick={() => {
            editor.commands.addGridItem();
          }}>
            Add
          </button>
        </div>
      </div>
      {/each}
      
  </div> -->

  <NodeViewContent 
  class="media-grid-view-content" 
  style="
  --fl-grid-cols: {cols};
  --fl-grid-gap: {gap};
  "
  />

  

  <!-- <div class="fl-editor-component-option">
    <button type="button" onclick={addItem}> Add item </button>
  </div> -->
  
</NodeViewWrapper>



<style>
  .placeholder {
    opacity: 0.4;
    border: 1px dashed #aaa;
  }

  .fl-editor-component-header {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
  }

  .fl-add-grid-item-btn {
    padding: 8px 16px;
    border-radius: 12px;
    border: none;
    background: #6b6b6b;
    font-size: 14px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;

    &:hover {
      background: #818181;
    }
  }

  .fl-editor-component-options {
        display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #ffffffc2;
    background-color: #2a2a2a00;
    backdrop-filter: blur(10px);
    padding: 6px 8px;
    border-radius: 12px;
  }

  .fl-editor-component-option {
    & label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    & .fl-editor-component-option-icon {
      display: flex;
    }

    &.m-l-small {
      margin-left: 12px;
    }

    select {
      background-color: #242424;
      border: none;
      padding: 3px 2px;
      outline: none;

      &:focus {
        text-decoration: underline;
      }
    }
  }

  .fl-editor-option-input {

    &.input-number, &.input-text {
      border: none;
      background: #7e7e7e80;
      padding: 6px 7px;
      border-radius: 9px;
      box-sizing: border-box;
    }

    &.option--cols {
      width: 52px;
    }

    &.option--gap {
      width: 74px;
    }

    &.input-checkbox {
      width: 15px;
      margin: 0;
      height: 15px;
      accent-color: #535bf2;
    }
    
  }

  .fl-grid-item-badge {
    position: absolute;
    left: 10px;
    top: 10px;
    background: #535bf2;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border-radius: 100%;
}

  .fl-grid-item-actions {
    display: flex;
    gap: 10px;
    position: absolute;
    top: 10px;
    right: 10px;
  }
</style>
