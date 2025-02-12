# `@flexiui/svelte-prism-code-editor`

A lightweight and flexible Svelte component that wraps Prism Code Editor, providing syntax highlighting with ease of integration

## Instalación

Para instalar el componente `PrismCodeEditor` en tu proyecto de Svelte, puedes usar npm o yarn.

Con npm:

```bash
npm install @flexiui/svelte-prism-code-editor
```

Con yarn:

```bash
yarn add @flexiui/svelte-prism-code-editor
```

## Uso

Una vez instalado, puedes usar el componente `TagsInput` en tu aplicación de Svelte.

```svelte
<script lang="ts">
  import { PrismCodeEditor } from '@flexiui/svelte-prism-code-editor';
  
  let value = null; // If value is null provides a sample code
  
  function onUpdate(e){
    const { eventType, code } = e.detail;

    if(eventType === 'update'){
        value = code;
    }
  }
</script>

<PrismCodeEditor 
on:update={e => onUpdate(e)}
language="css" 
id="example-code-editor" 
{value}
className='no-drag'
/>
```

### Propiedades del Componente

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `language` | `string` | El lenguaje de sintaxis del editor de código. | 
| `id` | `string` | El identificador del editor de código.
| `value` | `string` | El valor del editor de código.
| `className` | `string` | Clase de CSS personalizada del editor de código.

### Eventos

| Evento | Tipo | Descripción |
| --- | --- | --- |
| `update` | `{ eventType: 'update', code: string }` | Se emite cuando el código se actualiza.

### Personalización

Puedes personalizar aún más el comportamiento del componente mediante el uso de estilos CSS. Los estilos predeterminados pueden ser sobreescritos fácilmente mediante clases CSS.

#### Ejemplo de estilos

```css
/* Puedes personalizar los estilos en tu propio archivo CSS */
.tag-input {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 10px;
}

.tag-input .tag {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  background-color: #007bff;
  color: white;
  border-radius: 3px;
}
```

### Referencias/Creditos
 - [Prism Code Editor](https://github.com/FIameCaster/prism-code-editor)

### Contribuciones

Si deseas contribuir a este proyecto, puedes hacerlo mediante un **Pull Request** en el repositorio de GitHub. Por favor, sigue las mejores prácticas y asegúrate de que tu código pase las pruebas antes de hacer un PR.

### Licencia

Este proyecto está bajo la licencia **MIT**.