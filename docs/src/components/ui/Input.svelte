<script>
    export let placeholder;
    export let value = '';
    export let type = 'text';

</script>

<input {type} {placeholder} {value} />

<style>
    input {
        border: 1px solid #222222a3;
        padding-inline: .75rem;
        padding-block: .5rem;
        font-family: system-ui;
        border-radius: .5rem;
        background: transparent;
        font-size: .875rem;
        line-height: 1.25rem;
    }
</style>