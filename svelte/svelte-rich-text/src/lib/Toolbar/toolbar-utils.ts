// Función auxiliar para verificar si un nodo está completamente seleccionado
export function isNodeFullySelected(editor:any) {
    const { from, to } = editor.state.selection;
    const resolvedFrom = editor.state.doc.resolve(from);
    const resolvedTo = editor.state.doc.resolve(to);

    // Verificar si estamos en el mismo nodo padre
    if (resolvedFrom.parent !== resolvedTo.parent) {
        return false;
    }

    const node = resolvedFrom.parent;
    const start = resolvedFrom.start();
    const end = resolvedTo.end();

    // Verificar si la selección cubre todo el contenido del nodo
    return from === start && to === end;
}