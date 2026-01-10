import { Node, mergeAttributes } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import MediaGridItemComponent from './MediaGridItem.svelte';
export const MediaGridItemExtension = Node.create({
  name: 'gridItem',
  content: 'image?', // 👈 solo permite un nodo image
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-type="grid-item"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 
        'data-type': 'grid-item',
        class: 'fl-grid-item',
      }),
      0,
    ]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(MediaGridItemComponent);
  },
})