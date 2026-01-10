<script lang="ts">
  import { CustomTableHeader } from "./extensions/Table/CustomTableHeader";
  import { CustomTableCell } from "./extensions/Table/CustomTableCell";
  import { Audio } from "./extensions/Audio";
  import { EnhancedLink } from "./extensions/EnhancedLink";
  import { MediaGridExtension } from "./extensions/MediaGrid/MediaGrid";
  import { MediaGridItemExtension } from "./extensions/MediaGrid/MediaGridItem";
  import { Placeholder } from "@tiptap/extensions";
  import { TableKit } from "@tiptap/extension-table";
  import { CellSelection } from "prosemirror-tables";

  import { computePosition, offset, autoUpdate, size } from "@floating-ui/dom";
  import { exampleJSONContent, rgbToHex } from "./utils";
  import "./styles.css";

  import Image from "@tiptap/extension-image";

  import { Color } from "@tiptap/extension-text-style";
  import Highlight from "@tiptap/extension-highlight";

  import { ListItem, TaskItem, TaskList } from "@tiptap/extension-list";
  import { TextStyle } from "@tiptap/extension-text-style";
  import StarterKit from "@tiptap/starter-kit";
  import { NodePos } from "@tiptap/core";
  import Link from "@tiptap/extension-link";
  import { onMount, onDestroy } from "svelte";
  import {
    BubbleMenu,
    createEditor,
    Editor,
    EditorContent,
  } from "svelte-tiptap";

  import type { Readable } from "svelte/store";

  declare interface Props {
    id?: string;
    className?: string;
    editable?: boolean;
    content?: any;
    customExtensions?: any[];
    onTransaction?: (params: any) => void;
    onBeforeCreate?: (params: any) => void;
    onCreate?: (params: any) => void;
    onUpdate: (params: any) => void;
    onFocus?: (params: any) => void;
    onBlur?: (params: any) => void;
    onDestroyEditor?: (params: any) => void;
    onDrop?: (params: any) => void;
    onDelete?: (params: any) => void;
    onContentError?: (params: any) => void;
    onSelectionUpdate?: (params: any) => void;
    onPaste?: (params: any) => void;
  }

  let {
    id = "fl-rich-text-blocks-editor",
    className,
    editable,
    content,
    customExtensions = [],
    onTransaction = () => {},
    onBeforeCreate = () => {},
    onCreate = () => {},
    onUpdate = () => {},
    onFocus = () => {},
    onBlur = () => {},
    onDestroyEditor = () => {},
    onDrop = () => {},
    onDelete = () => {},
    onContentError = () => {},
    onSelectionUpdate = () => {},
    onPaste = () => {},
  }: Props = $props();

  let editor = $state() as Readable<Editor>;
  let bubbleOffset =
    $editor?.storage.tableCell.customTableSelection === "column" ? 18 : 8;
  let imageUrlInputEl: HTMLInputElement = $state(null) as HTMLInputElement;
  let imageUrlInputValue: string = $state(null);

  const HEADINGS = [
    {
      level: 1,
      ariaLabel: "H1",
      icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"></path></svg>`,
    },
    {
      level: 2,
      ariaLabel: "H2",
      icon: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"></path></svg>`,
    },
    {
      level: 3,
      ariaLabel: "H3",
      icon: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path></svg>`,
    },
    {
      level: 4,
      ariaLabel: "H4",
      icon: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM22 8V16H23.5V18H22V20H20V18H14.5V16.66L19.5 8H22ZM20 11.133L17.19 16H20V11.133Z"></path></svg>`,
    },
    {
      level: 5,
      ariaLabel: "H5",
      icon: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8V10H17.6769L17.2126 12.6358C17.5435 12.5472 17.8912 12.5 18.25 12.5C20.4591 12.5 22.25 14.2909 22.25 16.5C22.25 18.7091 20.4591 20.5 18.25 20.5C16.4233 20.5 14.8827 19.2756 14.4039 17.6027L16.3271 17.0519C16.5667 17.8881 17.3369 18.5 18.25 18.5C19.3546 18.5 20.25 17.6046 20.25 16.5C20.25 15.3954 19.3546 14.5 18.25 14.5C17.6194 14.5 17.057 14.7918 16.6904 15.2478L14.8803 14.3439L16 8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path></svg>`,
    },
    {
      level: 6,
      ariaLabel: "H6",
      icon: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.097 8L18.499 12.5C20.7091 12.5 22.5 14.2909 22.5 16.5C22.5 18.7091 20.7091 20.5 18.5 20.5C16.2909 20.5 14.5 18.7091 14.5 16.5C14.5 15.7636 14.699 15.0737 15.0461 14.4811L18.788 8H21.097ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 14.5C17.3954 14.5 16.5 15.3954 16.5 16.5C16.5 17.6046 17.3954 18.5 18.5 18.5C19.6046 18.5 20.5 17.6046 20.5 16.5C20.5 15.3954 19.6046 14.5 18.5 14.5Z"></path></svg>`,
    },
  ];

  const TEXT_COLOR_PALETTE = [
    "rgb(94, 23, 235)",
    "rgb(183, 147, 255)",
    "rgb(255, 147, 223)",
    // "rgb(251, 109, 250)",
    "rgb(255, 78, 198)",
    "rgb(147, 255, 207)",
    "rgb(147, 215, 255)",
    "rgb(255, 147, 147)",
    "rgb(255, 102, 142)",
    "rgb(0, 0, 0)",
    "rgb(255, 255, 255)",
  ];

  const HIGHLIGHT_COLOR_PALETTE = [
    "rgb(94, 23, 235)",
    "rgb(183, 147, 255)",
    "rgb(255, 147, 223)",
    // "rgb(251, 109, 250)",
    "rgb(255, 78, 198)",
    "rgb(147, 255, 207)",
    "rgb(147, 215, 255)",
    "rgb(255, 147, 147)",
    "rgb(255, 102, 142)",
  ];

  let recentCustomColors = $state([]) as string[];

  let currentJSON = {
    type: "doc",
    content: exampleJSONContent,
  };

  if (!content) {
    content = currentJSON;
  }

  const extensions = [
    StarterKit.configure({
      // Disable an included extension
      trailingNode: false,
      link: false,
      // bulletList: false,
      // listItem: false,
      // orderedList: false,
      // listKeymap: false,
    }),
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    Highlight.configure({ multicolor: true }),
    TextStyle.configure(),
    EnhancedLink,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: "_self",
        rel: "noopener noreferrer",
      },
    }),
    Image.configure({
      inline: true,
    }),
    Audio.configure({
      HTMLAttributes: { class: "audio-player" },
    }),
    MediaGridExtension,
    MediaGridItemExtension,
    TaskItem,
    TaskList,
    Placeholder.configure({
      // Use a placeholder:
      placeholder: "Write something …",
      // Use different placeholders depending on the node type:
      // placeholder: ({ node }) => {
      //   if (node.type.name === 'heading') {
      //     return 'What’s the title?'
      //   }

      //   return 'Can you add some further context?'
      // },
    }),
    TableKit.configure({
      table: {
        HTMLAttributes: { class: "fl-table-editable" },
        resizable: true,
      },
    }),
    CustomTableCell.configure({
      HTMLAttributes: { class: "fl-cell-editable" },
    }),
    CustomTableHeader.configure({
      HTMLAttributes: { class: "fl-cell-editable" },
    }),
    ...customExtensions,
  ];

  let startPos: any = 0;
  let afterPos: any = 0;
  let selectedImageEl: any = $state(null);

  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltip: HTMLDivElement = $state(null) as HTMLDivElement;
  let cleanup: () => void;
  let currentTriggerEl: HTMLElement | null = null;
  let textColorDropdownTriggerEl: HTMLElement | null = $state(
    null
  ) as HTMLElement;
  let activeDropdownType = $state(null);

  function toogleDropdown(el: HTMLElement, type: string = null) {
    if (!el) return;
    // console.log(el);
    activeDropdownType = type;

    if (tooltipVisible) {
      hideDropdown(); // Ocultar
    } else {
      hideDropdown(); // limpiar antes de abrir
      currentTriggerEl = el;
      tooltipVisible = true;
      document.body.append(tooltip);

      document.addEventListener("mousedown", handleClickOutside);
      cleanup = autoUpdate(el, tooltip, () => updatePosition(el));
    }
  }

  function hideDropdown() {
    tooltipVisible = false;
    tooltip?.remove();
    document.removeEventListener("mousedown", handleClickOutside);
    cleanup && cleanup();
    currentTriggerEl = null;
  }

  function handleClickOutside(e: MouseEvent) {
    if (!tooltip) return;
    const target = e.target as Node;

    // Excepciones: tooltip, trigger actual, y el drag-area contenedor
    if (
      tooltip.contains(target) ||
      currentTriggerEl?.contains(target) ||
      currentTriggerEl?.closest(".fl-image-upload-drag-area")?.contains(target)
    ) {
      return; // no cerrar
    }

    hideDropdown();
  }

  function updatePosition(el: HTMLElement) {
    computePosition(el, tooltip, {
      placement: "bottom-start",
      middleware: [
        offset(4),
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

  // función para saber si hay una selección de celdas
  const isCellSelection = () =>
    $editor && $editor.state.selection instanceof CellSelection;

  onMount(async () => {
    const dragHandle = document.querySelector(".drag-handle") as HTMLElement;

    editor = createEditor({
      extensions,
      content,
      onTransaction: ({ editor, transaction }) => {
        // console.log('onTransaction', editor, transaction)
        onTransaction({ editor, transaction });
        editor = editor;
        const { from } = editor.state.selection;

        // Detecta si ha habido un delete (o cualquier cambio de documento)
        if (!transaction.docChanged) return;

        const doc = editor.state.doc;
        const lastNode = doc.content.lastChild;

        // Si no hay nodos, el documento está vacío
        if (!lastNode) {
          dragHandle.style.display = "none";
          return;
        }

        // Si el drag-handle estaba en el último nodo antes del delete
        // y ese nodo ya no existe, lo ocultamos
        const proseMirrorEl = editor.view.dom;
        const allNodes = Array.from(proseMirrorEl.childNodes).filter(
          (el: any) => el instanceof HTMLElement
        );

        // Comprobamos si el handle está más allá del último nodo actual
        const rectEditor = proseMirrorEl.getBoundingClientRect();
        const lastEl = allNodes[allNodes.length - 1];
        const lastRect = lastEl?.getBoundingClientRect();

        if (lastRect) {
          const handleRect = dragHandle.getBoundingClientRect();
          const isPastLastNode = handleRect.top > lastRect.bottom;

          if (isPastLastNode) {
            dragHandle.style.display = "none";
          }
        }

        if (editor.getAttributes("image").src) {
          if (selectedImageEl === editor.view.nodeDOM(from)) {
            console.log("Es la misma imagen");
            return;
          } else {
            selectedImageEl = editor.view.nodeDOM(from);
            imageUrlInputValue = null;
          }
        } else {
          selectedImageEl = null;
          imageUrlInputValue = null;
        }
      },

      onBeforeCreate({ editor }) {
        // console.log('onBeforeCreate', editor)
        onBeforeCreate({ editor });
        // Before the view is created.
      },
      onCreate: ({ editor }) => {
        // console.log('onCreate', editor)
        onCreate({ editor });
        const proseMirrorEl = editor.view.dom;
        proseMirrorEl.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            const from = editor.state.selection.$from;
            const node = from.parent;
            const pos = from.before(from.depth);

            // Obtener el elemento DOM del nodo
            const nodeEl = editor.view.nodeDOM(pos);

            // console.log("Enter presionado");
            // console.log("Nodo padre:", node.type.name);
            // console.log("Elemento DOM:", nodeEl);

            nodeEl.addEventListener("mouseenter", (e) => {
              if (tooltipVisible && activeDropdownType === "insert-block")
                return;

              const rectEditor = proseMirrorEl.getBoundingClientRect();
              const target = e.target as HTMLElement;
              // console.log(target);
              const nodeRect = target.getBoundingClientRect();

              // Posición relativa del nodo al editor
              const offsetTop = nodeRect.top - rectEditor.top;

              // Colocamos el handle centrado verticalmente al nodo
              dragHandle.style.display = "flex";
              dragHandle.style.position = "absolute";
              dragHandle.style.top = `${offsetTop + 1}px`;
              dragHandle.style.left = `16px`; // 8px de margen a la izquierda
            });
          }
        });
      },

      onUpdate: ({ editor }) => {
        // console.log('onUpdate', editor)
        onUpdate({ editor, html: editor.getHTML(), json: editor.getJSON() });
      },

      onPaste: (event, slice) => {
        // console.log('onPaste', event, slice)
        onPaste({ event, slice });
        const proseMirrorEl = $editor.view.dom;

        // Esperamos al siguiente frame para asegurarnos de que el DOM ya se actualizó
        requestAnimationFrame(() => {
          proseMirrorEl.childNodes.forEach((nodeEl: any) => {
            if (!(nodeEl instanceof HTMLElement)) return;

            nodeEl.addEventListener("mouseenter", (e) => {
              if (tooltipVisible && activeDropdownType === "insert-block")
                return;

              const rectEditor = proseMirrorEl.getBoundingClientRect();
              const target = e.target as HTMLElement;
              const nodeRect = target.getBoundingClientRect();

              // Posición relativa del nodo respecto al editor
              const offsetTop = nodeRect.top - rectEditor.top;

              // Posiciona el handle
              dragHandle.style.display = "flex";
              dragHandle.style.position = "absolute";
              dragHandle.style.top = `${offsetTop + 1}px`;
              dragHandle.style.left = `16px`;
            });
          });

          console.log(
            "Nodos pegados:",
            slice.content.content.map((n) => n.type.name)
          );
        });
      },

      onSelectionUpdate({ editor }) {
        // console.log('onSelectionUpdate', editor)
        // The selection has changed.
        onSelectionUpdate({ editor });
      },
      onFocus({ editor, event }) {
        // console.log('onFocus', editor, event)
        // The editor is focused.
        onFocus({ editor, event });
      },
      onBlur({ editor, event }) {
        // The editor isn’t focused anymore.
        // console.log('onBlur', editor, event)
        onBlur({ editor, event });
      },
      onDestroy() {
        // The editor is being destroyed.
        // console.log('onDestroy')
        onDestroyEditor({ editor, message: "onDestroy" });
      },
      onDrop(event: any, slice: any, moved: boolean) {
        // The editor is being pasted into.
        // console.log('onDrop', event, slice, moved)
        onDrop({ editor, event, slice, moved });
      },
      onDelete({ type, deletedRange, newRange, partial, from, to }) {
        // Content was deleted from the editor (either a node or mark).
        // console.log('onDelete', type, deletedRange, newRange, partial, from, to)
        onDelete({ editor, type, deletedRange, newRange, partial, from, to });
      },
      onContentError({ editor, error, disableCollaboration }) {
        // console.log('onContentError', editor, error, disableCollaboration)
        onContentError({ editor, error, disableCollaboration });
        // The editor content does not match the schema.
      },
    });

    const proseMirrorEl = $editor.view.dom;

    proseMirrorEl.childNodes.forEach((nodeEl: any) => {
      nodeEl.addEventListener("mouseenter", (e) => {
        if (tooltipVisible && activeDropdownType === "insert-block") return;

        const rectEditor = proseMirrorEl.getBoundingClientRect();
        const target = e.target as HTMLElement;
        // console.log(target);
        const nodeRect = target.getBoundingClientRect();

        // Posición relativa del nodo al editor
        const offsetTop = nodeRect.top - rectEditor.top;

        // Colocamos el handle centrado verticalmente al nodo
        dragHandle.style.display = "flex";
        dragHandle.style.position = "absolute";
        dragHandle.style.top = `${offsetTop + 1}px`;
        dragHandle.style.left = `16px`; // 8px de margen a la izquierda
      });
    });

    proseMirrorEl.addEventListener("mousemove", (e) => {
      if (tooltipVisible && activeDropdownType === "insert-block") return;

      const { clientX, clientY } = e;

      const rectEditor = proseMirrorEl.getBoundingClientRect();
      const gutterWidth = 4.5 * 16; // 4.5rem → px

      // Coordenada Y del ratón relativa al editor
      const relativeMouseY = clientY - rectEditor.top;

      // Solo si el cursor está en el gutter
      if (clientX > rectEditor.left + gutterWidth) {
        return;
      }

      let closestEl: any | null = null;
      let closestDistance = Infinity;

      proseMirrorEl.childNodes.forEach((node: any) => {
        if (!(node instanceof Element)) return;

        const rect = node.getBoundingClientRect();
        const rectRelativeTop = rect.top - rectEditor.top;
        const rectRelativeBottom = rect.bottom - rectEditor.top;

        // Caso 1: cursor dentro del nodo
        if (
          relativeMouseY >= rectRelativeTop &&
          relativeMouseY <= rectRelativeBottom
        ) {
          closestEl = node;
          closestDistance = 0;
          return;
        }

        // Caso 2: cursor fuera del nodo → distancia vertical
        const distance =
          relativeMouseY < rectRelativeTop
            ? rectRelativeTop - relativeMouseY // por arriba
            : relativeMouseY - rectRelativeBottom; // por abajo

        if (distance < closestDistance) {
          closestDistance = distance;
          closestEl = node;
        }
      });

      if (closestEl) {
        const isHrNode = closestEl.nodeName === "HR";
        startPos = $editor.view.posAtDOM(closestEl, 0, 1);
        afterPos = closestEl.pmViewDesc.posAfter;

        const nodeRect = closestEl.getBoundingClientRect();

        // Posición relativa del nodo al editor
        const offsetTop = nodeRect.top - rectEditor.top;
        const offsetLeft = nodeRect.left - rectEditor.left;

        // Colocamos el handle centrado verticalmente al nodo
        dragHandle.style.display = "block";
        dragHandle.style.position = "absolute";
        dragHandle.style.top = isHrNode
          ? `${offsetTop - 11}px`
          : `${offsetTop + 1}px`;
        dragHandle.style.left = `16px`; // 8px de margen a la izquierda
      }
    });
  });

  onDestroy(() => {
    if (editor) {
      $editor.destroy();
    }
  });

  function insertContent(type, options: any = {}) {
    const myNodePos = new NodePos(startPos, $editor);
    let extraPos = 1;

    let newContent = null;

    if (type === "paragraph") {
      newContent = { type: "paragraph" };
    } else if (type === "taskList") {
      extraPos = 2;
      newContent = {
        type: "taskList",
        content: [
          {
            type: "taskItem",
            attrs: { checked: false },
            content: [
              { type: "paragraph" }, // 👈 sin "content"
            ],
          },
        ],
      };
    } else if (type === "bulletList") {
      newContent = {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
              },
            ],
          },
        ],
      };
    } else if (type === "orderedList") {
      newContent = {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
              },
            ],
          },
        ],
      };
    } else if (type === "codeBlock") {
      newContent = {
        type: "codeBlock",
      };
    } else if (type === "quote") {
      newContent = {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
          },
        ],
      };
    } else if (type === "heading") {
      newContent = {
        type: "heading",
        attrs: { level: options.level || 1 },
      };
    } else if (type === "image") {
      let src = window.prompt("Enter the URL of the image:");
      if (!src) {
        alert("Please enter a valid URL");
        return;
      }

      newContent = {
        type: "image",
        attrs: { src },
      };
    } else if (type === "audio") {
      let src = window.prompt("Enter the URL of the audio:");
      if (!src) {
        alert("Please enter a valid URL");
        return;
      }

      newContent = {
        type: "audio",
        attrs: { src, controls: true },
      };
    } else if (type === "grid") {
      newContent = {
        type: "MediaGridComponent",
        attrs: { cols: 2 },
        content: [
          {
            type: "gridItem",
          },
          {
            type: "gridItem",
          },
        ],
      };
    } else if (type === "horizontalRule") {
      newContent = {
        type: "horizontalRule",
      };
    } else if (type === "table") {
      const rows = options.rows || 4;
      const cols = options.cols || 4;
      const withHeader = options.withHeaderRow !== false;

      const createCell = (cellType: string) => ({
        type: cellType,
        attrs: { colspan: 1, rowspan: 1 },
        content: [{ type: "paragraph" }],
      });

      const tableRows = Array.from({ length: rows }, (_, i) => ({
        type: "tableRow",
        content: Array.from({ length: cols }, () =>
          createCell(i === 0 && withHeader ? "tableHeader" : "tableCell")
        ),
      }));

      newContent = { type: "table", content: tableRows };
    }

    $editor
      .chain()
      .insertContentAt(afterPos, newContent)
      .focus(afterPos + extraPos)
      .run();

    hideDropdown();

    // 2. Vuelve a mirar el estado (nuevo doc)
    const state = $editor.state;
    const pos = state.doc.resolve(afterPos);

    // 3. El nodo insertado está en nodeAfter
    const insertedNode = pos.nodeAfter;
    // console.log("Nodo insertado:", insertedNode?.type.name, insertedNode);

    // 4. Posiciones del nuevo nodo
    const newStart = afterPos;
    const newEnd = afterPos + (insertedNode?.nodeSize ?? 0);
    // console.log({ newStart, newEnd });

    startPos = newStart;
    afterPos = newEnd;

    // 👇 aquí podrías recalcular el drag-handle
    // usando posToDOM para obtener el DOM del nuevo nodo
    const dom = $editor.view.nodeDOM(newStart) as HTMLElement;

    if (dom) {
      const isHrNode = dom.nodeName === "HR";

      const proseMirrorEl = $editor.view.dom;

      const rectEditor = proseMirrorEl.getBoundingClientRect();
      const nodeRect = dom.getBoundingClientRect();

      const offsetTop = nodeRect.top - rectEditor.top;

      const dragHandle = document.querySelector(".drag-handle") as HTMLElement;
      dragHandle.style.display = "block";
      dragHandle.style.top = isHrNode
        ? `${offsetTop - 11}px`
        : `${offsetTop + 1}px`;

      dom.addEventListener("mouseenter", (e) => {
        if (tooltipVisible && activeDropdownType === "insert-block") return;

        const rectEditor = proseMirrorEl.getBoundingClientRect();
        const target = e.target as HTMLElement;
        // console.log(target);
        const nodeRect = target.getBoundingClientRect();

        // Posición relativa del nodo al editor
        const offsetTop = nodeRect.top - rectEditor.top;

        // Colocamos el handle centrado verticalmente al nodo
        dragHandle.style.display = "flex";
        dragHandle.style.position = "absolute";
        dragHandle.style.top = isHrNode
          ? `${offsetTop - 11}px`
          : `${offsetTop + 1}px`;
        dragHandle.style.left = `16px`; // 8px de margen a la izquierda
      });
    }
  }

  function insertImage() {
    const url = window.prompt("Enter the URL of the image:");
    if (url) {
      $editor.chain().focus().setImage({ src: url }).run();
    }
  }

  function setLink() {
    const previousUrl = $editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      $editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    try {
      $editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();

      setTimeout(() => {
        const allLinks = $editor.view.dom.querySelectorAll("a");
        allLinks.forEach((link: any) => {
          link.addEventListener("click", (e: any) => {
            e.preventDefault();
            // console.log("Prevented navigation:", link.getAttribute("href"));
          });
        });
      }, 100);
    } catch (e) {
      alert(e.message);
    }
  }

  function insertBlockHandler(e: MouseEvent) {
    const target = e.target as HTMLElement;
    toogleDropdown(target, "insert-block");
  }
