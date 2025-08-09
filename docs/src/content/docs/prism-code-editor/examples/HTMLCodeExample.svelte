<script lang="ts">
  import { PrismCodeEditor } from "@flexiui/svelte-prism-code-editor";

  let value: string | null = null;
  let editor: any;

  function onUpdate(e: any) {
    const { eventType, code } = e.detail;

    if (eventType === "update") {
      value = code;
    }
  }

  function updateCode() {
    editor.setOptions({ value: "Hola" });
  }
</script>

<PrismCodeEditor
  bind:editor
  on:update={(e: any) => onUpdate(e)}
  language="html"
  id="html-example-code-editor"
  {value}
  className="no-drag"
></PrismCodeEditor>