<script lang="ts">
    export let active: boolean = false;
</script>

<div class="tab-panel" class:active={active}>
    <slot></slot>
</div>

<style>
    .tab-panel {
      display: none;
    }
  
    .tab-panel.active {
      display: block;
    }  
</style>