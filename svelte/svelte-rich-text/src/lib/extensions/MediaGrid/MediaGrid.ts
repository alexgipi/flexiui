import { Node, mergeAttributes } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';

import MediaGridComponent from './MediaGrid.svelte';

interface InsertGridOptions {
  cols?: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    MediaGridComponent: {
      /**
       * Añade un elemento de audio personalizado
       * @example
       * editor.commands.setAudio({ src: '/audio.mp3', controls: true })
       */
      insertGrid: (options?: InsertGridOptions) => ReturnType,
      addGridItem: () => ReturnType,
    }
  }
}

export const MediaGridExtension = Node.create({
  name: 'MediaGridComponent',
  group: 'block',
  content: 'gridItem+',
  defining: true,

  addAttributes() {
    return {
      class: {
        default: "fl-media-grid",
        parseHTML: element => element.getAttribute('class') || null,
        renderHTML: attributes => {
          if (!attributes.class) return {}
          return { class: attributes.class }
        },
      },
      cols: {
        default: 2,
        parseHTML: element => {
          return element.dataset.cols
        },
        renderHTML: attrs => ({ 'data-cols': attrs.cols }),
      },
      gap: {
        default: '1rem',
        parseHTML: element => element.dataset.gap,
        renderHTML: attrs => ({ 'data-gap': attrs.gap }),
      },
      showIndicator: {
        default: false,
        parseHTML: element => element.dataset.showIndicator,
        renderHTML: attrs => ({ 'data-show-indicator': attrs.showIndicator }),
      },
      indicatorType: {
        default: 'numeric', // 'numeric' | 'alphabetic'
        parseHTML: element => element.dataset.indicatorType,
        renderHTML: attrs => ({ 'data-indicator-type': attrs.indicatorType }),
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'media-grid-component',
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['media-grid-component', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      insertGrid:
        (options?: { cols?: number }) =>
          ({ tr, state, dispatch }) => {
            const { schema } = state
            const cols = options?.cols || 2

            const items = Array.from({ length: cols }, () =>
              schema.nodes.gridItem.create()
            )

            const grid = this.type.create({ cols }, items)

            if (dispatch) {
              tr.replaceSelectionWith(grid).scrollIntoView()
              dispatch(tr)
            }

            return true
          },

      addGridItem:
        () =>
          ({ tr, state, dispatch }) => {
            const { schema, selection } = state
            const { $from } = selection

            for (let depth = $from.depth; depth > 0; depth--) {
              const node = $from.node(depth)
              if (node.type.name === this.name) {
                if (dispatch) {
                  const pos = $from.end(depth) - 1
                  const gridItem = schema.nodes.gridItem.create()
                  tr.insert(pos, gridItem).scrollIntoView()
                  dispatch(tr)
                }
                return true
              }
            }

            return false
          },
    }
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor
        const { $from } = state.selection

        let gridPos: number | null = null
        let gridNode = null
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type === this.type) {
            gridPos = $from.before(depth)
            gridNode = $from.node(depth)
            break
          }
        }

        if (gridPos === null || !gridNode) return false

        const insertPos = gridPos + gridNode.nodeSize
        this.editor.chain()
          .insertContentAt(insertPos, { type: 'paragraph' })
          .setTextSelection(insertPos + 1)
          .run()

        return true
      },
    }
  },

  addNodeView() {
    return SvelteNodeViewRenderer(MediaGridComponent);
  },
});