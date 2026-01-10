import { TableCell } from '@tiptap/extension-table/cell';
import { CellSelection, deleteRow, deleteColumn } from 'prosemirror-tables';
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import TableCellNodeView from './TableCellNodeView.svelte';
import { Plugin } from '@tiptap/pm/state';

/* ---- Tipado del storage personalizado ---- */
export interface CustomTableCellStorage {
  customTableSelection: string | null
  gripSelectionIsInFirstRow: boolean
  prevGripSelectionIsInFirstRow: boolean
}

/* ---- Declaración de módulo para TipTap ---- */
declare module '@tiptap/core' {
  interface Storage {
    tableCell: CustomTableCellStorage
  }
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCell: {
      selectRow: (cell: number) => ReturnType
      selectColumn: (cell: number) => ReturnType
    }
  }
}

/* ---- Extensión propiamente dicha ---- */
export const CustomTableCell = TableCell.extend<{}, CustomTableCellStorage>({
    name: 'tableCell',
    addStorage() {
        return {
            customTableSelection: null,
            gripSelectionIsInFirstRow: false,
            prevGripSelectionIsInFirstRow: false,
        }
    },
    addNodeView() {
        const editor = this.editor // ✅ aquí lo tienes disponible
        console.log('Editor:', editor)
        return SvelteNodeViewRenderer(TableCellNodeView, {
            as: 'td',
            stopEvent: () => false,
        })
    },

    addCommands() {
        return {
            selectRow:
                (cell: number) =>
                    ({ tr, dispatch, state }: any) => {
                        const pos = tr.doc.resolve(cell);
                        const rowSel = CellSelection.rowSelection(pos);

                        if (dispatch) {
                            // Busca si es la primera fila
                            const isFirst = isFirstRow(pos);

                            this.storage.customTableSelection = 'row';
                            this.storage.gripSelectionIsInFirstRow = isFirst; // ✅ nuevo flag
                            this.storage.prevGripSelectionIsInFirstRow = isFirst; // ✅ nuevo flag
                            tr.setSelection(rowSel);
                            dispatch(tr);

                            console.log('Row selected. Is first row?', isFirst);
                        }
                        return true;
                    },

            selectColumn:
                (cell: number) =>
                    ({ tr, dispatch, state }: any) => {
                        const pos = tr.doc.resolve(cell);
                        const colSel = CellSelection.colSelection(pos);

                        if (dispatch) {
                            // Busca si es la primera fila
                            const isFirst = isFirstRow(pos);

                            this.storage.customTableSelection = 'column';
                            this.storage.gripSelectionIsInFirstRow = isFirst; // ✅ nuevo flag
                            this.storage.prevGripSelectionIsInFirstRow = isFirst; // ✅ nuevo flag
                            
                            tr.setSelection(colSel);
                            dispatch(tr);

                            console.log('Column selected. Is first row?', isFirst);
                        }
                        return true;
                    },
        };
    },
});


function isFirstRow($pos) {
    // Encuentra la tabla que contiene esta celda
    let tableDepth = -1;
    for (let d = $pos.depth; d >= 0; d--) {
        const node = $pos.node(d);
        if (node.type.name === 'table') {
            tableDepth = d;
            break;
        }
    }
    if (tableDepth === -1) return false;

    const tableNode = $pos.node(tableDepth);

    // Busca la fila padre (tableRow)
    let rowNode = null;
    for (let d = $pos.depth; d > tableDepth; d--) {
        const node = $pos.node(d);
        if (node.type.name === 'tableRow') {
            rowNode = node;
            break;
        }
    }
    if (!rowNode) return false;

    // Compara con la primera fila de la tabla
    return tableNode.child(0) === rowNode;
}

// 👇 Declaración de tipos para que TypeScript entienda las nuevas props