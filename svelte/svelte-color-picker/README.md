# ColorPicker

Un componente de selector de color flexible y accesible para Svelte 5.

## Instalación

```bash
npm install @flexiui/svelte-color-picker
```

## Requisitos

- Svelte 5
- [bits-ui](https://bits-ui.com/) (peer dependency)
- Tailwind CSS

## Uso Básico

Por defecto, el ColorPicker renderiza un trigger automático con el swatch y el valor del color. No es necesario pasar ningún children:

```svelte
<script>
  import { ColorPicker } from '@flexiui/svelte-color-picker';
  
  let color = $state('#3b82f6');
</script>

<ColorPicker bind:value={color} />
```

Si necesitas personalizar el trigger, puedes usar `ColorPickerTrigger` y `ColorPickerSwatch` como children:

```svelte
<script>
  import { ColorPicker, ColorPickerTrigger, ColorPickerSwatch } from '@flexiui/svelte-color-picker';
  
  let color = $state('#3b82f6');
</script>

<ColorPicker bind:value={color}>
  <ColorPickerTrigger>
    <ColorPickerSwatch />
    <span>Seleccionar color</span>
  </ColorPickerTrigger>
</ColorPicker>
```

## Props

### ColorPicker

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | `''` | Valor del color (two-way binding) |
| `defaultFormat` | `'hex' \| 'rgb' \| 'hsl' \| 'hsb'` | `'hex'` | Formato de color por defecto |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| 'hsb'` | `undefined` | Formato controlado (cuando se especifica, el usuario no puede cambiarlo) |
| `onFormatChange` | `(format: ColorFormat) => void` | `undefined` | Callback cuando cambia el formato |
| `disabled` | `boolean` | `false` | Deshabilita el componente |
| `readOnly` | `boolean` | `false` | Permite solo lectura |
| `defaultOpen` | `boolean` | `false` | Abre el popover por defecto |
| `open` | `boolean` | `undefined` | Controla el estado abierto/cerrado (two-way binding) |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback cuando cambia el estado abierto |
| `rtl` | `'ltr' \| 'rtl'` | `'ltr'` | Dirección del texto |
| `class` | `string` | `undefined` | Clases CSS adicionales |
| `onChange` | `(value: ColorPickerChange) => void` | `undefined` | Callback cuando cambia el color |

### ColorPickerChange

El callback `onChange` recibe un objeto con todos los formatos:

```ts
interface ColorPickerChange {
  hex: string;        // "#3b82f6"
  rgb: string;        // "rgb(59 130 246 / 100)"
  hsl: string;        // "hsl(217deg 91% 60% / 100%)"
  hsb: string;       // "hsba(217%, 91%, 96%, 1)"
  alpha: number;     // 100
}
```

### ColorPickerTrigger

| Prop | Tipo | Descripción |
|------|------|-------------|
| `class` | `string` | Clases CSS adicionales |
| `children` | `Snippet` | Contenido a renderizar dentro del trigger |

### ColorPickerSwatch

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `class` | `string` | `undefined` | Clases CSS adicionales |
| `showAlpha` | `boolean` | `false` | Muestra patrón de transparencia cuando alpha < 100 |
| `value` | `string` | `undefined` | Valor del color (two-way binding) |

## Eventos

### onChange

```svelte
<script>
  function handleChange(details) {
    console.log(details.hex);      // "#3b82f6"
    console.log(details.rgb);      // "rgb(59 130 246 / 100)"
    console.log(details.hsl);     // "hsl(217deg 91% 60% / 100%)"
    console.log(details.alpha);   // 100
  }
</script>

<ColorPicker bind:value={color} onChange={handleChange} />
```

### onFormatChange

```svelte
<script>
  function handleFormatChange(format) {
    console.log(format); // "hex", "rgb", "hsl" o "hsb"
  }
</script>

<ColorPicker 
  bind:value={color} 
  onFormatChange={handleFormatChange} 
/>
```

### onOpenChange

```svelte
<script>
  let isOpen = $state(false);
  
  function handleOpenChange(open) {
    isOpen = open;
    console.log(open ? 'Abierto' : 'Cerrado');
  }
</script>

<ColorPicker 
  bind:open={isOpen} 
  onOpenChange={handleOpenChange} 
/>
```

## Ejemplos

### Formato controlado

```svelte
<ColorPicker 
  bind:value={color} 
  format="rgb" 
/>
```

### Color inicial y callback

```svelte
<script>
  let color = $state('#ff5733');
  
  function handleChange(details) {
    console.log('Nuevo color:', details.hex);
  }
</script>

<ColorPicker 
  bind:value={color} 
  onChange={handleChange} 
  defaultFormat="hsl"
/>
```

### Deshabilitado

```svelte
<ColorPicker bind:value={color} disabled />
```

### Popover controlado externamente

```svelte
<script>
  let color = $state('#3b82f6');
  let isOpen = $state(false);
</script>

<button onclick={() => isOpen = !isOpen}>
  {isOpen ? 'Cerrar' : 'Abrir'}
</button>

<ColorPicker bind:value={color} bind:open={isOpen} />
```

### RTL

```svelte
<ColorPicker bind:value={color} rtl="rtl" />
```

### Custom trigger con múltiples elementos

```svelte
<ColorPicker bind:value={color}>
  <ColorPickerTrigger class="flex items-center gap-2 px-4 py-2 border rounded">
    <ColorPickerSwatch />
    <span class="text-sm font-medium">Color: {color}</span>
  </ColorPickerTrigger>
</ColorPicker>
```

### Con soporte alpha

```svelte
<ColorPicker bind:value={color}>
  <ColorPickerTrigger>
    <ColorPickerSwatch showAlpha={true} />
    {color}
  </ColorPickerTrigger>
</ColorPicker>
```

## Formatos de Color

El componente trabaja internamente en HSV y convierte automáticamente entre formatos:

| Formato | Ejemplo de salida |
|---------|-------------------|
| `hex` | `#3b82f6` |
| `rgb` | `rgb(59 130 246 / 100)` |
| `hsl` | `hsl(217deg 91% 60% / 100%)` |
| `hsb` | `hsba(217%, 91%, 96%, 1)` |

## Accesibilidad

- Soporte completo de teclado
- Roles ARIA apropiados (`slider` para el área de color)
- Etiquetas ARIA para lectores de pantalla
- Compatible con [Eye Dropper API](https://caniuse.com/mdn-api_eyedropper) para muestreo de color del sistema

## Personalización

### Con Tailwind

```svelte
<ColorPicker bind:value={color}>
  <ColorPickerTrigger>
    <ColorPickerSwatch class="w-8 h-8 rounded-full shadow-lg" />
  </ColorPickerTrigger>
</ColorPicker>
```

### Con CSS personalizado

```svelte
<ColorPicker class="custom-color-picker">
  <!-- Las clases se aplican al contenido del popover -->
</ColorPicker>
```

## TypeScript

```ts
import type { ColorPickerChange } from '@flexiui/svelte-color-picker';

function handleChange(details: ColorPickerChange) {
  // details: { hex, rgb, hsl, hsb, alpha }
}
```
