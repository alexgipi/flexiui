import { Node, mergeAttributes } from '@tiptap/core';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';

import MediaGridComponent from './MediaGrid.svelte';

export const MediaGridExtension = Node.create({
  name: 'MediaGridComponent',
  group: 'block',
  content: 'gridItem+',
  defining: true,

  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: element => parseInt(element.getAttribute('data-cols') || '2', 10),
        renderHTML: attrs => ({ 'data-cols': attrs.cols }),
      },
      gap: {
        default: '1rem',
        parseHTML: element => element.getAttribute('data-gap') || '1rem',
        renderHTML: attrs => ({ 'data-gap': attrs.gap }),
      },
      showIndicator: {
        default: false,
        parseHTML: element => element.getAttribute('data-show-indicator') || false,
        renderHTML: attrs => ({ 'data-show-indicator': attrs.showIndicator }),
      },
      indicatorType: {
        default: 'numeric', // 'numeric' | 'alphabetic'
        parseHTML: element => element.getAttribute('data-indicator-type') || 'numeric',
        renderHTML: attrs => ({ 'data-indicator-type': attrs.indicatorType }),
      }
    }
  },

  parseHTML() {
    return [{ tag: 'media-grid-component' }];
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

            // const items = Array.from({ length: cols }, () =>
            //   schema.nodes.gridItem.create(
            //     null,
            //     schema.nodes.image.create({ src: 'https://placehold.co/800x400' })
            //   )
            // )

            const items = Array.from({ length: cols }, () =>
              schema.nodes.gridItem.create() // 👈 sin contenido
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

  addNodeView() {
    return SvelteNodeViewRenderer(MediaGridComponent);
  },
});