import type { Editor } from '@tiptap/core'
import { Extension, isNodeEmpty } from '@tiptap/core'
import type { Node as ProsemirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface PlaceholderOptions {
  emptyEditorClass: string
  emptyNodeClass: string
  placeholder:
    | ((props: { editor: Editor; node: ProsemirrorNode; pos: number; hasAnchor: boolean }) => string)
    | string
  showOnlyWhenEditable: boolean
  showOnlyCurrent: boolean | ((props: { editor: Editor; node: ProsemirrorNode; pos: number; hasAnchor: boolean }) => boolean)
  includeChildren: boolean | ((props: { editor: Editor; node: ProsemirrorNode; pos: number; hasAnchor: boolean }) => boolean)
}

export const Placeholder = Extension.create<PlaceholderOptions>({
  name: 'placeholder',

  addOptions() {
    return {
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
      placeholder: 'Write something …',
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('placeholder'),
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable
            const { anchor } = selection
            const decorations: Decoration[] = []

            if (!active) {
              return null
            }

            const isEmptyDoc = this.editor.isEmpty

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize
              const isEmpty = !node.isLeaf && isNodeEmpty(node)

              // Evaluamos showOnlyCurrent dinámico
              const showCurrent =
                typeof this.options.showOnlyCurrent === 'function'
                  ? this.options.showOnlyCurrent({ editor: this.editor, node, pos, hasAnchor })
                  : this.options.showOnlyCurrent

              // Evaluamos includeChildren dinámico
              const includeChildren =
                typeof this.options.includeChildren === 'function'
                  ? this.options.includeChildren({ editor: this.editor, node, pos, hasAnchor })
                  : this.options.includeChildren

              if ((hasAnchor || !showCurrent) && isEmpty) {
                const classes = [this.options.emptyNodeClass]

                if (isEmptyDoc) {
                  classes.push(this.options.emptyEditorClass)
                }

                const decoration = Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(' '),
                  'data-placeholder':
                    typeof this.options.placeholder === 'function'
                      ? this.options.placeholder({ editor: this.editor, node, pos, hasAnchor })
                      : this.options.placeholder,
                })

                decorations.push(decoration)
              }

              return includeChildren
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
