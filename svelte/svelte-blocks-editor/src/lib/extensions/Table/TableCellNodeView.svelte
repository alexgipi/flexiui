<script lang="ts">
  import { deleteRow } from "prosemirror-tables";
  import {
    computePosition,
    offset,
    autoUpdate,
    size,
    autoPlacement,
    type Placement,
  } from "@floating-ui/dom";
  import { NodeViewWrapper, NodeViewContent } from "svelte-tiptap";
  import { h, type NodeViewProps } from "@tiptap/core";
  import { onMount } from "svelte";

  const { node, selected, getPos, editor } = $props<{
    node: NodeViewProps["node"];
    selected: NodeViewProps["selected"];
    getPos: NodeViewProps["getPos"];
    editor: NodeViewProps["editor"];
  }>();

  let wrapper: HTMLElement = $state(null) as HTMLElement;
  let isFirstCell = $state(false);
  let isFirstRow = $state(false);

  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltip: HTMLDivElement = $state(null) as HTMLDivElement;
  let cleanup: () => void;

  onMount(() => {
    const td = wrapper.closest("td, th");
    if (!td) return;

    const tr = td.parentElement;
    const table = td.closest("table");

    // ✅ primera celda de la fila (botón lateral)
    if (tr && tr.firstElementChild === td) {
      isFirstCell = true;
    }

    // ✅ celda dentro de la primera fila (botón superior)
    if (table && table.querySelector("tr:first-child") === tr) {
      isFirstRow = true;
    }

    editor.on("update", ({ transaction }) => {
      console.log({ NODETYPE: node.type.name });
      if (node.type.name !== "tableCell" && node.type.name !== "tableHeader")
        return;

      const nodeEl = editor.view.nodeDOM(getPos());
      console.log(nodeEl);

      console.log("update", transaction);

      const attrs = node.attrs;
      const { colspan, rowspan, colwidth } = attrs;

      if (colspan) {
        td.setAttribute("colspan", colspan);
      }

      if (rowspan) {
        td.setAttribute("rowspan", rowspan);
      }

      if (colwidth) {
        td.setAttribute("colwidth", colwidth);
      }

      if (td) {
        const tr = td.parentElement;
        const table = td.closest("table");

        // ✅ primera celda de la fila (botón lateral)
        if (tr && tr.firstElementChild === td) {
          isFirstCell = true;
        } else {
          isFirstCell = false;
        }

        // ✅ celda dentro de la primera fila (botón superior)
        if (table && table.querySelector("tr:first-child") === tr) {
          isFirstRow = true;
        } else {
          isFirstRow = false;
        }
      }
    });
  });

  let currentTriggerEl: HTMLElement | null = $state(null);
  let currentDropdownType: string | null = $state(null);
  let prevGripSelectionIsInFirstRow: boolean | null = $state(null);

  function showTooltip(
    el: HTMLElement,
    type: "row-dropdown" | "column-dropdown"
  ) {
    // Si ya está abierto en el mismo elemento → cerrar pero mantener selección
    if (tooltipVisible && currentTriggerEl === el) {
      hideTooltip({ keepSelection: true }); // 👈 mantener selección
      return;
    }

    // Si hay otro abierto → cerrar sin mantener
    if (tooltipVisible && currentTriggerEl && currentTriggerEl !== el) {
      hideTooltip();
    }

    currentTriggerEl = el;
    currentDropdownType = type;
    tooltipVisible = true;

    document.body.append(tooltip);
    document.addEventListener("mousedown", handleClickOutside);
    cleanup = autoUpdate(el, tooltip, () => updatePosition(el));
  }

  function hideTooltip({ keepSelection = false } = {}) {
    tooltipVisible = false;
    tooltip?.remove();
    document.removeEventListener("mousedown", handleClickOutside);
    cleanup && cleanup();
    currentTriggerEl = null;

    // 🧠 Si no queremos mantener la selección, la limpiamos
    if (!keepSelection) {
      editor.commands.deleteSelection(); // limpiar selección visual
    }

    // 🔁 Resetear storage siempre
    editor.storage.tableCell.customTableSelection = null;
    editor.storage.tableCell.gripSelectionIsInFirstRow = null;
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as Node;
    if (!tooltip) return;

    // Si hace click dentro del tooltip → no cerramos
    if (tooltip.contains(target)) return;

    // Si hace click en el botón que abrió el tooltip → ya lo gestiona showTooltip()
    if (currentTriggerEl && currentTriggerEl.contains(target)) return;

    // En cualquier otro caso → cerrar (manteniendo la selección)
    hideTooltip({ keepSelection: true });
  }

  function updatePosition(el: HTMLElement) {
    let placement: Placement = "left";
    let offsetValue = 4;
    if (currentDropdownType === "column-dropdown") {
      placement = "top";
      offsetValue = 4;
    }
    computePosition(el, tooltip, {
      placement,
      middleware: [
        offset(offsetValue),
        size({
          apply({ rects, elements }) {
            // Object.assign(elements.floating.style, {
            //   height: `${rects.reference.height}px`,
            //   // minHeight: `64px`,
            // });
          },
        }),
        // autoPlacement({
        //   allowedPlacements: ["left-start", "bottom-end",],
        // }),
      ],
    }).then(({ x, y }) => {
      tooltipX = x;
      tooltipY = y;
    });
  }
