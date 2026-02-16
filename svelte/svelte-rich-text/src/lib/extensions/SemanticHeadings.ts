import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    semanticHeadings: {
      canInsertHeading: (level: number) => ReturnType;
      getAllowedHeadingLevels: () => ReturnType;
    };
  }
}

export const SemanticHeadings = Extension.create({
  name: 'semanticHeadings',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('semanticHeadings'),
        
        appendTransaction(transactions, oldState, newState) {
          // Solo validar si hubo cambios en el documento
          if (!transactions.some(tr => tr.docChanged)) {
            return null;
          }

          const doc = newState.doc;
          let headings: Array<{ level: number; pos: number }> = [];
          let h1Count = 0;
          
          // Recolectar todos los headings en orden
          doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
              headings.push({
                level: node.attrs.level,
                pos: pos
              });
              
              if (node.attrs.level === 1) {
                h1Count++;
              }
            }
          });

          // Solo puede haber un h1
          if (h1Count > 1) {
            return oldState.tr; // Revertir
          }

          // Si no hay headings, todo está bien
          if (headings.length === 0) {
            return null;
          }

          // Validar la jerarquía
          for (let i = 0; i < headings.length; i++) {
            const { level } = headings[i];
            
            // El primer heading debe ser h1
            if (i === 0 && level !== 1) {
              return oldState.tr; // Revertir
            }
            
            if (i > 0) {
              const prevLevel = headings[i - 1].level;
              
              // Solo puede:
              // - Mantener el mismo nivel (excepto h1)
              // - Retroceder a cualquier nivel superior (menor número, excepto h1 si ya existe)
              // - Profundizar solo un nivel (prevLevel + 1)
              const isValid = 
                (level === prevLevel && level !== 1) ||  // Mismo nivel (pero no h1)
                (level < prevLevel && !(level === 1 && h1Count > 0)) || // Retroceder (pero no a h1 si ya existe)
                level === prevLevel + 1;                 // Profundizar un nivel
              
              if (!isValid) {
                return oldState.tr; // Revertir
              }
            }
          }

          return null; // Todo correcto
        }
      })
    ];
  },

  addCommands() {
    return {
      canInsertHeading: (level: number) => ({ state }) => {
        const doc = state.doc;
        let lastHeadingLevel: number | null = null;
        let hasH1 = false;

        // Buscar el último heading y verificar si ya existe h1
        doc.descendants((node) => {
          if (node.type.name === 'heading') {
            lastHeadingLevel = node.attrs.level;
            if (node.attrs.level === 1) {
              hasH1 = true;
            }
          }
        });

        // Si no hay headings, solo se permite h1
        if (lastHeadingLevel === null) {
          return level === 1;
        }

        // No permitir h1 si ya existe uno
        if (level === 1 && hasH1) {
          return false;
        }

        // Permitir:
        // - Mismo nivel que el último (excepto h1)
        // - Cualquier nivel superior (retroceder, excepto h1 si ya existe)
        // - Un nivel más profundo
        return (
          (level === lastHeadingLevel && level !== 1) ||  // Mismo nivel
          (level < lastHeadingLevel && !(level === 1 && hasH1)) || // Retroceder
          level === lastHeadingLevel + 1                   // Profundizar uno
        );
      },

      getAllowedHeadingLevels: () => ({ state }) => {
        const doc = state.doc;
        let lastHeadingLevel: number | null = null;
        let hasH1 = false;

        doc.descendants((node) => {
          if (node.type.name === 'heading') {
            lastHeadingLevel = node.attrs.level;
            if (node.attrs.level === 1) {
              hasH1 = true;
            }
          }
        });

        if (lastHeadingLevel === null) {
          return [1]; // Solo h1 permitido
        }

        const allowed: number[] = [];
        
        // Permitir todos los niveles desde h2 (o h1 si no existe) hasta el último
        const startLevel = hasH1 ? 2 : 1;
        for (let i = startLevel; i <= lastHeadingLevel; i++) {
          allowed.push(i);
        }
        
        // Permitir también el siguiente nivel (si no es mayor que 6)
        if (lastHeadingLevel < 6) {
          allowed.push(lastHeadingLevel + 1);
        }
        
        return allowed;
      }
    };
  }
});