<br/>
<p align="center">
  <img src="https://raw.githubusercontent.com/withastro/astro/HEAD/.github/assets/banner.jpg" alt="Build the web you want">
  <br/><br/>
  <a href="https://astro.build">Astro</a> is the all-in-one web framework designed for speed.
  <br/>
  Pull your content from anywhere and deploy everywhere, all powered by your favorite UI components and libraries.
  <br/><br/>
</p>

Un componente de cita, 'Quote' o 'Blockquote' para Svelte.
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

## Uso

Una vez instalado, puedes usar el componente `Quote` en tu aplicación de Svelte.

```svelte
<script>
  import { Quote } from '@flexiui/svelte-quote';
  let content = `This is a quote component example with editable mode enabled.`
</script>

<Quote
className="my-quote"
id="flexi-quote"
bgColor="transparent" 
editable={true}
bind:value={content}
on:focus={handleFocus}
on:keydown={handleKeyDown}
on:input={handleInput}
>
</Quote>
```