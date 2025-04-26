<script>
    export let rounded = false;
    export let withoutBorder = false;
    export let outlined = false;
    export let className = '';
</script>

<div
class:rounded={rounded}
class:without-border={withoutBorder}
class:outlined={outlined}
class="preview-card">
    <header>Component preview</header>
    <div class="card-content">
        <slot></slot>
    </div>
</div>

<style>
    .preview-card {
    margin: 2.5rem 0 1.5rem;
    min-height: 88px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-wrap: pretty;

    &.outlined {
      border: 1px solid var(--code-block-bg);
    }

    &.rounded {
      border-radius: 1rem;
    }

    header {
        width: 100%;
        display: flex;
        padding: 8px 16px;
        font-size: 14px;
        border-bottom: 1px solid #ffffff0f;
        color: #ffffff9c;
    }
  }

  .card-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
</style>