</script>

{#if $editor}
  <!-- General Menu -->
  <BubbleMenu
    options={{ placement: "top", offset: bubbleOffset, flip: false }}
    editor={$editor}
    shouldShow={() => {
      const emptySelection = $editor.state.selection.empty;
      const isImage = $editor.isActive("image");
      const isCodeBlock = $editor.isActive("codeBlock");
      const isAudio = $editor.isActive("audio");
      const selection = $editor.state.selection;
      const isRow = $editor.storage.tableCell.customTableSelection === "row";
      const isColumn =
        $editor.storage.tableCell.customTableSelection === "column";

      // ⛔️ Ocultar si hay flag de selección completa por fila/columna
      if (isRow || isColumn) {
        console.log(
          "Ocultar si hay flag de selección completa por fila/columna"
        );
        return false;
      }

      // // ⛔️ Ocultar si es CellSelection completa (por seguridad)
      // if (selection instanceof CellSelection) {
      //   return false;
      // }

      if (emptySelection || isImage || isCodeBlock || isAudio) {
        return false;
      }
      return true;
    }}
  >
    <div data-test-id="bubble-menu" class="fl-bubble-menu flex">
      <div role="group" class="fl-rich-text-toolbar-group">
        <button
          type="button"
          onclick={() => $editor.chain().focus().toggleBold().run()}
          disabled={!$editor.can().chain().focus().toggleBold().run()}
          class="fl-bubble-menu-mark-button"
          class:is-active={$editor.isActive("bold")}
          aria-label="Bold"
        >
          <svg
            width="24"
            height="24"
            class="fl-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 2.5C5.17157 2.5 4.5 3.17157 4.5 4V20C4.5 20.8284 5.17157 21.5 6 21.5H15C16.4587 21.5 17.8576 20.9205 18.8891 19.8891C19.9205 18.8576 20.5 17.4587 20.5 16C20.5 14.5413 19.9205 13.1424 18.8891 12.1109C18.6781 11.9 18.4518 11.7079 18.2128 11.5359C19.041 10.5492 19.5 9.29829 19.5 8C19.5 6.54131 18.9205 5.14236 17.8891 4.11091C16.8576 3.07946 15.4587 2.5 14 2.5H6ZM14 10.5C14.663 10.5 15.2989 10.2366 15.7678 9.76777C16.2366 9.29893 16.5 8.66304 16.5 8C16.5 7.33696 16.2366 6.70107 15.7678 6.23223C15.2989 5.76339 14.663 5.5 14 5.5H7.5V10.5H14ZM7.5 18.5V13.5H15C15.663 13.5 16.2989 13.7634 16.7678 14.2322C17.2366 14.7011 17.5 15.337 17.5 16C17.5 16.663 17.2366 17.2989 16.7678 17.7678C16.2989 18.2366 15.663 18.5 15 18.5H7.5Z"
              fill="currentColor"
            ></path></svg
          >
        </button>

        <button
          type="button"
          onclick={() => $editor.chain().focus().toggleItalic().run()}
          disabled={!$editor.can().chain().focus().toggleItalic().run()}
          class="fl-bubble-menu-mark-button"
          class:is-active={$editor.isActive("italic")}
          aria-label="Italic"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M15.0222 3H19C19.5523 3 20 3.44772 20 4C20 4.55228 19.5523 5 19 5H15.693L10.443 19H14C14.5523 19 15 19.4477 15 20C15 20.5523 14.5523 21 14 21H9.02418C9.00802 21.0004 8.99181 21.0004 8.97557 21H5C4.44772 21 4 20.5523 4 20C4 19.4477 4.44772 19 5 19H8.30704L13.557 5H10C9.44772 5 9 4.55228 9 4C9 3.44772 9.44772 3 10 3H14.9782C14.9928 2.99968 15.0075 2.99967 15.0222 3Z"
              fill="currentColor"
            ></path></svg
          >
        </button>

        <button
          type="button"
          onclick={() => $editor.chain().focus().toggleUnderline().run()}
          disabled={!$editor.can().chain().focus().toggleStrike().run()}
          class="fl-bubble-menu-mark-button"
          class:is-active={$editor.isActive("underline")}
          aria-label="Underline"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M7 4C7 3.44772 6.55228 3 6 3C5.44772 3 5 3.44772 5 4V10C5 11.8565 5.7375 13.637 7.05025 14.9497C8.36301 16.2625 10.1435 17 12 17C13.8565 17 15.637 16.2625 16.9497 14.9497C18.2625 13.637 19 11.8565 19 10V4C19 3.44772 18.5523 3 18 3C17.4477 3 17 3.44772 17 4V10C17 11.3261 16.4732 12.5979 15.5355 13.5355C14.5979 14.4732 13.3261 15 12 15C10.6739 15 9.40215 14.4732 8.46447 13.5355C7.52678 12.5979 7 11.3261 7 10V4ZM4 19C3.44772 19 3 19.4477 3 20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20C21 19.4477 20.5523 19 20 19H4Z"
              fill="currentColor"
            ></path></svg
          >
        </button>

        <button
          type="button"
          onclick={() => $editor.chain().focus().toggleStrike().run()}
          disabled={!$editor.can().chain().focus().toggleStrike().run()}
          class="fl-bubble-menu-mark-button"
          class:is-active={$editor.isActive("strike")}
          aria-label="Strike"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M9.00039 3H16.0001C16.5524 3 17.0001 3.44772 17.0001 4C17.0001 4.55229 16.5524 5 16.0001 5H9.00011C8.68006 4.99983 8.36412 5.07648 8.07983 5.22349C7.79555 5.37051 7.55069 5.5836 7.36585 5.84487C7.181 6.10614 7.06155 6.40796 7.01754 6.72497C6.97352 7.04198 7.00623 7.36492 7.11292 7.66667C7.29701 8.18737 7.02414 8.75872 6.50344 8.94281C5.98274 9.1269 5.4114 8.85403 5.2273 8.33333C5.01393 7.72984 4.94851 7.08396 5.03654 6.44994C5.12456 5.81592 5.36346 5.21229 5.73316 4.68974C6.10285 4.1672 6.59256 3.74101 7.16113 3.44698C7.72955 3.15303 8.36047 2.99975 9.00039 3Z"
              fill="currentColor"
            ></path><path
              d="M18 13H20C20.5523 13 21 12.5523 21 12C21 11.4477 20.5523 11 20 11H4C3.44772 11 3 11.4477 3 12C3 12.5523 3.44772 13 4 13H14C14.7956 13 15.5587 13.3161 16.1213 13.8787C16.6839 14.4413 17 15.2044 17 16C17 16.7956 16.6839 17.5587 16.1213 18.1213C15.5587 18.6839 14.7956 19 14 19H6C5.44772 19 5 19.4477 5 20C5 20.5523 5.44772 21 6 21H14C15.3261 21 16.5979 20.4732 17.5355 19.5355C18.4732 18.5979 19 17.3261 19 16C19 14.9119 18.6453 13.8604 18 13Z"
              fill="currentColor"
            ></path></svg
          >
        </button>

        <button
          type="button"
          onclick={() => $editor.chain().focus().toggleCode().run()}
          disabled={!$editor.can().chain().focus().toggleCode().run()}
          class="fl-bubble-menu-mark-button"
          class:is-active={$editor.isActive("code")}
          aria-label="Code"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M15.4545 4.2983C15.6192 3.77115 15.3254 3.21028 14.7983 3.04554C14.2712 2.88081 13.7103 3.1746 13.5455 3.70175L8.54554 19.7017C8.38081 20.2289 8.6746 20.7898 9.20175 20.9545C9.72889 21.1192 10.2898 20.8254 10.4545 20.2983L15.4545 4.2983Z"
              fill="currentColor"
            ></path><path
              d="M6.70711 7.29289C7.09763 7.68342 7.09763 8.31658 6.70711 8.70711L3.41421 12L6.70711 15.2929C7.09763 15.6834 7.09763 16.3166 6.70711 16.7071C6.31658 17.0976 5.68342 17.0976 5.29289 16.7071L1.29289 12.7071C0.902369 12.3166 0.902369 11.6834 1.29289 11.2929L5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289Z"
              fill="currentColor"
            ></path><path
              d="M17.2929 7.29289C17.6834 6.90237 18.3166 6.90237 18.7071 7.29289L22.7071 11.2929C23.0976 11.6834 23.0976 12.3166 22.7071 12.7071L18.7071 16.7071C18.3166 17.0976 17.6834 17.0976 17.2929 16.7071C16.9024 16.3166 16.9024 15.6834 17.2929 15.2929L20.5858 12L17.2929 8.70711C16.9024 8.31658 16.9024 7.68342 17.2929 7.29289Z"
              fill="currentColor"
            ></path></svg
          >
        </button>

        <button
          type="button"
          onclick={() => setLink()}
          class="fl-bubble-menu-mark-button"
          class:is-active={$editor.isActive("link")}
          aria-label="Link"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M16.9958 1.06669C15.4226 1.05302 13.907 1.65779 12.7753 2.75074L12.765 2.76086L11.045 4.47086C10.6534 4.86024 10.6515 5.49341 11.0409 5.88507C11.4303 6.27673 12.0634 6.27858 12.4551 5.88919L14.1697 4.18456C14.9236 3.45893 15.9319 3.05752 16.9784 3.06662C18.0272 3.07573 19.0304 3.49641 19.772 4.23804C20.5137 4.97967 20.9344 5.98292 20.9435 7.03171C20.9526 8.07776 20.5515 9.08563 19.8265 9.83941L16.833 12.8329C16.4274 13.2386 15.9393 13.5524 15.4019 13.7529C14.8645 13.9533 14.2903 14.0359 13.7181 13.9949C13.146 13.9539 12.5894 13.7904 12.0861 13.5154C11.5827 13.2404 11.1444 12.8604 10.8008 12.401C10.47 11.9588 9.84333 11.8685 9.40108 12.1993C8.95883 12.5301 8.86849 13.1568 9.1993 13.599C9.71464 14.288 10.3721 14.858 11.1272 15.2705C11.8822 15.683 12.7171 15.9283 13.5753 15.9898C14.4334 16.0513 15.2948 15.9274 16.1009 15.6267C16.907 15.326 17.639 14.8555 18.2473 14.247L21.2472 11.2471L21.2593 11.2347C22.3523 10.1031 22.9571 8.58751 22.9434 7.01433C22.9297 5.44115 22.2987 3.93628 21.1863 2.82383C20.0738 1.71138 18.5689 1.08036 16.9958 1.06669Z"
              fill="currentColor"
            ></path><path
              d="M10.4247 8.0102C9.56657 7.94874 8.70522 8.07256 7.89911 8.37326C7.09305 8.67395 6.36096 9.14458 5.75272 9.753L2.75285 12.7529L2.74067 12.7653C1.64772 13.8969 1.04295 15.4125 1.05662 16.9857C1.07029 18.5589 1.70131 20.0637 2.81376 21.1762C3.9262 22.2886 5.43108 22.9196 7.00426 22.9333C8.57744 22.947 10.0931 22.3422 11.2247 21.2493L11.2371 21.2371L12.9471 19.5271C13.3376 19.1366 13.3376 18.5034 12.9471 18.1129C12.5565 17.7223 11.9234 17.7223 11.5328 18.1129L9.82932 19.8164C9.07555 20.5414 8.06768 20.9425 7.02164 20.9334C5.97285 20.9243 4.9696 20.5036 4.22797 19.762C3.48634 19.0203 3.06566 18.0171 3.05655 16.9683C3.04746 15.9222 3.44851 14.9144 4.17355 14.1606L7.16719 11.167C7.5727 10.7613 8.06071 10.4476 8.59811 10.2471C9.13552 10.0467 9.70976 9.96412 10.2819 10.0051C10.854 10.0461 11.4106 10.2096 11.9139 10.4846C12.4173 10.7596 12.8556 11.1397 13.1992 11.599C13.53 12.0412 14.1567 12.1316 14.5989 11.8007C15.0412 11.4699 15.1315 10.8433 14.8007 10.401C14.2854 9.71205 13.6279 9.14198 12.8729 8.72948C12.1178 8.31697 11.2829 8.07166 10.4247 8.0102Z"
              fill="currentColor"
            ></path></svg
          >
        </button>

        <button
          class="fl-bubble-menu-mark-button"
          type="button"
          aria-label="Highlight"
          onclick={(e) => toogleDropdown(e.currentTarget, "highlight")}
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.7072 4.70711C15.0977 4.31658 15.0977 3.68342 14.7072 3.29289C14.3167 2.90237 13.6835 2.90237 13.293 3.29289L8.69294 7.89286L8.68594 7.9C8.13626 8.46079 7.82837 9.21474 7.82837 10C7.82837 10.2306 7.85491 10.4584 7.90631 10.6795L2.29289 16.2929C2.10536 16.4804 2 16.7348 2 17V20C2 20.5523 2.44772 21 3 21H12C12.2652 21 12.5196 20.8946 12.7071 20.7071L15.3205 18.0937C15.5416 18.1452 15.7695 18.1717 16.0001 18.1717C16.7853 18.1717 17.5393 17.8639 18.1001 17.3142L22.7072 12.7071C23.0977 12.3166 23.0977 11.6834 22.7072 11.2929C22.3167 10.9024 21.6835 10.9024 21.293 11.2929L16.6971 15.8887C16.5105 16.0702 16.2605 16.1717 16.0001 16.1717C15.7397 16.1717 15.4897 16.0702 15.303 15.8887L10.1113 10.697C9.92992 10.5104 9.82837 10.2604 9.82837 10C9.82837 9.73963 9.92992 9.48958 10.1113 9.30297L14.7072 4.70711ZM13.5858 17L9.00004 12.4142L4 17.4142V19H11.5858L13.5858 17Z"
              fill="currentColor"
            ></path>
          </svg>
          <svg
            class="toogle-dropdown-button-icon"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            ></path>
          </svg>
        </button>

        <button
          aria-label="Text color"
          type="button"
          bind:this={textColorDropdownTriggerEl}
          onclick={() =>
            toogleDropdown(textColorDropdownTriggerEl, "text-color")}
          class="fl-bubble-menu-mark-button"
        >
          <span
            class="fl-button-color-text-popover"
            style="background: {$editor?.getAttributes('textStyle')?.color ||
              'currentColor'}"
          ></span>

          <svg
            class="toogle-dropdown-button-icon"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 4 4 4-4"
            ></path>
          </svg>
        </button>

        {#if !isCellSelection()}
          <button
            class="fl-bubble-menu-mark-button"
            type="button"
            onclick={() => $editor.chain().focus().setHardBreak().run()}
            aria-label="Hard break"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-corner-down-left"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path
                d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4"
              ></path></svg
            >
          </button>
        {/if}

        {#if isCellSelection()}
          <button
            class="fl-bubble-menu-mark-button"
            type="button"
            aria-label="Merge cells"
            title="Merge cells"
            onclick={() => $editor?.chain().focus().mergeCells().run()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="opacity:1;"
              ><path d="M12 21v-6m0-6V3M3 15h18M3 9h18"></path><rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="2"
              ></rect></svg
            >
          </button>

          <button
            class="fl-bubble-menu-mark-button"
            type="button"
            aria-label="Split cell"
            title="Split cell"
            onclick={() => $editor?.chain().focus().splitCell().run()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="opacity:1;"
              ><path d="M12 15V9m-9 6h18M3 9h18" /><rect
                width="18"
                height="18"
                x="3"
                y="3"
                rx="2"
              /></svg
            >
          </button>
        {/if}
      </div>
    </div>

    <div
      class="fl-toolbar-dropdown-panel"
      bind:this={tooltip}
      style="display: {tooltipVisible
        ? 'flex'
        : 'none'}; left: {tooltipX}px; top: {tooltipY}px;"
    >
      {#if activeDropdownType === "text-color"}
        <div class="fl-editor-color-palette">
          <button
            class="fl-color-swatch fl-color-picker-btn"
            aria-label="Text color picker"
            type="button"
          >
            <input
              type="color"
              onchange={(event: any) => {
                recentCustomColors = [
                  ...recentCustomColors,
                  event?.target?.value,
                ];
                $editor.chain().focus().setColor(event?.target?.value).run();
                hideDropdown();
              }}
              value={rgbToHex($editor?.getAttributes("textStyle")?.color)}
              data-testid="setColor"
              id="colorPicker"
            />
          </button>

          {#each TEXT_COLOR_PALETTE as color}
            <button
              class="fl-color-swatch"
              class:active={$editor?.isActive("textStyle", {
                color: color,
              })}
              onclick={() => {
                $editor?.chain().focus().setColor(color).run();
                hideDropdown();
              }}
              style="background-color: {color};"
              aria-label={color}
            >
            </button>
          {/each}

          <button
            class="fl-color-swatch unset-color"
            onclick={() => {
              $editor?.chain().focus().unsetColor().run();
              hideDropdown();
            }}
            style="background-color: #ffffff;"
            aria-label="Unset color"
          >
          </button>

          {#if recentCustomColors.length > 0}
            {#each recentCustomColors as color}
              <button
                class="fl-color-swatch"
                class:active={$editor?.isActive("textStyle", {
                  color: color,
                })}
                onclick={() => {
                  $editor?.chain().focus().setColor(color).run();
                  hideDropdown();
                }}
                style="background-color: {color};"
                aria-label={color}
              >
              </button>
            {/each}
          {:else}
            <button
              class="fl-color-swatch"
              style="outline: 1px dashed #ffffff66;background: transparent;"
              onclick={() => alert("Not implemented yet")}
              aria-label="Add new color"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
                style="
                  width: 11px;
                  height: 11px;
              "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                ></path>
              </svg>
            </button>

            <button
              class="fl-color-swatch"
              style="outline: 1px dashed #ffffff66;background: transparent;"
              onclick={() => alert("Not implemented yet")}
              aria-label="Add new color"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
                style="
                  width: 11px;
                  height: 11px;
              "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                ></path>
              </svg>
            </button>
          {/if}
        </div>
      {:else if activeDropdownType === "highlight"}
        <div class="fl-editor-color-palette">
          <button
            class="fl-color-swatch fl-color-picker-btn"
            aria-label="Highlight color picker"
            type="button"
          >
            <input
              type="color"
              onchange={(event: any) => {
                recentCustomColors = [
                  ...recentCustomColors,
                  event?.target?.value,
                ];
                $editor
                  .chain()
                  .focus()
                  .setHighlight({ color: event?.target?.value })
                  .run();
                hideDropdown();
              }}
              value={rgbToHex($editor?.getAttributes("textStyle")?.color)}
              data-testid="setHiglight"
              id="colorPicker"
            />
          </button>

          {#each HIGHLIGHT_COLOR_PALETTE as color}
            <button
              class="fl-color-swatch"
              class:active={$editor?.isActive("textStyle", {
                color: color,
              })}
              onclick={() => {
                $editor?.chain().focus().setHighlight({ color }).run();
                hideDropdown();
              }}
              style="background-color: {color};"
              aria-label={color}
            >
            </button>
          {/each}

          <button
            class="fl-color-swatch unset-color"
            onclick={() => {
              $editor?.chain().focus().unsetColor().run();
              hideDropdown();
            }}
            style="background-color: #ffffff;"
            aria-label="Unset color"
          >
          </button>

          {#if recentCustomColors.length > 0}
            {#each recentCustomColors as color}
              <button
                class="fl-color-swatch"
                class:active={$editor?.isActive("textStyle", {
                  color: color,
                })}
                onclick={() => {
                  $editor?.chain().focus().setHighlight({ color }).run();
                  hideDropdown();
                }}
                style="background-color: {color};"
                aria-label={color}
              >
              </button>
            {/each}
          {:else}
            <button
              class="fl-color-swatch"
              style="outline: 1px dashed #ffffff66;background: transparent;"
              onclick={() => alert("Not implemented yet")}
              aria-label="Add new color"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
                style="
                  width: 11px;
                  height: 11px;
              "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                ></path>
              </svg>
            </button>

            <button
              class="fl-color-swatch"
              style="outline: 1px dashed #ffffff66;background: transparent;"
              onclick={() => alert("Not implemented yet")}
              aria-label="Add new color"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
                style="
                  width: 11px;
                  height: 11px;
              "
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                ></path>
              </svg>
            </button>
          {/if}
        </div>
      {:else if activeDropdownType === "insert-block"}
        <div class="insert-block-options">
          <div class="insert-block-options-group-grid">
            <button onclick={() => insertContent("heading", { level: 1 })}
              >H1</button
            >
            <button onclick={() => insertContent("heading", { level: 2 })}
              >H2</button
            >
            <button onclick={() => insertContent("heading", { level: 3 })}
              >H3</button
            >
            <button onclick={() => insertContent("heading", { level: 4 })}
              >H4</button
            >
            <button onclick={() => insertContent("heading", { level: 5 })}
              >H5</button
            >
            <button onclick={() => insertContent("heading", { level: 6 })}
              >H6</button
            >
          </div>

          <button onclick={() => insertContent("grid")}>Grid</button>
          <button onclick={() => insertContent("paragraph")}>Paragraph</button>
          <button onclick={() => insertContent("bulletList")}
            >Bullet list</button
          >
          <button onclick={() => insertContent("orderedList")}
            >Ordered list</button
          >
          <button onclick={() => insertContent("taskList")}>Task list</button>
          <button onclick={() => insertContent("codeBlock")}>Code block</button>
          <button onclick={() => insertContent("quote")}>Quote</button>
          <button onclick={() => insertContent("horizontalRule")}
            >Horizontal rule</button
          >
          <!-- <button onclick={() => insertImage()}>Inline image</button> -->
          <button onclick={() => insertContent("image")}>Block image</button>
          <button onclick={() => insertContent("audio")}> Audio </button>
          <button
            onclick={() =>
              insertContent("table", { rows: 4, cols: 4, withHeaderRow: true })}
          >
            Table
          </button>
        </div>
      {:else if activeDropdownType === "table"}
        <div class="table-dropdown-options">
          <div
            role="option"
            tabindex="-1"
            id=":r16k:"
            style="user-select: none;transition: background 20ms ease-in;cursor: pointer;width: 100%;display: flex;border-radius: 8px;"
          >
            <div
              style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;padding-inline: 4px;"
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
                    class="arrowStraightUp"
                    style="width: 18px;height: 18px;display: block;fill: currentColor;flex-shrink: 0;"
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
          </div>

          <div
            role="option"
            tabindex="-1"
            id=":r16k:"
            style="user-select: none;transition: background 20ms ease-in;cursor: pointer;width: 100%;display: flex;border-radius: 8px;"
          >
            <div
              style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;/* padding-inline: 8px; */padding-inline: 4px;"
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
                    class="arrowStraightUp"
                    style="width: 18px;height: 18px;display: block;fill: currentColor;flex-shrink: 0;transform: scaleY(-1);"
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
          </div>

          <div
            role="option"
            tabindex="-1"
            id=":r16k:"
            style="user-select: none;transition: background 20ms ease-in;cursor: pointer;width: 100%;display: flex;border-radius: 8px;"
          >
            <div
              style="display: flex;align-items: center;gap: 7px;line-height: 120%;width: 100%;user-select: none;min-height: 28px;font-size: 14px;/* padding-inline: 8px; */padding-inline: 4px;"
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
                    class="trash"
                    style="width: 20px;height: 20px;display: block;fill: currentColor;flex-shrink: 0;"
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
          </div>
        </div>
      {/if}
    </div>
  </BubbleMenu>

  <!-- Image Menu -->
  <BubbleMenu
    editor={$editor}
    shouldShow={() => {
      const emptySelection = $editor.state.selection.empty;
      if (emptySelection) {
        return false;
      }
      return $editor.isActive("image");
    }}
  >
    <div data-test-id="bubble-menu" class="fl-bubble-menu flex">
      <input
        class="fl-editor-image-url-input"
        type="text"
        placeholder="Insert image url"
        bind:this={imageUrlInputEl}
        value={$editor.getAttributes("image").src}
        oninput={(e: any) => {
          // console.log(e.target.value);
          imageUrlInputValue = e.target.value;
        }}
        onkeydown={(e: any) => {
          if (e.key === "Enter") {
            e.preventDefault();
            $editor
              .chain()
              .focus()
              .setImage({ src: imageUrlInputEl?.value })
              .run();
          }
        }}
      />
      <button
        type="button"
        aria-label="Insert image from url"
        disabled={!imageUrlInputValue ||
          imageUrlInputValue === $editor.getAttributes("image").src}
        class:is-active={imageUrlInputValue &&
          imageUrlInputValue !== $editor.getAttributes("image").src}
        onclick={() => {
          $editor
            .chain()
            .focus()
            .setImage({ src: imageUrlInputEl?.value })
            .run();
        }}
      >
        <svg
          width="16"
          height="16"
          class="tiptap-button-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21 4C21 3.44772 20.5523 3 20 3C19.4477 3 19 3.44772 19 4V11C19 11.7956 18.6839 12.5587 18.1213 13.1213C17.5587 13.6839 16.7956 14 16 14H6.41421L9.70711 10.7071C10.0976 10.3166 10.0976 9.68342 9.70711 9.29289C9.31658 8.90237 8.68342 8.90237 8.29289 9.29289L3.29289 14.2929C2.90237 14.6834 2.90237 15.3166 3.29289 15.7071L8.29289 20.7071C8.68342 21.0976 9.31658 21.0976 9.70711 20.7071C10.0976 20.3166 10.0976 19.6834 9.70711 19.2929L6.41421 16H16C17.3261 16 18.5979 15.4732 19.5355 14.5355C20.4732 13.5979 21 12.3261 21 11V4Z"
            fill="currentColor"
            class="s-m1-89pp0R0Iu"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() => setLink()}
        class="fl-bubble-menu-mark-button"
        class:is-active={$editor.isActive("link")}
        aria-label="Link"
      >
        <svg
          width="16"
          height="16"
          class="tiptap-button-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            d="M16.9958 1.06669C15.4226 1.05302 13.907 1.65779 12.7753 2.75074L12.765 2.76086L11.045 4.47086C10.6534 4.86024 10.6515 5.49341 11.0409 5.88507C11.4303 6.27673 12.0634 6.27858 12.4551 5.88919L14.1697 4.18456C14.9236 3.45893 15.9319 3.05752 16.9784 3.06662C18.0272 3.07573 19.0304 3.49641 19.772 4.23804C20.5137 4.97967 20.9344 5.98292 20.9435 7.03171C20.9526 8.07776 20.5515 9.08563 19.8265 9.83941L16.833 12.8329C16.4274 13.2386 15.9393 13.5524 15.4019 13.7529C14.8645 13.9533 14.2903 14.0359 13.7181 13.9949C13.146 13.9539 12.5894 13.7904 12.0861 13.5154C11.5827 13.2404 11.1444 12.8604 10.8008 12.401C10.47 11.9588 9.84333 11.8685 9.40108 12.1993C8.95883 12.5301 8.86849 13.1568 9.1993 13.599C9.71464 14.288 10.3721 14.858 11.1272 15.2705C11.8822 15.683 12.7171 15.9283 13.5753 15.9898C14.4334 16.0513 15.2948 15.9274 16.1009 15.6267C16.907 15.326 17.639 14.8555 18.2473 14.247L21.2472 11.2471L21.2593 11.2347C22.3523 10.1031 22.9571 8.58751 22.9434 7.01433C22.9297 5.44115 22.2987 3.93628 21.1863 2.82383C20.0738 1.71138 18.5689 1.08036 16.9958 1.06669Z"
            fill="currentColor"
          ></path><path
            d="M10.4247 8.0102C9.56657 7.94874 8.70522 8.07256 7.89911 8.37326C7.09305 8.67395 6.36096 9.14458 5.75272 9.753L2.75285 12.7529L2.74067 12.7653C1.64772 13.8969 1.04295 15.4125 1.05662 16.9857C1.07029 18.5589 1.70131 20.0637 2.81376 21.1762C3.9262 22.2886 5.43108 22.9196 7.00426 22.9333C8.57744 22.947 10.0931 22.3422 11.2247 21.2493L11.2371 21.2371L12.9471 19.5271C13.3376 19.1366 13.3376 18.5034 12.9471 18.1129C12.5565 17.7223 11.9234 17.7223 11.5328 18.1129L9.82932 19.8164C9.07555 20.5414 8.06768 20.9425 7.02164 20.9334C5.97285 20.9243 4.9696 20.5036 4.22797 19.762C3.48634 19.0203 3.06566 18.0171 3.05655 16.9683C3.04746 15.9222 3.44851 14.9144 4.17355 14.1606L7.16719 11.167C7.5727 10.7613 8.06071 10.4476 8.59811 10.2471C9.13552 10.0467 9.70976 9.96412 10.2819 10.0051C10.854 10.0461 11.4106 10.2096 11.9139 10.4846C12.4173 10.7596 12.8556 11.1397 13.1992 11.599C13.53 12.0412 14.1567 12.1316 14.5989 11.8007C15.0412 11.4699 15.1315 10.8433 14.8007 10.401C14.2854 9.71205 13.6279 9.14198 12.8729 8.72948C12.1178 8.31697 11.2829 8.07166 10.4247 8.0102Z"
            fill="currentColor"
          ></path></svg
        >
      </button>
    </div>
  </BubbleMenu>
{/if}

<div class="fl-rich-text {className}" class:editable>
  <div class="fl-rich-text-content">
    <EditorContent editor={$editor} />
    <div class="drag-handle" draggable="true">
      <div
        class="tiptap-button-group"
        data-orientation="horizontal"
        role="group"
        style=""
      >
        <button
          onclick={insertBlockHandler}
          type="button"
          class="tiptap-button"
          aria-label="Insert block"
          data-style="ghost"
          tabindex="-1"
          data-disabled="false"
          data-weight="small"
          aria-describedby="_r_6_"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5Z"
              fill="currentColor"
            ></path>
          </svg>
        </button>
        <button
          aria-label="Block settings"
          data-tooltip-state="closed"
          class="tiptap-button tiptap-menu-button"
          data-style="ghost"
          tabindex="-1"
          data-weight="small"
          aria-expanded="false"
          aria-haspopup="menu"
          id="_r_9_"
          style="cursor: grab;"
          type="button"
        >
          <svg
            width="24"
            height="24"
            class="tiptap-button-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M9 3C7.89543 3 7 3.89543 7 5C7 6.10457 7.89543 7 9 7C10.1046 7 11 6.10457 11 5C11 3.89543 10.1046 3 9 3Z"
              fill="currentColor"
            ></path><path
              d="M9 10C7.89543 10 7 10.8954 7 12C7 13.1046 7.89543 14 9 14C10.1046 14 11 13.1046 11 12C11 10.8954 10.1046 10 9 10Z"
              fill="currentColor"
            ></path><path
              d="M7 19C7 17.8954 7.89543 17 9 17C10.1046 17 11 17.8954 11 19C11 20.1046 10.1046 21 9 21C7.89543 21 7 20.1046 7 19Z"
              fill="currentColor"
            ></path><path
              d="M15 10C13.8954 10 13 10.8954 13 12C13 13.1046 13.8954 14 15 14C16.1046 14 17 13.1046 17 12C17 10.8954 16.1046 10 15 10Z"
              fill="currentColor"
            ></path><path
              d="M13 5C13 3.89543 13.8954 3 15 3C16.1046 3 17 3.89543 17 5C17 6.10457 16.1046 7 15 7C13.8954 7 13 6.10457 13 5Z"
              fill="currentColor"
            ></path><path
              d="M15 17C13.8954 17 13 17.8954 13 19C13 20.1046 13.8954 21 15 21C16.1046 21 17 20.1046 17 19C17 17.8954 16.1046 17 15 17Z"
              fill="currentColor"
            ></path></svg
          >
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .flex-auto {
    flex: auto;
  }

  .fl-rich-text {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 56px;
    border-radius: 10px;
    overflow: hidden;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid #eeeeee0d;
    box-sizing: border-box;
  }

  .fl-rich-text-toolbar {
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    align-items: center;
    gap: var(--toolbar-gap);
    padding: var(--toolbar-padding);

    .fl-rich-text-toolbar-button {
      padding: 7px 8px;
      flex: auto;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text-color);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      gap: 2px;
      cursor: pointer;
      min-width: 32px;
      height: 32px;

      &.is-active {
        background: var(--purple);
        color: white;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .toogle-dropdown-button-icon {
        width: 7px;
        height: 7px;
        margin-left: 4px;
      }
    }
  }

  :global(.fl-rich-text-toolbar button svg) {
    width: 16px;
    height: 16px;
  }

  .fl-rich-text-toolbar-group {
    display: flex;
    flex-wrap: nowrap;
    gap: var(--toolbar-gap);
  }

  .fl-rich-text-content {
    outline: none;
    position: relative;
    display: flex;
    flex-direction: column;
    text-align: left;
    min-height: 56px;
    box-sizing: border-box;
    width: 100%;
    /* background: #242424; */
  }

  .tiptap-button-group {
    display: flex;
    align-items: center;
    gap: 4px;

    & button {
      background: transparent;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      backdrop-filter: blur(5px);
      border-radius: 8px;
      cursor: pointer;

      & svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  .drag-handle {
    position: absolute;
    pointer-events: auto;
    left: 16px;
    top: 240px;
    display: none;
  }

  :global(.ProseMirror) {
    padding: 3.5rem 4.5rem;
  }

  :global(.ProseMirror-selectednode) {
    outline: 2px solid #535bf2;
  }

  :global(.ProseMirror img) {
    max-width: 100%;
    max-height: 520px;
    aspect-ratio: 16 / 9;
  }

  .fl-editor-image-url-input {
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 158px;
    outline: none;
    min-height: 24px;
    padding: 0 3px;
    border: none;
    background: transparent;
    line-height: 1.6;
  }

  .fl-bubble-menu {
    padding: 6px;
    background: #2626268c;
    border: 1px solid #ffffff12;
    backdrop-filter: blur(42px);
    border-radius: 14px;
    display: flex;
    gap: 6px;
    position: relative;
    z-index: 10;

    button {
      border-radius: 9px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 11px;
      min-width: 30px;
      min-height: 30px;
      background: #78787870;
      transition: background 0.3s ease;
      cursor: pointer;

      &.fl-bubble-menu-mark-button {
        padding-inline: 6px;

        svg {
          width: 16px;
          height: 16px;

          &.toogle-dropdown-button-icon {
            width: 8px;
            margin: 0 2px 0 6px;
          }
        }
      }

      &.is-active {
        background: var(--purple);
        color: white;
      }
    }
  }

  .fl-button-color-text-popover {
    color: inherit;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    border: 1px solid #d7d7d78a;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fl-editor-color-palette {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    align-items: center;

    .fl-color-swatch {
      display: flex;
      min-width: 17px;
      border-radius: 100%;
      align-items: center;
      justify-content: center;
      outline: 1px solid #83828238;
      position: relative;
      aspect-ratio: 1;
      border: none;
      padding: 0;
      cursor: pointer;

      &.active {
        box-shadow: 0 0 0 2px #ffffff30;
      }

      &.unset-color::after {
        content: "";
        width: 2px;
        height: 100%;
        background: red;
        position: absolute;
        transform: rotate(30deg) scaleY(1.2);
      }
    }

    input[type="color"] {
      display: inline-flex;
      vertical-align: bottom;
      border: none;
      border-radius: var(--radius);
      padding: 0;
      min-width: 17px;
      max-height: 17px;
      aspect-ratio: 1;
      background: transparent;
      width: auto;
      border-radius: 100%;

      &::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      &::-webkit-color-swatch {
        border: 0;
        border-radius: var(--radius);
      }

      &::-moz-color-swatch {
        border: 0;
        border-radius: var(--radius);
      }
    }

    .fl-color-picker-btn {
      cursor: pointer;
      position: relative;
      background: conic-gradient(in hsl longer hue, red 0 100%);

      & input {
        opacity: 0;
      }
    }
  }

  .insert-block-options {
    display: flex;
    flex-direction: column;
    gap: 5px;

    button {
      text-align: left;
      padding: 6px 10px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: #ffffffd4;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: #a1a0a026;
      }
    }

    .insert-block-options-group-grid {
      display: grid;
      gap: 6px;
      grid-template-columns: repeat(3, 1fr);
    }
  }

  :global(.fl-rich-text .dropdown-panel) {
    padding: 9px;
    background: #2626268c;
    border: 1px solid #ffffff12;
    backdrop-filter: blur(42px);
    border-radius: 14px;
    min-width: auto;
  }

  :global(#dropdown-color-text) {
    overflow: unset;

    /* &::after {
      content: "";
      width: 16px;
      position: absolute;
      height: 16px;
      background: #1e1e1e;
      left: calc(50% - 8px);
      z-index: 999999999;
      border-radius: 0 0 5px;
      transform: rotate(45deg);
      border-right: 1px solid;
      border-bottom: 1px solid;
      border-color: #fbfbfb17;
      margin-top: 1px;
    } */
  }
</style>
