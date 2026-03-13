// resizable-nodes.ts  (versión completa con Decorations)
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface ResizableNodesOptions {
  nodes: string[]
  minWidth?: number
  handleWidth?: number
}

export const ResizableNodes = Extension.create<ResizableNodesOptions>({
  name: 'resizableNodes',

  addOptions() {
    return {
      nodes: [],
      minWidth: 120,
      handleWidth: 8,
    }
  },

  // ✅ Añade maxWidth a los nodos configurados SIN tocar su NodeView
  addGlobalAttributes() {
    return [
      {
        types: this.options.nodes,
        attributes: {
          maxWidth: {
            default: null,
            parseHTML: el => {
              const val = (el as HTMLElement).style.maxWidth
              return val || null
            },
            renderHTML: attrs => {
              if (!attrs.maxWidth) return {}
              return {
                style: `max-width: ${attrs.maxWidth}; box-sizing: border-box;`,
              }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    const extension = this
    const pluginKey = new PluginKey('resizableNodes')

    return [
      new Plugin({
        key: pluginKey,

        // Decoraciones: añade el handle como widget sin reemplazar el NodeView
        props: {
          decorations(state) {
            const { doc, selection } = state
            const decorations: Decoration[] = []
            const nodeNames = extension.options.nodes

            doc.descendants((node, pos) => {
              if (!nodeNames.includes(node.type.name)) return
              if (node.attrs.maxWidth === undefined) return

              // Widget al FINAL del nodo (después del contenido)
              const widget = Decoration.widget(
                pos + node.nodeSize - 1,
                () => {
                  const handle = document.createElement('div')
                  handle.className = 'resize-handle'
                  handle.contentEditable = 'false'
                  handle.dataset.pos = String(pos)
                  return handle
                },
                { side: 1, key: `resize-${pos}` }
              )

              decorations.push(widget)
            })

            return DecorationSet.create(doc, decorations)
          },

          handleDOMEvents: {
            mousedown(view, event) {
              const handle = (event.target as HTMLElement).closest('.resize-handle') as HTMLElement
              if (!handle) return false

              event.preventDefault()

              const pos = parseInt(handle.dataset.pos || '0', 10)
              const node = view.state.doc.nodeAt(pos)
              if (!node) return false

              const dom = view.nodeDOM(pos) as HTMLElement
              if (!dom) return false

              const startX = event.clientX
              const startWidth = dom.offsetWidth
              const minWidth = extension.options.minWidth ?? 120

              const onMouseMove = (e: MouseEvent) => {
                const newWidth = Math.max(minWidth, startWidth + (e.clientX - startX))
                console.log(newWidth)
                dom.style.maxWidth = `${newWidth}px` // preview live

                // Commit al schema de ProseMirror
                const { tr } = view.state
                // tr.setNodeMarkup(pos, undefined, {
                //   ...node.attrs,
                //   maxWidth: `${newWidth}px`,
                // })
                view.dispatch(tr)
              }

              const onMouseUp = (e: MouseEvent) => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                const finalWidth = Math.max(
                  minWidth,
                  startWidth + (e.clientX - startX)
                )

                // Commit al schema de ProseMirror
                const { tr } = view.state
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  maxWidth: `${finalWidth}px`,
                })
                view.dispatch(tr)
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)
              return true
            },
          },
        },
      }),
    ]
  },
})