# `@flexiui/svelte-json-tree`

A lightweight and flexible Svelte component that renders JSON data as an interactive tree view with syntax highlighting and collapsible nodes

## Instalation

With NPM:

```bash
npm install @flexiui/svelte-json-tree
```

With Yarn:

```bash
yarn add @flexiui/svelte-json-tree
```

## Usage

Once installed, you can use the `JSONTree` component in your Svelte application.

```svelte
<script>
  import { JSONTree } from '@flexiui/svelte-json-tree';
  
  const data = {
    name: 'John Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345'
    },
    settings: {
      isActive: true,
      color: 'yellow',
      language: 'JavaScript',
      skills: ['HTML', 'CSS', 'JavaScript'],
      languages: {
        html: 'HTML',
        css: 'CSS',
        js: 'JavaScript'
      }
    }
  }
</script>

<JSONTree 
id="json-tree-example"
className="json-tree-viewer-example" 
{data} 
defaultExpandedLevels={2} 
showRoot={true} 
/>
```

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `string` | The data to be displayed in the JSON tree viewer. **Required**.
| `defaultExpandedLevels` | `number` | The default number of levels to expand when the JSON tree viewer loads. Default is `2`.
| `showRoot` | `boolean` | Whether to show the root node of the JSON tree viewer. Default is `true`.
| `id` | `string` | The identifier of the JSON tree viewer.
| `className` | `string` | Custom CSS class name for the JSON tree viewer.
