# RichText Component

A powerful rich text editor component for Svelte built on top of [Tiptap](https://tiptap.dev/).

## Installation

```bash
npm install @flexiui/svelte-rich-text
```

## Usage

### Basic Usage

```svelte
<script lang="ts">
  import { RichText } from '@flexiui/svelte-rich-text';

  let json = $state(null);
  let html = $state(null);

  function handleUpdate(e) {
    const { editor, html: editorHtml, json: editorJson } = e;
    json = editorJson;
    html = editorHtml;
  }
</script>

<RichText
  editorEvents={{
    onUpdate: handleUpdate
  }}
/>
```

### With Initial Content

```svelte
<script lang="ts">
  import { RichText } from '@flexiui/svelte-rich-text';

  let content = {
    type: "doc",
    content: [
      {
        type: "h1",
        content: [{ type: "text", text: "Hello World" }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "This is a paragraph." }]
      }
    ]
  };
</script>

<RichText {content} />
```

### Without Toolbar

```svelte
<RichText showToolbar={false} />
```

### With Node Limit

Limita el número de nodos de primer nivel que puede tener el documento.

```svelte
<RichText nodesLimit={5} />
```

### With Unique H1

Automáticamente convierte encabezados H1 adicionales en párrafos, permitiendo solo un H1 en el documento.

```svelte
<RichText uniqueH1={true} />
```

### With Semantic Headings

```svelte
<RichText semanticHeadings={true} />
```

### Custom Toolbar Configuration

```svelte
<RichText
  toolbarConfig={[
    [{ type: "undo" }, "redo"],
    [{ type: "headings" }, { type: "lists" }],
    ["codeBlock", "blockquote"],
    ["fontSize", "lineHeight"],
    ["textAlignLeft", "textAlignCenter", "textAlignRight", "clearFormatting"],
  ]}
/>
```

### With Custom Styling

```svelte
<RichText
  config={{
    editorAccentColor: "#22c55e",
    editorBgColor: "#242424",
    toolbarBgColor: "#1a1a1a",
    docBg: "#2a2a2a",
    buttonStyle: "accent-soft"
  }}
/>
```

### With Custom Extensions

```svelte
<script lang="ts">
  import { RichText } from '@flexiui/svelte-rich-text';
  import { SpecialBox } from './extensions/SpecialBox';
  import { PlaceholderExt } from '@flexiui/svelte-rich-text';

  let customExtensions = [
    SpecialBox,
    PlaceholderExt.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "h1") {
          return "Introduce un título";
        } else if (node.type.name === "paragraph") {
          return "Escribe algo...";
        }
      }
    })
  ];
</script>

<RichText {customExtensions} />
```

### Complete Example

```svelte
<script lang="ts">
  import { RichText } from '@flexiui/svelte-rich-text';
  import { SpecialBox, PlaceholderExt } from '@flexiui/svelte-rich-text';

  let editor = $state(null);
  let json = $state(null);
  let html = $state(null);

  let customExtensions = [
    SpecialBox,
    PlaceholderExt.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "h1") {
          return "Introduce un título";
        } else if (node.type.name === "paragraph") {
          return "Escribe algo...";
        }
      }
    })
  ];

  function handleEditorCreate(e) {
    editor = e.editor;
  }

  function handleEditorUpdate(e) {
    const { editor, html: editorHtml, json: editorJson } = e;
    json = editorJson;
    html = editorHtml;
  }
</script>

<RichText
  nodesLimit={10}
  uniqueH1={true}
  semanticHeadings={true}
  config={{
    editorAccentColor: "#6366f1",
    editorBgColor: "#1e1e1e",
    toolbarBgColor: "#2d2d2d",
    buttonStyle: "accent-solid"
  }}
  toolbarConfig={[
    [{ type: "undo" }, "redo"],
    [{ type: "headings" }, { type: "lists" }],
    ["codeBlock", "blockquote"],
    ["fontSize", "lineHeight"],
    ["textAlignLeft", "textAlignCenter", "textAlignRight"],
  ]}
  {customExtensions}
  editorEvents={{
    onCreate: handleEditorCreate,
    onUpdate: handleEditorUpdate
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | `'fl-rich-text-editor'` | Unique identifier for the editor |
| `className` | `string` | `''` | CSS class for the component container |
| `editable` | `boolean` | `true` | Whether the editor is editable |
| `content` | `string \| { type: string; content: any[] } \| null` | `null` | Initial content (HTML string or Tiptap JSON) |
| `nodesLimit` | `number` | `undefined` | Maximum number of top-level nodes allowed |
| `limitWarningMessage` | `string` | `undefined` | Custom warning message when limit is reached |
| `showToolbar` | `boolean` | `true` | Whether to show the toolbar |
| `semanticHeadings` | `boolean` | `false` | Use semantic heading structure |
| `uniqueH1` | `boolean` | `false` | Allow only one H1 heading (converts extras to paragraphs) |
| `toolbarConfig` | `ToolbarConfig` | `undefined` | Custom toolbar configuration |
| `customExtensions` | `any[]` | `[]` | Custom Tiptap extensions |
| `editorEvents` | `EditorEvents` | `{}` | Event handlers for editor events |
| `config` | `EditorConfig` | `{}` | Visual configuration options |

## Editor Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `onTransaction` | `{ editor, transaction }` | Triggered on any editor transaction |
| `onBeforeCreate` | `{ editor }` | Triggered before editor initialization |
| `onCreate` | `{ editor }` | Triggered after editor is created |
| `onUpdate` | `{ editor, html, json }` | Triggered when content changes |
| `onFocus` | `{ editor, event }` | Triggered when editor receives focus |
| `onBlur` | `{ editor, event }` | Triggered when editor loses focus |
| `onDestroy` | `{ editor, message }` | Triggered when editor is destroyed |
| `onDrop` | `{ editor, event, slice, moved }` | Triggered when content is dropped |
| `onDelete` | `{ editor, type, deletedRange, newRange, partial, from, to }` | Triggered when content is deleted |
| `onContentError` | `{ editor, error, disableCollaboration }` | Triggered on content schema error |
| `onSelectionUpdate` | `{ editor }` | Triggered when selection changes |
| `onPaste` | `{ event, slice }` | Triggered when content is pasted |

## Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editorAccentColor` | `string` | `'var(--purple)'` | Primary accent color for UI elements |
| `editorBgColor` | `string` | `'transparent'` | Editor background color |
| `editorRadius` | `string` | `'12px'` | Border radius for editor container |
| `toolbarStickyPosition` | `number` | `0` | CSS `top` value for sticky toolbar |
| `toolbarZIndex` | `number` | `10` | Z-index of the toolbar |
| `toolbarBgColor` | `string` | `'#242424'` | Toolbar background color |
| `toolbarTextColor` | `string` | `'currentColor'` | Toolbar text color |
| `toolbarPadding` | `string` | `'8px'` | Toolbar padding |
| `toolbarGap` | `string` | `'5px'` | Gap between toolbar buttons |
| `docMaxWidth` | `string` | `'1032px'` | Maximum width of document content |
| `docPadding` | `string` | `'2rem'` | Document padding |
| `docBg` | `string` | `'transparent'` | Document background |
| `docMarginInline` | `string` | `'auto'` | Horizontal margin |
| `docMarginBlock` | `string` | `'2rem'` | Vertical margin |
| `docRadius` | `string` | `'0'` | Document border radius |
| `docTextColor` | `string` | `'currentColor'` | Document text color |
| `buttonStyle` | `'accent-soft' \| 'accent-solid'` | `'accent-solid'` | Button style variant |

## Toolbar Configuration

### Available Button Types

- **Navigation**: `undo`, `redo`
- **Headings**: `headings` (dropdown), `lists` (dropdown)
- **Text Formatting**: `codeBlock`, `blockquote`
- **Text Style**: `fontSize`, `lineHeight`
- **Block Elements**: `horizontalRule`, `hardBreak`
- **Media**: `inlineMath`, `image`, `audio`, `mediaGrid`, `table`
- **Alignment**: `textAlignLeft`, `textAlignCenter`, `textAlignRight`, `clearFormatting`, `clearNodes`

### Toolbar Types

#### Button (string)

Simple button represented as a string:

```ts
"undo"
"redo"
"codeBlock"
```

#### Button with Options (object)

Button with custom configuration:

```ts
{ type: "undo" }
{ type: "redo", tooltip: "Custom tooltip" }
```

#### Dropdown (select)

Dropdown menu with multiple options:

```ts
{
  select: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  name: 'headings-dropdown'
}
```

### ToolbarConfig Type

```ts
type ToolbarButton = string | {
  type?: string;
  tooltip?: string;
  icon?: string;
  name?: string;
};

type ToolbarSelect = {
  select: ToolbarButton[];
  name?: string;
  tooltip?: string;
  icon?: string;
  type?: string;
};

type ToolbarItem = ToolbarButton | ToolbarSelect;
type ToolbarConfig = ToolbarItem[] | ToolbarItem[][];
```

### Examples

#### Simple Toolbar

```svelte
<RichText
  toolbarConfig={[
    ["undo", "redo"],
    ["bold", "italic", "underline"]
  ]}
/>
```

#### Grouped Toolbar

```svelte
<RichText
  toolbarConfig={[
    [{ type: "undo" }, "redo"],           // Group 1
    [{ type: "headings" }],              // Group 2
    ["codeBlock", "blockquote"],         // Group 3
    ["bold", "italic", "underline"]      // Group 4
  ]}
/>
```

#### Full Custom Toolbar

```svelte
<RichText
  toolbarConfig={[
    [{ type: "undo" }, "redo"],
    [{ type: "headings" }, { type: "lists" }],
    ["codeBlock", "blockquote"],
    ["fontSize", "lineHeight"],
    ["horizontalRule", "hardBreak"],
    ["inlineMath"],
    ["image", "audio"],
    ["mediaGrid", "table"],
    ["textAlignLeft", "textAlignCenter", "textAlignRight", "clearFormatting", "clearNodes"],
  ]}
/>
```

## Node Limit Feature

When `nodesLimit` is set, the editor:

1. Shows a warning message when the user tries to add more nodes than allowed
2. Displays a bottom bar with current node count and limit
3. Prevents adding new nodes via Enter key when limit is reached

### Custom Warning Message

```svelte
<RichText
  nodesLimit={5}
  limitWarningMessage="Has alcanzado el límite máximo de 5 elementos."
/>
```

## Unique H1 Feature

When `uniqueH1` is enabled:

1. The first H1 heading remains as H1
2. Any additional H1 headings are automatically converted to paragraphs
3. This ensures semantic HTML structure with only one H1 per document

## Default Toolbar

If no `toolbarConfig` is provided, the default toolbar is used:

```svelte
[
  [{ type: "undo" }, "redo"],
  [{ type: "headings" }, { type: "lists" }],
  ["codeBlock", "blockquote"],
  ["fontSize", "lineHeight"],
  ["horizontalRule", "hardBreak"],
  ["inlineMath"],
  ["image", "audio"],
  ["mediaGrid", "table"],
  ["textAlignLeft", "textAlignCenter", "textAlignRight", "clearFormatting", "clearNodes"],
]
```

## Output

The editor provides two output formats:

### HTML Output

```svelte
function handleUpdate(e) {
  const { html } = e;
  // html: "<h1>Hello</h1><p>World</p>"
}
```

### JSON Output

```svelte
function handleUpdate(e) {
  const { json } = e;
  // json: { type: "doc", content: [...] }
}
```

## Static Rendering

You can also render the content statically using `renderHTMLFromJSON`:

```svelte
<script lang="ts">
  import { renderHTMLFromJSON } from '@flexiui/svelte-rich-text';

  let json = { type: "doc", content: [...] };
  let html = renderHTMLFromJSON({ json });
</script>

{@html html}
```

## License

MIT
