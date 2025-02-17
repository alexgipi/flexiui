---
title: '@flexiui/svelte-quote'
author: 'alexgipi'
---

## Instalación

Para instalar el componente `Quote` en tu proyecto de Angular, puedes usar npm o yarn.

Con npm:

```bash
npm install @flexiui/ngx-quote
```

Con yarn:

```bash
yarn add @flexiui/ngx-quote
```

## Uso

Una vez instalado, puedes usar el selector `flexiui-quote` en tu aplicación de Angular.

```html
<flexiui-quote
[className]="'my-quote'"
[id]="'flexi-quote'"
[bgColor]="'transparent'"
[editable]="true"
[(content)]="quoteValue"
(focusEvent)="handleFocus($event)"
(keydownEvent)="handleKeyDown($event)"
(contentChange)="handleChange($event)"
>
</flexiui-quote>
```