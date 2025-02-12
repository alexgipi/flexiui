# @flexiui/svelte-cssvars

Un componente para Svelte que facilita la creación y gestión de variables CSS de manera cómoda, eficiente y personalizable. Permite definir, editar y visualizar variables dinámicamente, con opciones como validación, valores predeterminados, labels en múltiples idiomas, y una serie de campos predefinidos para facilitar la edición de variables.

## Instalación

Para instalar el componente `CSSVars` en tu proyecto de Svelte, puedes usar npm o yarn.

Con npm:

```bash
npm install @flexiui/svelte-cssvars
```

Con yarn:

```bash
yarn add @flexiui/svelte-cssvars
```

## Uso

Una vez instalado, puedes usar el componente `TagsInput` en tu aplicación de Svelte.

```svelte
<script>
  import CSSVars from '@flexiui/svelte-cssvars';
  let field = {
    labels: {
      plural: 'CSS Variables',
      singular: 'CSS Variable',
    }
  };
</script>

<CSSVars 
    name="tags" 
    field={field}
    labels={field.labels}
    tags={[]} 
    min={1} 
    max={20} 
    allowDuplicates={false} 
    placeholder={"Presiona 'Enter' para añadir una variable"}
    required={false} />
```