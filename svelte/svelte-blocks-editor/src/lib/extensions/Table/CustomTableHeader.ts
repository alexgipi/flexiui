import { TableHeader } from '@tiptap/extension-table/header'
import { CellSelection, deleteRow, deleteColumn } from 'prosemirror-tables'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'
import TableCellNodeView from './TableCellNodeView.svelte'

export const CustomTableHeader = TableHeader.extend({
  addNodeView() {
    return SvelteNodeViewRenderer(TableCellNodeView, { as: 'th', stopEvent: () => false })
  },

  // addCommands() {
  //   return {
  //     selectRow:
  //       (cell: any) =>
  //       ({ tr, dispatch }: any) => {
  //         if (dispatch) {
  //           const pos = tr.doc.resolve(cell)
  //           const sel = CellSelection.rowSelection(pos)
  //           tr.setSelection(sel)
  //         }
  //         return true
  //       },

  //     selectColumn:
  //       (cell: any) =>
  //       ({ tr, dispatch }: any) => {
  //         if (dispatch) {
  //           const pos = tr.doc.resolve(cell)
  //           const sel = CellSelection.colSelection(pos)
  //           tr.setSelection(sel)
  //         }
  //         return true
  //       },
  //   }
  // },
})
