<script>
  import { onMount, createEventDispatcher } from "svelte";
  import "prism-code-editor/prism/languages/markup";
  import "prism-code-editor/prism/languages/css-extras";
  import "prism-code-editor/prism/languages/javascript";

  // Importing styles
  import "prism-code-editor/layout.css";
  import "prism-code-editor/scrollbar.css";
  import "prism-code-editor/themes/github-dark.css";
  import "./styles.css";
  import "prism-code-editor/search.css";
  import "prism-code-editor/copy-button.css";

  // import "prism-code-editor/languages/html"
  // import "prism-code-editor/languages/css"

  import { defaultHtml } from "./defaultHtml.js";
  import { defaultCSS } from "./defaultCSS.js";

  // Props
  export let id = "code-editor";
  export let className = "";
  export let value = null;
  export let language = "html";
  export let tabSize = 2;
  export let insertSpaces = true;
  export let lineNumbers = true;
  export let readOnly = false;
  export let wordWrap = false;
  export let rtl = false;
  export let editor;

  let editors = [];

  const defaultCode = language === "css" ? defaultCSS : defaultHtml;

  let dispatch = createEventDispatcher();

  const isNullOrUndefined = (value) =>
    value === null || value === undefined || value === "undefined";

  onMount(async () => {
    // Change to dynamic import
    createCodeEditor();
  });

  async function createCodeEditor(){
    const { createEditor } = await import("prism-code-editor");
    const { matchBrackets } = await import("prism-code-editor/match-brackets");
    const { indentGuides } = await import("prism-code-editor/guides");
    const { searchWidget, highlightSelectionMatches } = await import(
      "prism-code-editor/search"
    );
    const { defaultCommands, editHistory } = await import(
      "prism-code-editor/commands"
    );
    const { cursorPosition } = await import("prism-code-editor/cursor");
    const { copyButton } = await import("prism-code-editor/copy-button");
    const { matchTags } = await import("prism-code-editor/match-tags");
    const { highlightBracketPairs } = await import(
      "prism-code-editor/highlight-brackets"
    );

    // count dom element with id #${id} child nodes

    let editorContainer = document.getElementById(id);

    if (editorContainer?.childNodes?.length > 0) {
      console.log("Editor already exists");
      return;
    }

    editor = createEditor(
      `#${id}`,
      {
        language,
        value: isNullOrUndefined(value) ? defaultCode : value,
        tabSize,
        insertSpaces,
        lineNumbers,
        readOnly,
        wordWrap,
        rtl,
        onUpdate(code) {
          dispatch("update", { eventType: "update", code });
        },
        onSelectionChange([start, end, direction], code) {
          dispatch("selectionChange", {
            eventType: "selectionChange",
            start,
            end,
            direction,
            code,
          });
        },
        onTokenize(tokens, language, code) {
          dispatch("tokenize", {
            eventType: "tokenize",
            tokens,
            language,
            code,
          });
        },
      },
      indentGuides(),
      matchBrackets()
    );

    editor.addExtensions(
      highlightSelectionMatches(),
      searchWidget(),
      defaultCommands(),
      copyButton(),
      matchTags(),
      highlightBracketPairs(),
      cursorPosition(),
      editHistory()
    );
    
    editors = [...editors, editor];
  }
</script>

<div class="code-editor {className}">
  <div {id}></div>
</div>

