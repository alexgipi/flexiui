# AGENTS.md - Proyecto svelte-rich-text

## Estructura del Proyecto

```
src/
├── lib/
│   ├── RichText.svelte          # Componente principal
│   ├── index.ts                 # Exports públicos
│   ├── getExtensions.ts         # Configuración de extensiones Tiptap
│   ├── renderRichText.ts       # Renderizado estático
│   ├── utils.ts                 # Utilidades
│   ├── styles.css               # Estilos globales
│   ├── audioStore.ts            # Stores de audio
│   ├── svelte-tiptap-extends/  # Extensiones personalizadas de svelte-tiptap
│   │   ├── EditorContent.svelte
│   │   ├── Editor.ts
│   │   └── types.ts
│   ├── extensions/              # Extensiones Tiptap personalizadas
│   │   ├── Audio.ts
│   │   ├── Placeholder.ts
│   │   ├── SpecialBox.ts
│   │   ├── EnhancedLink.ts
│   │   ├── SemanticHeadings.ts
│   │   ├── NodeFontSize.ts
│   │   ├── NodeLineHeight.ts
│   │   ├── MediaGrid/
│   │   └── Table/
│   └── Toolbar/                 # Componentes de toolbar
│       ├── RenderToolbarButton.svelte
│       ├── toolbar-utils.ts
│       ├── action-buttons/      # Botones de acción (marks y nodes)
│       ├── dropdown-buttons/    # Dropdowns
│       ├── dropdowns/
│       └── bubble-menus/
├── App.svelte                   # Demo principal
└── app.css
```

## Convenciones de Código

### Svelte Components
- Usar **Svelte 5 runes** (`$state`, `$props`, `$derived`)
- Usar `<script lang="ts" generics="...">` para componentes genéricos
- Exportar interfaces de Props, no usar `export let`
- Usar `$props()` con destructuring y valores por defecto

```svelte
<script lang="ts" generics="T extends keyof SvelteHTMLElements = 'div'">
  import type { SvelteHTMLElements } from 'svelte/elements';
  
  interface Props {
    id?: string;
    className?: string;
  }
  
  let { id = 'default-id', className = '', ...rest }: Props = $props();
</script>
```

### Extensiones Tiptap
- Crear extensiones en `src/lib/extensions/`
- Usar `extend()` para personalizar extensiones existentes
- Declarar tipos con `declare module '@tiptap/core'`

```ts
import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    myExtension: {
      myCommand: () => ReturnType;
    };
  }
}

export const MyExtension = Extension.create({
  name: 'myExtension',
  addCommands() {
    return {
      myCommand: () => ({ commands }) => commands.toggleNode(...)
    };
  },
});
```

### Toolbar Buttons
- Ubicación: `src/lib/Toolbar/action-buttons/`
- Separar marks de nodes: `marks/`, `nodes/`
- Usar archivos individuales por botón
- Consumir editor desde contexto o props

### Exports Públicos
- Definir en `src/lib/index.ts`
- Exportar: componentes, extensiones útiles, utilerías de renderizado

## Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build + svelte-package
npm run preview  # Preview del build
```

## Reglas de Contribución

1. **No agregar comentarios** excepto que sea necesario para explicar lógica compleja
2. Usar **TypeScript** en todo el código
3. Las extensiones personalizadas van en `src/lib/extensions/`
4. Los botones del toolbar van en `src/lib/Toolbar/action-buttons/`
5. Siempre hacer **build** antes de commitear cambios
6. Los estilos van en CSS (no usar Tailwind a menos que sea necesario para demos)
