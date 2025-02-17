<script>
    export let placeholder = '';
    export let value = '';

</script>

<textarea {placeholder}>{value}</textarea>

<style>
    textarea {
        border: 1px solid #27272a;
        padding-inline: .75rem;
        padding-block: .5rem;
        min-height: 80px;
        resize: vertical;
        font-family: system-ui;
        border-radius: .5rem;
        background: transparent;
    }
</style>