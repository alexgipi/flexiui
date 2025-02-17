<script lang="ts">
    export let className:string = ''
</script>

<div class="fl-accordion {className}" data-orientation="vertical">
    <slot></slot>
</div>

<style>
    .fl-accordion {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
</style>