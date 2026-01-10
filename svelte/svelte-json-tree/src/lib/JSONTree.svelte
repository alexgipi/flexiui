<script lang="ts">
  import { onMount } from "svelte";
  import JSONNode from "./JSONNode.svelte";

  export let data: any = {};
  export let defaultExpandedLevels = 2; // niveles que vienen abiertos por defecto
  export let showRoot = true; // si quieres esconder la raíz (útil cuando pasas un objeto ya "rooted")
  export let className = "";
  export let id = `fl-json-tree-${Math.random().toString(36).slice(2, 10)}`;

  let rootData = data;

  // Si reciben JSON en string, intentar parsear (comodidad)
  onMount(() => {
    if (typeof data === "string") {
      try { rootData = JSON.parse(data); }
      catch (e) { console.warn("JsonTreeViewer: string no válido"); rootData = data; }
    }
  });
</script>

<div class={`json-tree-viewer ${className}`} role="tree" {id}>
  {#if showRoot}
    <JSONNode
      data={rootData}
      keyName={"root"}
      level={0}
      {defaultExpandedLevels}
      isRoot={true}
    />
  {:else}
    {#if typeof rootData === 'object' && rootData !== null}
      {#if Array.isArray(rootData)}
        {#each rootData as item, i}
          <JSONNode data={item} keyName={String(i)} level={0} {defaultExpandedLevels} />
        {/each}
      {:else}
        {#each Object.entries(rootData) as [k, v]}
          <JSONNode data={v} keyName={k} level={0} {defaultExpandedLevels} />
        {/each}
      {/if}
    {:else}
      <div class="primitive">{JSON.stringify(rootData)}</div>
    {/if}
  {/if}
</div>

<style>
  .json-tree-viewer {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
    font-size: 14px;
    line-height: 1.3;
    padding: 1.5rem;
    overflow: auto;
    border-radius: 12px;
    background: #202020;
    box-sizing: border-box;
    width: 100%;
  }
  .primitive { color: #24d988; }
</style>
