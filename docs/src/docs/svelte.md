---
title: '@flexiui/svelte-quote'
author: 'alexgipi'
---

## Instalación

Para instalar el componente `Quote` en tu proyecto de Svelte, puedes usar npm o yarn.

Con npm:

```bash
npm install @flexiui/svelte-quote
```

Con yarn:

```bash
yarn add @flexiui/svelte-quote
```

## Uso básico del componente

Una vez instalado, puedes usar el componente `Quote` en tu aplicación de Svelte.

```svelte
<script>
  import { Quote } from '@flexiui/svelte-quote';
  let content = `This is a quote component example with editable mode enabled.`
</script>

<Quote
className="my-quote"
id="my-quote-id"
bgColor="transparent" 
bind:value={content}
>
</Quote>
```

## Modo Editable y Eventos

En el modo editable, el componente dispara una serie de eventos que se pueden utilizar para interactuar y responder a las acciones del usuario. Además, mediante `bind:` es posible vincular el contenido del componente a una variable en el script, permitiendo una sincronización automática.

```svelte
<script>
  import { Quote } from '@flexiui/svelte-quote';
  let content = `This is a quote component example with editable mode enabled.`;

  function handleFocus(e: any) {
    console.log('Focus event');
    console.log(e);
  }

  function handleKeyDown(e: any) {
    console.log('Keydown event');
    console.log(e);
  }

  function handleInput(e: any) {
    console.log('Input event');
    console.log(e);
  }
</script>

<Quote
className="my-quote"
id="my-quote-id"
bgColor="transparent" 
editable={true}
bind:value={content}
on:focus={handleFocus}
on:keydown={handleKeyDown}
on:input={handleInput}
>
</Quote>
```

### Eventos disponibles

- **`on:focus`**: Se dispara cuando el componente recibe el foco.
- **`on:keydown`**: Se dispara al presionar una tecla mientras el componente está enfocado.
- **`on:input`**: Se dispara cada vez que el usuario realiza cambios en el contenido del componente.

### Vinculaciones (`bind:`)

- **`bind:value`**: Permite sincronizar el contenido editable del componente con una variable externa (en este caso, `content`). Cualquier cambio en el contenido del componente actualizará esta variable, y cualquier cambio en la variable actualizará el contenido del componente.
