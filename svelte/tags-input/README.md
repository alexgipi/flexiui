# `@flexiui/svelte-tags-input`

Un componente de entrada de etiquetas para Svelte. Permite la adición, eliminación y visualización de etiquetas dinámicamente, con opciones de personalización como el número mínimo y máximo de etiquetas, duplicados permitidos y un diseño bidimensional.

## Instalación

Para instalar el componente `TagsInput` en tu proyecto de Svelte, puedes usar npm o yarn.

Con npm:

```bash
npm install @flexiui/svelte-tags-input
```

Con yarn:

```bash
yarn add @flexiui/svelte-tags-input
```

## Uso

Una vez instalado, puedes usar el componente `TagsInput` en tu aplicación de Svelte.

```svelte
<script>
  import TagsInput from '@flexiui/svelte-tags-input';
  let field = {
    labels: {
      plural: 'Etiquetas',
      singular: 'Etiqueta'
    }
  };
</script>

<TagsInput 
    name="tags" 
    field={field}
    labels={field.labels}
    tags={[]} 
    min={1} 
    max={3} 
    allowDuplicates={false} 
    bidimensional={true}
    bidimensionalSeparator='->' 
    placeholder={'Presiona enter para agregar una nueva etiqueta'} 
    required={false} />
```

### Propiedades del Componente

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `name` | `string` | El nombre del campo para el componente de etiquetas. |
| `field` | `object` | Objeto que contiene los datos del campo, como las etiquetas. |
| `labels` | `object` | Objeto con las etiquetas `plural` y `singular` que se utilizan para describir las etiquetas en el componente. |
| `tags` | `array` | Lista de etiquetas actualmente seleccionadas o ingresadas. |
| `min` | `number` | Número mínimo de etiquetas permitidas. |
| `max` | `number` | Número máximo de etiquetas permitidas. |
| `allowDuplicates` | `boolean` | Si se permiten etiquetas duplicadas. |
| `bidimensional` | `boolean` | Si las etiquetas deben mostrarse en un diseño bidimensional. |
| `bidimensionalSeparator` | `string` | El separador entre los elementos bidimensionales, utilizado cuando `bidimensional` es `true`. |
| `placeholder` | `string` | El texto de marcador de posición en el campo de entrada. |
| `required` | `boolean` | Indica si el campo es obligatorio. |

### Ejemplo de Uso

#### 1\. Ejemplo básico

```svelte
<script>
  import TagsInput from '@flexiui/svelte-tags-input';
  let field = {
    labels: {
      plural: 'Etiquetas',
      singular: 'Etiqueta'
    }
  };
</script>

<TagsInput 
    name="tags" 
    field={field}
    labels={field.labels}
    tags={[]} 
    min={1} 
    max={5} 
    allowDuplicates={false} 
    bidimensional={false} 
    placeholder="Presiona enter para agregar una nueva etiqueta" 
    required={true} />
```

#### 2\. Ejemplo con diseño bidimensional

Cuando el diseño es bidimensional, las etiquetas se muestran en una estructura más compleja (como una matriz o grilla). Puedes personalizar el separador entre las etiquetas bidimensionales.

```svelte
<script>
  import TagsInput from '@flexiui/svelte-tags-input';
  let field = {
    labels: {
      plural: 'Etiquetas',
      singular: 'Etiqueta'
    }
  };
</script>

<TagsInput 
    name="tags" 
    field={field}
    labels={field.labels}
    tags={[]} 
    min={1} 
    max={5} 
    allowDuplicates={false} 
    bidimensional={true} 
    bidimensionalSeparator="->" 
    placeholder="Presiona enter para agregar una nueva etiqueta" 
    required={true} />
```

### Propiedades de `field`

El objeto `field` contiene las propiedades `labels`, que se estructuran de la siguiente forma:

```javascript
let field = {
  labels: {
    singular: 'Etiqueta',
    plural: 'Etiquetas'
  }
};
```

- **`singular`**: El nombre de la etiqueta en singular.
- **`plural`**: El nombre de la etiqueta en plural.

Este objeto se utiliza para representar las etiquetas en el componente, permitiendo una mayor flexibilidad para adaptar el lenguaje a las necesidades de tu aplicación.

### Propiedades adicionales

- **`min`**: Define el número mínimo de etiquetas permitidas. Si no se alcanza este número, el componente puede mostrar un mensaje de error.
- **`max`**: Define el número máximo de etiquetas permitidas. Si se excede este número, el componente puede deshabilitar la opción de agregar más etiquetas.
- **`allowDuplicates`**: Si se establece en `false`, se evitará que el usuario ingrese etiquetas duplicadas.
- **`bidimensional`**: Si se establece en `true`, las etiquetas se visualizarán en un formato bidimensional (como una matriz). El `bidimensionalSeparator` definirá cómo se separan las etiquetas en este formato.

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

### Contribuciones

Si deseas contribuir a este proyecto, puedes hacerlo mediante un **Pull Request** en el repositorio de GitHub. Por favor, sigue las mejores prácticas y asegúrate de que tu código pase las pruebas antes de hacer un PR.

### Licencia

Este proyecto está bajo la licencia **MIT**.

<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=4f8c847e-11a2-45a1-900d-96d1168f302e" />