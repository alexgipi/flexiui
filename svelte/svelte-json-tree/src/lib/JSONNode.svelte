<script lang="ts">
  import JsonNode from "./JSONNode.svelte"; // recursion
  import { createEventDispatcher } from "svelte";

  export let data: any;
  export let keyName: string | number = "";
  export let level = 0;
  export let defaultExpandedLevels = 1;
  export let isRoot = false;

  const dispatch = createEventDispatcher();

  const isArray = Array.isArray(data);
  const isObject = typeof data === "object" && data !== null && !isArray;
  const isPrimitive = !isObject && !isArray;

  // estado de plegado — por defecto abierto según nivel
  let expanded = level < defaultExpandedLevels;

  function toggle(e?: MouseEvent) {
    if (e) e.stopPropagation();
    expanded = !expanded;
    dispatch("toggle", { key: keyName, expanded });
  }

  // representación corta para objetos/arrays
  function summary() {
    if (isObject) return `{…} (${Object.keys(data).length})`;
    if (isArray) return `[…] (${data.length})`;
    return JSON.stringify(data);
  }
</script>

<div class="node" class:is-root={isRoot}>
  {#if isObject || isArray}
    <div 
    class="node-header" 
    role="treeitem" 
    aria-expanded={expanded} 
    aria-selected="false"
    on:click={toggle} 
    tabindex="0" 
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    }}
    >
      <span class:expanded class="arrow" aria-hidden="true"></span>

      {#if keyName !== "root"}
        <span class="key">{keyName}:</span>
      {/if}

      <span class="type">{isObject ? "Object" : "Array"}</span>
      <span class="summary"> {summary()}</span>
    </div>

    {#if expanded}
      <div class="children" role="group">
        {#if isArray}
          {#each data as item, i (i)}
            <JsonNode data={item} keyName={i} level={level + 1} {defaultExpandedLevels} />
          {/each}
        {:else}
          {#each Object.entries(data) as [k, v] (k)}
            <JsonNode data={v} keyName={k} level={level + 1} {defaultExpandedLevels} />
          {/each}
        {/if}
      </div>
      <div class="closing">
        {isObject ? "}" : "]"}
      </div>
    {/if}
  {:else}
    <div class="primitive-line" role="treeitem">
      {#if keyName !== "root"}
        <span class="key">{keyName}:</span>
      {/if}
      <span class="value">{JSON.stringify(data)}</span>
    </div>
  {/if}
</div>

<style>
  .node { 
    white-space: nowrap;  
    &:not(.is-root) {
      padding-left: 22px;
    }
  }
  .node-header {
      cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 6px;

    &:hover {
        background: #cdcdcd1f;
    }
   }
  .arrow { 
    width: 8px;
    display: inline-block;
    text-align: center;

    &.expanded::after {
      transform: rotate(90deg) translateY(1px);
    }

    &::after {
      content: '';
      display: block;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 0 4px 6.9px;
      border-color: transparent transparent transparent currentColor;
    }
   }
  .key {
    color: #ececec;
    font-weight: 500;
    margin-right: 4px;
  }
  .type {
        color: #ffffff85;
    font-size: .95em;
    margin-right: 6px;
  }
  .summary { color: #999; font-size: .9em; }

  .primitive-line {
    /* -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis; */
    max-width: 1180px;
    padding: 2px 9px;
  }

  .primitive-line .value {
    color: #37dbbe;
    margin-right: 12px;
    white-space: pre-wrap;
  }
  .closing { 
    color: #999;
    margin-top: 2px;
    padding-left: 7px;
  }

  .children {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      border-right: 1px dashed rgba(69, 69, 69, 0.96);
      height: 100%;
      top: 0;
      left: 9px;
    }
  }
</style>
