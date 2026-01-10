A 'RichText' component for Svelte.
## Installation

To install the `RichText` component in your Svelte project, you can use npm or yarn.

With npm:

```bash
npm install @flexiui/svelte-rich-text
```

With yarn:

```bash
yarn add @flexiui/svelte-rich-text
```

## Usage

Once installed, you can use the `RichText` component in your Svelte application.

```svelte
<script lang="ts">
  import { RichText } from '@flexiui/svelte-rich-text';
  import { SpecialBox } from './editor/custom-extensions/SpecialBox';

  let editor = $state(null);

  let html = $state(null);
  let json = $state(null);

  let customExtensions = [
    SpecialBox
  ]

  let content = `
    <p>This is a simple and flexible "RichText" component designed to generate a WYSIWYG editor.</p>
    <p>It allows easy customization of styles, icons, colors, and more. Additionally, it includes an editable mode for use in forms, block editors, etc.</p>
    <p>This component is built on top of <a href="https://tiptap.dev/">Tiptap</a>, a powerful and flexible rich text editor framework for Svelte.</p>
  `

  // Editor events
  function handleEditorBeforeCreate(e: any) {
    console.log('beforeCreate');
    console.log(e);
  }

  function handleEditorCreate(e: any) {
    editor = e.editor;
    html = editor.getHTML();
    json = editor.getJSON();
  }
  
  function handleEditorDestroy(e: any) {
    console.log('destroy');
    console.log(e);
  }

  function handleEditorUpdate(e: any) {
    console.log(e);
    const { editor } = e;
    html = editor.getHTML();
    json = editor.getJSON();
  }

  function handleEditorTransaction(e: any) {
      console.log('transaction');
      console.log(e);
  }

  function handleEditorFocus(e: any) {
      console.log('focus');
      console.log(e);
  }

  function handleEditorBlur(e: any) {
      console.log('blur');
      console.log(e);
  }

  function handleEditorDrop(e: any) {
      console.log('drop');
      console.log(e);
  }

  function handleEditorDelete(e: any) {
      console.log('delete');
      console.log(e);
  }

  function handleEditorPaste(e: any) {
      console.log('paste');
      console.log(e);
  }

  function handleEditorSelectionUpdate(e: any) {
      console.log('selectionUpdate');
      console.log(e);
  }

  function handleEditorContentError(e: any) {
      console.log('contentError');
      console.log(e);
  }
</script>

<RichText
className="my-rich-text"
id="flexi-rich-text"
customExtensions={customExtensions}
editorEvents={{
  onUpdate: handleEditorUpdate,
  onTransaction: handleEditorTransaction,
  onFocus: handleEditorFocus,
  onBlur: handleEditorBlur,
  onDestroy: handleEditorDestroy,
  onDrop: handleEditorDrop,
  onDelete: handleEditorDelete,
  onPaste: handleEditorPaste,
  onSelectionUpdate: handleEditorSelectionUpdate,
  onBeforeCreate: handleEditorBeforeCreate,
  onCreate: handleEditorCreate,
  onContentError: handleEditorContentError,
}}
>
</RichText>

<h2>JSON Output</h2>
<pre>{JSON.stringify(json, null, 2)}</pre>

<h2>HTML Output</h2>
<pre>{html}</pre>

```

## Props

| Prop name | Type | Default value | Description |
| --- | --- | --- | --- |
| className | string | '' | A string that sets the class attribute of the component.
| editable | boolean | false | A boolean that determines whether the editor is editable or not.
| content | any | null | The initial content of the editor.
| customExtensions | any[] | [] | An array of custom extensions to be added to the editor.
| editorEvents | object | {} | An object containing event handlers for various editor events.

## Events

| Event name | Parameters | Description |
| --- | --- | --- |
| onTransaction | { editor, transaction } | Triggered when a transaction is executed on the editor.
| onBeforeCreate | { editor } | Triggered before the editor is created.
| onCreate | { editor } | Triggered after the editor is created.
| onUpdate | { editor, html, json } | Triggered when the editor content is updated.
| onFocus | { editor, event } | Triggered when the editor is focused.
| onBlur | { editor, event } | Triggered when the editor is blurred.
| onDestroy | { editor, message } | Triggered when the editor is destroyed.
| onDrop | { editor, event, slice, moved } | Triggered when the editor is dropped into the editor.
| onDelete | { editor, type, deletedRange, newRange, partial, from, to } | Triggered when content is deleted from the editor.
| onContentError | { editor, error, disableCollaboration } | Triggered when the editor content does not match the schema.
| onSelectionUpdate | { editor } | Triggered when the selection in the editor is updated.
| onPaste | { event, slice } | Triggered when the editor is pasted into.

## Custom Extensions

You can add custom extensions to the editor by passing them as an array to the `customExtensions` prop. Here's an example of how to add the `SpecialBox` extension:

```svelte
<script lang="ts">
  import { SpecialBox } from './editor/custom-extensions/SpecialBox';

  let customExtensions = [
    SpecialBox
  ]
</script>

<RichText
  customExtensions={customExtensions}
  ...
/>
```

In this example, the `SpecialBox` extension is imported from a file called `SpecialBox.ts` in the `editor/custom-extensions` directory.

In this case, the `SpecialBox` extension is a custom "Mark" that adds a special box inline node to the editor.

```ts
import { Mark } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    specialBox: {
      specialBox: () => ReturnType
      isActive: (options: any) => ReturnType
    }
  }
}

export const SpecialBox = Mark.create({
  name: "specialBox",
  excludes: 'code highlight',

  parseHTML() {
    return [
      {
        tag: "span[data-special-box]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "class": "special-box",
        "data-special-box": "true",
        style: "line-height: 1.5;",
      },
      0,
    ];
  },

  addCommands(): any {
    return {
      specialBox: () => ({ commands }: any) => {
        return commands.toggleMark(this.name);
      },
      isActive: (options: any) => {
        return options.type === this.name;
      },
    };
  },
});
```

In this example, the `SpecialBox` extension defines a custom "Mark" that adds a special box inline node to the editor.

The `parseHTML` method defines the HTML structure of the special box node. In this case, the node is a `<span>` element with a `data-special-box` attribute.

The `renderHTML` method defines the HTML structure of the special box node. In this case, the node is a `<span>` element with a `data-special-box` attribute and a `special-box` class.

The `addCommands` method defines the commands for the special box node. In this case, the `specialBox` command toggles the mark on the selected text.

The `isActive` method defines the logic for determining whether the special box node is active or not. In this case, the node is active if the selected text has the `specialBox` mark.

You can customize the behavior of the special box node by modifying the `SpecialBox` extension as needed.

More information about custom nodes, marks and extensions can be found in the [Tiptap documentation](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new).