<script>
    export let placeholder = '';
    export let value = '';

</script>

<textarea {placeholder}>{value}</textarea>

<style>
    textarea {
        border: 1px solid #222222a3;
        padding-inline: .75rem;
        padding-block: .5rem;
        min-height: 80px;
        resize: vertical;
        font-family: system-ui;
        font-size: .875rem;
        border-radius: .5rem;
        background: transparent;
    }
</style>