import { Extension } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCellSelection: {
      /** Selecciona toda la fila a partir de la posición de una celda */
      selectRow: (cellPos: number) => ReturnType
      /** Selecciona toda la columna a partir de la posición de una celda */
      selectColumn: (cellPos: number) => ReturnType
    }
  }
}

export const TableCellSelection = Extension.create({
  name: 'tableCellSelection',

  addCommands() {
    return {
      selectRow:
        (cellPos: number) =>
        ({ tr, state, dispatch }) => {
          try {
            const $pos = state.doc.resolve(cellPos)
            const selection = CellSelection.rowSelection($pos)
            if (dispatch) dispatch(tr.setSelection(selection).scrollIntoView())
            return true
          } catch (err) {
            console.warn('No se pudo seleccionar la fila:', err)
            return false
          }
        },

      selectColumn:
        (cellPos: number) =>
        ({ tr, state, dispatch }) => {
          try {
            const $pos = state.doc.resolve(cellPos)
            const selection = CellSelection.colSelection($pos)
            if (dispatch) dispatch(tr.setSelection(selection).scrollIntoView())
            return true
          } catch (err) {
            console.warn('No se pudo seleccionar la columna:', err)
            return false
          }
        },
    }
  },
})