</script>

<NodeViewWrapper class="fl-table-cell-wrapper">
  <div contenteditable="false" bind:this={wrapper}>
    {#if isFirstCell}
      <button
        class="grip-row"
        aria-label="Row options"
        type="button"
        onclick={(e) => {
            editor.commands.deleteSelection();
            editor?.chain().focus().selectRow(getPos()).run();
            showTooltip(e.target as HTMLElement, "row-dropdown");
        }}
      >
      </button>
    {/if}

    {#if isFirstRow}
      <button
        class="grip-col"
        aria-label="Column options"
        type="button"
         onclick={(e) => {
            editor.commands.deleteSelection();
            editor?.chain().focus().selectColumn(getPos()).run();
            showTooltip(e.target as HTMLElement, "column-dropdown");
        }}
      >
      </button>
    {/if}
    <!-- <button onclick={() => {editor?.chain().focus().selectRow(getPos()).run();}}>Select Row</button>
    <button onclick={() => {editor?.chain().focus().selectColumn(getPos()).run();}}>Select Column</button>
    <button onclick={() => {editor?.chain().focus().deleteRow().run();}}>Delete Row</button>
    <button onclick={() => {editor?.chain().focus().deleteColumn().run();}}>Delete Column</button> -->
  </div>
  <NodeViewContent class="fl-table-cell-content" />

  <div
    class="fl-toolbar-dropdown-panel fl-toolbar-dropdown-panel--table"
    bind:this={tooltip}
    style="display: {tooltipVisible
      ? 'flex'
      : 'none'}; left: {tooltipX}px; top: {tooltipY}px;"
  >
    {#if currentDropdownType === "row-dropdown"}
      <div class="table-dropdown-options">
        <button
          class="table-dropdown-option"
          onclick={() => editor?.chain().focus().addRowBefore().run()}
          aria-label="Insert row above"
          tabindex="-1"
          style=""
        >
          <div
            style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;"
          >
            <div
              style="display: flex; align-items: center; justify-content: center; min-width: 20px; min-height: 20px;"
            >
              <div
                style="display: flex; align-items: center; justify-content: center; color: var(--c-icoPri);"
              >
                <svg
                  aria-hidden="true"
                  role="graphics-symbol"
                  viewBox="0 0 20 20"
                  height="18"
                  width="18"
                  fill="currentColor"
                  class="arrowStraightUp"
                  style="display: block;flex-shrink: 0;"
                  ><path
                    d="M9.792 2.41a.6.6 0 0 0-.234.148l-5.4 5.4a.625.625 0 1 0 .884.884l4.333-4.333V17a.625.625 0 1 0 1.25 0V4.509l4.333 4.333a.625.625 0 1 0 .884-.884l-5.4-5.4a.62.62 0 0 0-.65-.147"
                  ></path></svg
                >
              </div>
            </div>
            <div style="margin-inline: 0px; min-width: 0px; flex: 1 1 auto;">
              <div
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                Insert above
              </div>
            </div>
          </div>
        </button>

        <button
          class="table-dropdown-option"
          type="button"
          onclick={() => editor?.chain().focus().addRowAfter().run()}
          tabindex="-1"
        >
          <div
            style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;/* padding-inline: 8px; */"
          >
            <div
              style="display: flex; align-items: center; justify-content: center; min-width: 20px; min-height: 20px;"
            >
              <div
                style="display: flex; align-items: center; justify-content: center; color: var(--c-icoPri);"
              >
                <svg
                  aria-hidden="true"
                  role="graphics-symbol"
                  viewBox="0 0 20 20"
                  height="18"
                  width="18"
                  class="arrowStraightUp"
                  fill="currentColor"
                  style="display: block;flex-shrink: 0;transform: scaleY(-1);"
                  ><path
                    d="M9.792 2.41a.6.6 0 0 0-.234.148l-5.4 5.4a.625.625 0 1 0 .884.884l4.333-4.333V17a.625.625 0 1 0 1.25 0V4.509l4.333 4.333a.625.625 0 1 0 .884-.884l-5.4-5.4a.62.62 0 0 0-.65-.147"
                  ></path></svg
                >
              </div>
            </div>

            <div style="margin-inline: 0px; min-width: 0px; flex: 1 1 auto;">
              <div
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                Insert bellow
              </div>
            </div>
          </div>
        </button>

        <button
          class="table-dropdown-option"
          type="button"
          onclick={() => {
            hideTooltip();
            editor?.chain().focus().deleteRow().run();
          }}
          tabindex="-1"
        >
          <div
            style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;/* padding-inline: 8px; */"
          >
            <div
              style="display: flex; align-items: center; justify-content: center; min-width: 20px; min-height: 20px;"
            >
              <div
                style="display: flex; align-items: center; justify-content: center; color: var(--c-icoPri);"
              >
                <svg
                  aria-hidden="true"
                  role="graphics-symbol"
                  viewBox="0 0 20 20"
                  height="18"
                  width="18"
                  class="trash"
                  fill="currentColor"
                  style="display: block;flex-shrink: 0;"
                  ><path
                    d="M8.806 8.505a.55.55 0 0 0-1.1 0v5.979a.55.55 0 1 0 1.1 0zm3.488 0a.55.55 0 0 0-1.1 0v5.979a.55.55 0 1 0 1.1 0z"
                  ></path><path
                    d="M6.386 3.925v1.464H3.523a.625.625 0 1 0 0 1.25h.897l.393 8.646A2.425 2.425 0 0 0 7.236 17.6h5.528a2.425 2.425 0 0 0 2.422-2.315l.393-8.646h.898a.625.625 0 1 0 0-1.25h-2.863V3.925c0-.842-.683-1.525-1.525-1.525H7.91c-.842 0-1.524.683-1.524 1.525M7.91 3.65h4.18c.15 0 .274.123.274.275v1.464H7.636V3.925c0-.152.123-.275.274-.275m-.9 2.99h7.318l-.39 8.588a1.175 1.175 0 0 1-1.174 1.122H7.236a1.175 1.175 0 0 1-1.174-1.122l-.39-8.589z"
                  ></path></svg
                >
              </div>
            </div>

            <div style="margin-inline: 0px; min-width: 0px; flex: 1 1 auto;">
              <div
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                Delete
              </div>
            </div>
          </div>
        </button>
      </div>
    {/if}

    {#if currentDropdownType === "column-dropdown"}
      <div class="table-dropdown-options">
        <button
          type="button"
          class="table-dropdown-option"
          onclick={() => {
            editor?.chain().focus().addColumnBefore().run();
          }}
          aria-label="Insert col before"
          tabindex="-1"
          style=""
        >
          <div
            style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;"
          >
            <div
              style="display: flex; align-items: center; justify-content: center; min-width: 20px; min-height: 20px;"
            >
              <div
                style="display: flex; align-items: center; justify-content: center; color: var(--c-icoPri);"
              >
                <svg
                  aria-hidden="true"
                  role="graphics-symbol"
                  viewBox="0 0 20 20"
                  class="arrowStraightLeft directional-icon"
                  width="18"
                  height="18"
                  fill="currentColor"
                  style="display: block;flex-shrink: 0;"
                >
                  <path
                    d="M2.411 9.79a.6.6 0 0 1 .147-.232l5.4-5.4a.625.625 0 1 1 .884.884L4.509 9.375H17a.625.625 0 1 1 0 1.25H4.509l4.333 4.333a.625.625 0 1 1-.884.884l-5.4-5.4a.62.62 0 0 1-.147-.651"
                  ></path>
                </svg>
              </div>
            </div>

            <div style="margin-inline: 0px; min-width: 0px; flex: 1 1 auto;">
              <div
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                Insert left
              </div>
            </div>
          </div>
        </button>

        <button
          class="table-dropdown-option"
          aria-label="Insert col after"
          type="button"
          onclick={() => editor?.chain().focus().addColumnAfter().run()}
          tabindex="-1"
        >
          <div
            style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;/* padding-inline: 8px; */"
          >
            <div
              style="display: flex; align-items: center; justify-content: center; min-width: 20px; min-height: 20px;"
            >
              <div
                style="display: flex; align-items: center; justify-content: center; color: var(--c-icoPri);"
              >
                <svg
                  aria-hidden="true"
                  role="graphics-symbol"
                  viewBox="0 0 20 20"
                  class="arrowStraightRight directional-icon"
                  width="18"
                  height="18"
                  fill="currentColor"
                  style="display: block; flex-shrink: 0;"
                  ><path
                    d="m17.442 9.558-5.4-5.4a.625.625 0 0 0-.884.884l4.333 4.333H3a.625.625 0 1 0 0 1.25h12.491l-4.333 4.333a.625.625 0 1 0 .884.884l5.4-5.4a.62.62 0 0 0 0-.884"
                  ></path></svg
                >
              </div>
            </div>

            <div style="margin-inline: 0px; min-width: 0px; flex: 1 1 auto;">
              <div
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                Insert right
              </div>
            </div>
          </div>
        </button>

        <button
          class="table-dropdown-option"
          aria-label="Delete column"
          type="button"
          onclick={() => {
            hideTooltip();
            editor?.chain().focus().deleteColumn().run();
            editor.commands.deleteSelection();
          }}
          tabindex="-1"
        >
          <div
            style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;/* padding-inline: 8px; */"
          >
            <div
              style="display: flex; align-items: center; justify-content: center; min-width: 20px; min-height: 20px;"
            >
              <div
                style="display: flex; align-items: center; justify-content: center; color: var(--c-icoPri);"
              >
                <svg
                  aria-hidden="true"
                  role="graphics-symbol"
                  viewBox="0 0 20 20"
                  height="18"
                  width="18"
                  class="trash"
                  fill="currentColor"
                  style="display: block;flex-shrink: 0;"
                  ><path
                    d="M8.806 8.505a.55.55 0 0 0-1.1 0v5.979a.55.55 0 1 0 1.1 0zm3.488 0a.55.55 0 0 0-1.1 0v5.979a.55.55 0 1 0 1.1 0z"
                  ></path><path
                    d="M6.386 3.925v1.464H3.523a.625.625 0 1 0 0 1.25h.897l.393 8.646A2.425 2.425 0 0 0 7.236 17.6h5.528a2.425 2.425 0 0 0 2.422-2.315l.393-8.646h.898a.625.625 0 1 0 0-1.25h-2.863V3.925c0-.842-.683-1.525-1.525-1.525H7.91c-.842 0-1.524.683-1.524 1.525M7.91 3.65h4.18c.15 0 .274.123.274.275v1.464H7.636V3.925c0-.152.123-.275.274-.275m-.9 2.99h7.318l-.39 8.588a1.175 1.175 0 0 1-1.174 1.122H7.236a1.175 1.175 0 0 1-1.174-1.122l-.39-8.589z"
                  ></path></svg
                >
              </div>
            </div>

            <div style="margin-inline: 0px; min-width: 0px; flex: 1 1 auto;">
              <div
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
              >
                Delete
              </div>
            </div>
          </div>
        </button>
      </div>
    {/if}
  </div>
</NodeViewWrapper>

<style>
  .grip-row {
    position: absolute;
    left: -12px;
    width: 11px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: currentColor;
    background: #8989891f;
    border: none;
    outline: 1px solid #6e6e6e;
    z-index: 5;
    cursor: pointer;

    &:after {
      content: "";
      position: absolute;
      height: 10px;
      border-right: 2px dotted;
      width: 1px;
      color: currentColor;
    }
  }

  .grip-col {
    position: absolute;
    top: -12px;
    height: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    width: 100%;
    left: 0;
    font-size: 9px;
    letter-spacing: 2px;
    padding: 0;
    color: currentColor;
    background: #8989891f;
    border: none;
    outline: 1px solid #6e6e6e;
    z-index: 5;
    cursor: pointer;

    &:after {
      content: "";
      position: absolute;
      height: 1px;
      border-bottom: 2px dotted;
      width: 10px;
      color: currentColor;
    }
  }

  .table-dropdown-options {
    width: 100%;
  }

  .table-dropdown-option {
    user-select: none;
    cursor: pointer;
    width: 100%;
    display: flex;
    border-radius: 8px;
    border: none;
    background: #ffffff00;
    text-align: left;
    transition: background 0.2s ease-in-out;

    &:hover {
      background: #91919146;
    }
  }
</style>
