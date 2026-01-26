<script lang="ts">
  import {
    Mathematics,
    migrateMathStrings,
  } from "@tiptap/extension-mathematics";

  import { HEADINGS, rgbToHex } from "./utils";
  import "./styles.css";
  import "katex/dist/katex.min.css";

  import { onMount, onDestroy } from "svelte";
  import type { Readable } from "svelte/store";

  import {
    createEditor,
    Editor,
    EditorContent,
    BubbleMenu,
  } from "svelte-tiptap";

  import { computePosition, offset, autoUpdate } from "@floating-ui/dom";
  import { getRichTextExtensions } from "./getExtensions";
  import { CellSelection } from "prosemirror-tables";

  export interface Props {
    id?: string;
    className?: string;
    editable?: boolean;
    content?: string | {type: string, content: any[]} | null;
    customExtensions?: any[];
    editorEvents?: {
      onTransaction?: (params: any) => void;
      onBeforeCreate?: (params: any) => void;
      onCreate?: (params: any) => void;
      onUpdate: (params: any) => void;
      onFocus?: (params: any) => void;
      onBlur?: (params: any) => void;
      onDestroy?: (params: any) => void;
      onDrop?: (params: any) => void;
      onDelete?: (params: any) => void;
      onContentError?: (params: any) => void;
      onSelectionUpdate?: (params: any) => void;
      onPaste?: (params: any) => void;
    };
    config?: {
      editorAccentColor?: string;
      editorBgColor?: string;
      editorRadius?: string;
      toolbarStickyPosition?: number;
      toolbarZIndex?: number;
      toolbarBgColor?: string;
      toolbarTextColor?: string;
      toolbarPadding?: string;
      toolbarGap?: string;
      docMaxWidth?: string;
      docPadding?: string;
      docBg?: string;
      docMarginInline?: string;
      docMarginBlock?: string;
      docRadius?: string;
      docTextColor?: string;
      buttonStyle?: "accent-soft" | "accent-solid";
    };
  }

  export type RichTextProps = Props;

  let {
    id = "fl-rich-text-editor",
    className,
    editable,
    content,
    customExtensions = [],
    editorEvents = {
      onTransaction: () => {},
      onBeforeCreate: () => {},
      onCreate: () => {},
      onUpdate: () => {},
      onFocus: () => {},
      onBlur: () => {},
      onDestroy: () => {},
      onDrop: () => {},
      onDelete: () => {},
      onContentError: () => {},
      onSelectionUpdate: () => {},
      onPaste: () => {},
    },
    config,
  }: Props = $props();

  let editor = $state() as Readable<Editor>;
  const defaultEditorConfig = {
    editorAccentColor: "var(--purple)",
    editorBgColor: "transparent",
    editorRadius: "12px",
    toolbarStickyPosition: 0,
    toolbarBgColor: "#242424",
    toolbarTextColor: "currentColor",
    toolbarZIndex: 10,
    toolbarPadding: "8px",
    toolbarGap: "5px",
    docMaxWidth: "1032px",
    docPadding: "2rem",
    docBg: "transparent",
    docMarginInline: "auto",
    docMarginBlock: "2rem",
    docRadius: "0",
    docTextColor: "currentColor",
    buttonStyle: "accent-solid",
  };

  let editorConfig = $state({
    ...defaultEditorConfig,
    ...(config ?? {}),
  });

  let bubbleOffset =
    $editor?.storage.tableCell.customTableSelection === "column" ? 18 : 8;
  let imageUrlInputEl: HTMLInputElement = $state(null) as HTMLInputElement;
  let imageUrlInputValue: string = $state(null);

  const extensions = getRichTextExtensions({
    editable: true,
    customExtensions: [
      Mathematics.configure({
        inlineOptions: {
          onClick: (node, pos) => {
            // you can do anything on click, e.g. open a dialog to edit the math node
            // or just a prompt to edit the LaTeX code for a quick prototype
            const katex = prompt(
              "Update math LaTeX expression:",
              node.attrs.latex
            );
            if (katex) {
              $editor
                .chain()
                .setNodeSelection(pos)
                .updateInlineMath({ latex: katex })
                .focus()
                .run();
            }
          },
        },
        blockOptions: {
          // optional options for the block math node
        },
        katexOptions: {
          displayMode: false,
          throwOnError: false,
          macros: {
            "\\RR": "\\mathbb{R}",
            "\\ZZ": "\\mathbb{Z}",
          },
        },
      }),
      ...customExtensions,
    ],
  });

  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltip: HTMLDivElement = null as HTMLDivElement;
  let cleanup: () => void;
  let currentTriggerEl: HTMLElement | null = null;

  let textColorDropdownTriggerEl: HTMLElement | null = $state(
    null
  ) as HTMLElement;

  let activeDropdownType = $state(null);
  let enterPressed = $state(false);
  let fontSize = $state(16) as number;
  let lineHeight = $state(null) as number;

  const TEXT_COLOR_PALETTE = [
    editorConfig.editorAccentColor,
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
    editorConfig.editorAccentColor,
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
    if (tooltip.contains(target) || currentTriggerEl?.contains(target)) {
      return; // no cerrar
    }

    hideDropdown();
  }

  function updatePosition(el: HTMLElement) {
    computePosition(el, tooltip, {
      placement: "bottom",
      middleware: [offset(4)],
    }).then(({ x, y }) => {
      tooltipX = x;
      tooltipY = y;
    });
  }

  // función para saber si hay una selección de celdas
  const isCellSelection = () =>
    $editor && $editor.state.selection instanceof CellSelection;

  onMount(() => {
    editor = createEditor({
      extensions,
      content,
      editorProps: {
        attributes: {
          class: "fl-rich-text-doc",
        },
        handleKeyDown: (view, event) => {
          if (event.key === "Enter" && !event.ctrlKey) {
            enterPressed = true;

            setTimeout(() => {
              enterPressed = false;
              const { from } = view.state.selection;

              // Obtener el nodo de ProseMirror en la posición actual
              const pos = view.state.doc.resolve(from);
              const nodeBefore = pos.node(pos.depth);
              const parentNode = pos.node(pos.depth - 1);

              // console.log("Node type:", nodeBefore.type.name);
              // console.log("Parent node type:", parentNode?.type.name);

              // Solo ejecutar si estamos en un párrafo Y el padre no es una lista
              const isInList =
                parentNode?.type.name === "listItem" ||
                parentNode?.type.name === "bulletList" ||
                parentNode?.type.name === "orderedList";

              if (nodeBefore.type.name === "paragraph" && !isInList) {
                const domAtPos = view.domAtPos(from);
                let element = domAtPos.node;

                if (element.nodeType === Node.TEXT_NODE) {
                  element = element.parentElement;
                }

                if (element instanceof HTMLElement) {
                  const computedSize =
                    window.getComputedStyle(element).fontSize;
                  const computedLineHeight =
                    window.getComputedStyle(element).lineHeight;
                  // console.log({ computedSize, computedLineHeight });

                  const lineHeightPx = parseFloat(
                    computedLineHeight.replace("px", "")
                  );
                  const fontSizePx = parseFloat(computedSize.replace("px", ""));

                  const lineHeightUnitless = lineHeightPx / fontSizePx;

                  // console.log(lineHeightUnitless.toFixed(2)); // ej: "x.xx"

                  fontSize = Math.round(Number(computedSize.replace("px", "")));
                  $editor.chain().focus().unsetFontSize().run();

                  $editor.chain().focus().unsetNodeLineHeight().run();
                }
              }
            }, 200);
          }
        },
      },
      onTransaction: ({ editor, transaction }) => {
        editorEvents.onTransaction({ editor, transaction });
        editor = editor;

        if (enterPressed) {
          // console.log("Enter pressed");
          return;
        }

        const { from } = editor.state.selection;

        // Obtener el elemento DOM
        const domAtPos = editor.view.domAtPos(from);
        let element = domAtPos.node;

        // Si es un text node, obtener su padre
        if (element.nodeType === Node.TEXT_NODE) {
          element = element.parentElement;
        }

        // Obtener el font-size computado
        if (element instanceof HTMLElement) {
          const computedSize = window.getComputedStyle(element).fontSize;
          const computedLineHeight =
            window.getComputedStyle(element).lineHeight;
          // console.log("Get element font size:", computedSize);
          // console.log("Get element line height:", computedLineHeight);
          const lineHeightPx = parseFloat(computedLineHeight.replace("px", ""));
          const fontSizePx = parseFloat(computedSize.replace("px", ""));
          const lineHeightUnitless = lineHeightPx / fontSizePx;

          // console.log(lineHeightUnitless.toFixed(2)); // ej: "x.xx"

          // O desde Tiptap
          const tiptapSize = editor.getAttributes("textStyle").fontSize;
          const tiptapLineHeight = editor.getAttributes("textStyle").lineHeight;
          // console.log("Tiptap font size:", tiptapSize ? tiptapSize : "default");
          // console.log("Tiptap line height:", tiptapLineHeight ? tiptapLineHeight : "default");

          if (tiptapSize) {
            fontSize = Number(tiptapSize.replace("px", ""));
          } else {
            fontSize = Math.round(Number(computedSize.replace("px", "")));
          }

          if (tiptapLineHeight) {
            lineHeight = Number(tiptapLineHeight.replace("px", ""));
          } else {
            lineHeight = Number(lineHeightUnitless.toFixed(2));
          }
        }
      },

      onBeforeCreate({ editor }) {
        editorEvents.onBeforeCreate({ editor });
      },

      onCreate: ({ editor }) => {
        editorEvents.onCreate({ editor });
        migrateMathStrings(editor);
      },

      onUpdate: ({ editor }) => {
        editorEvents.onUpdate({
          editor,
          html: editor.getHTML(),
          json: editor.getJSON(),
        });
      },

      onPaste: (event, slice) => {
        editorEvents.onPaste({ event, slice });
      },

      onSelectionUpdate({ editor }) {
        editorEvents.onSelectionUpdate({ editor });
      },

      onFocus({ editor, event }) {
        editorEvents.onFocus({ editor, event });
      },
      onBlur({ editor, event }) {
        editorEvents.onBlur({ editor, event });
      },
      onDestroy() {
        editorEvents.onDestroy({ editor, message: "onDestroy" });
      },
      onDrop(event: any, slice: any, moved: boolean) {
        editorEvents.onDrop({ editor, event, slice, moved });
      },
      onDelete({ type, deletedRange, newRange, partial, from, to }) {
        editorEvents.onDelete({
          editor,
          type,
          deletedRange,
          newRange,
          partial,
          from,
          to,
        });
      },
      onContentError({ editor, error, disableCollaboration }) {
        editorEvents.onContentError({ editor, error, disableCollaboration });
      },
    });
  });

  onDestroy(() => {
    if (editor) {
      $editor.destroy();
    }
  });

  function setLink() {
    const previousUrl = $editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      $editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

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
          });
        });
      }, 100);
    } catch (e) {
      console.log(e.message);
    }
  }

  function toggleSpecialBox() {
    if ($editor) {
      $editor.chain().focus().specialBox().run();
    }
  }

  function addInlineMath() {
    const hasSelection = !$editor.state.selection.empty;

    if (hasSelection) {
      const latex = prompt("Enter inline math LaTeX expression:", "");
      if (latex) {
        return $editor
          .chain()
          .deleteSelection()
          .insertInlineMath({ latex })
          .focus()
          .run();
      }
      return;
    }

    const latex = prompt("Enter inline math LaTeX expression:", "");
    if (latex) {
      return $editor.chain().insertInlineMath({ latex }).focus().run();
    }
  }

  function decrementFontSize() {
    fontSize = fontSize - 1;
    $editor
      .chain()
      .focus()
      .setFontSize(fontSize + "px")
      .run();
  }

  function incrementFontSize() {
    fontSize = fontSize + 1;
    $editor
      .chain()
      .focus()
      .setFontSize(fontSize + "px")
      .run();
  }

  function handleRangeInput(e: any) {
    $editor.commands.setNodeLineHeight(lineHeight.toString());
  }

  function addAudio() {
    const previousSrc = $editor.getAttributes("audio").src;
    const src = window.prompt("Enter the URL of the audio:", previousSrc);
    if (!src) {
      alert("Please enter a valid URL");
      return;
    }

    $editor.chain().focus().setAudio({ src, controls: true }).run();
  }

  function addImage() {
    const previousSrc = $editor.getAttributes("image").src;
    const src = window.prompt("Enter the URL of the image:", previousSrc);

    if (!src) {
      alert("Please enter a valid URL");
      return;
    }

    $editor.chain().focus().setImage({ src }).run();
  }

  function addMediaGrid() {
    $editor.chain().focus().insertGrid({ cols: 2 }).run();
  }

  function addTable() {
    $editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }
</script>

<div
  class="fl-rich-text {className}"
  class:editable
  style="
  --fl-editor-accent-color: {editorConfig.editorAccentColor};
  --fl-editor-radius: {editorConfig.editorRadius};
  --fl-editor-bg: {editorConfig.editorBgColor};
  --fl-toolbar-sticky-position: {editorConfig.toolbarStickyPosition}px;
  --fl-toolbar-z-index: {editorConfig.toolbarZIndex};
  --fl-toolbar-padding: {editorConfig.toolbarPadding};
  --fl-toolbar-gap: {editorConfig.toolbarGap};
  --fl-toolbar-bg: {editorConfig.toolbarBgColor};
  --fl-toolbar-text-color: {editorConfig.toolbarTextColor};
  --fl-doc-max-width: {editorConfig.docMaxWidth};
  --fl-doc-padding: {editorConfig.docPadding};
  --fl-doc-bg: {editorConfig.docBg};
  --fl-doc-margin-inline: {editorConfig.docMarginInline};
  --fl-doc-margin-block: {editorConfig.docMarginBlock};
  --fl-doc-radius: {editorConfig.docRadius};
  --fl-doc-text-color: {editorConfig.docTextColor};
"
>
  {#if editor}
    <header class="fl-rich-text-toolbar">
      <div class="fl-rich-text-toolbar-container container">
        <!-- Undo/Redo -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <button
            type="button"
            onclick={() => $editor.chain().focus().undo().run()}
            disabled={!$editor.can().chain().focus().undo().run()}
            aria-label="Undo"
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
                d="M9.70711 3.70711C10.0976 3.31658 10.0976 2.68342 9.70711 2.29289C9.31658 1.90237 8.68342 1.90237 8.29289 2.29289L3.29289 7.29289C2.90237 7.68342 2.90237 8.31658 3.29289 8.70711L8.29289 13.7071C8.68342 14.0976 9.31658 14.0976 9.70711 13.7071C10.0976 13.3166 10.0976 12.6834 9.70711 12.2929L6.41421 9H14.5C15.0909 9 15.6761 9.1164 16.2221 9.34254C16.768 9.56869 17.2641 9.90016 17.682 10.318C18.0998 10.7359 18.4313 11.232 18.6575 11.7779C18.8836 12.3239 19 12.9091 19 13.5C19 14.0909 18.8836 14.6761 18.6575 15.2221C18.4313 15.768 18.0998 16.2641 17.682 16.682C17.2641 17.0998 16.768 17.4313 16.2221 17.6575C15.6761 17.8836 15.0909 18 14.5 18H11C10.4477 18 10 18.4477 10 19C10 19.5523 10.4477 20 11 20H14.5C15.3536 20 16.1988 19.8319 16.9874 19.5052C17.7761 19.1786 18.4926 18.6998 19.0962 18.0962C19.6998 17.4926 20.1786 16.7761 20.5052 15.9874C20.8319 15.1988 21 14.3536 21 13.5C21 12.6464 20.8319 11.8012 20.5052 11.0126C20.1786 10.2239 19.6998 9.50739 19.0962 8.90381C18.4926 8.30022 17.7761 7.82144 16.9874 7.49478C16.1988 7.16813 15.3536 7 14.5 7H6.41421L9.70711 3.70711Z"
                fill="currentColor"
              ></path></svg
            >
          </button>

          <button
            type="button"
            onclick={() => $editor.chain().focus().redo().run()}
            disabled={!$editor.can().chain().focus().redo().run()}
            aria-label="Redo"
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
                d="M15.7071 2.29289C15.3166 1.90237 14.6834 1.90237 14.2929 2.29289C13.9024 2.68342 13.9024 3.31658 14.2929 3.70711L17.5858 7H9.5C7.77609 7 6.12279 7.68482 4.90381 8.90381C3.68482 10.1228 3 11.7761 3 13.5C3 14.3536 3.16813 15.1988 3.49478 15.9874C3.82144 16.7761 4.30023 17.4926 4.90381 18.0962C6.12279 19.3152 7.77609 20 9.5 20H13C13.5523 20 14 19.5523 14 19C14 18.4477 13.5523 18 13 18H9.5C8.30653 18 7.16193 17.5259 6.31802 16.682C5.90016 16.2641 5.56869 15.768 5.34254 15.2221C5.1164 14.6761 5 14.0909 5 13.5C5 12.3065 5.47411 11.1619 6.31802 10.318C7.16193 9.47411 8.30653 9 9.5 9H17.5858L14.2929 12.2929C13.9024 12.6834 13.9024 13.3166 14.2929 13.7071C14.6834 14.0976 15.3166 14.0976 15.7071 13.7071L20.7071 8.70711C21.0976 8.31658 21.0976 7.68342 20.7071 7.29289L15.7071 2.29289Z"
                fill="currentColor"
              ></path></svg
            >
          </button>
        </div>

        <!-- Heading & list dropdowns -->
        <div class="fl-rich-text-toolbar-group">
          <!-- Heading  -->
          <button
            type="button"
            onclick={(e) => toogleDropdown(e.currentTarget, "headings-dropdown")}
            class:is-active={$editor.isActive("heading") ||
              $editor.isActive("h1")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
            aria-label="Heading"
          >
            {#if $editor.isActive("heading")}
              {#each HEADINGS as heading}
                {#if $editor.isActive( "heading", { level: Number(heading.level) } )}
                  {@html heading.icon}
                {/if}
              {/each}
            {:else if $editor.isActive("h1")}
              {@html HEADINGS[0].icon}
            {/if}

            {#if !$editor.isActive("heading") && !$editor.isActive("h1")}
              <svg
                width="24"
                height="24"
                class="tiptap-button-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M6 3C6.55228 3 7 3.44772 7 4V11H17V4C17 3.44772 17.4477 3 18 3C18.5523 3 19 3.44772 19 4V20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20V13H7V20C7 20.5523 6.55228 21 6 21C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3Z"
                  fill="currentColor"
                ></path></svg
              >
            {/if}

            <svg
              class="toogle-dropdown-button-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 12"
            >
              <defs>
                <symbol id="dropdown-arrow" viewBox="0 0 10 6" fill="none">
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 4 4 4-4"
                  ></path>
                </symbol>
              </defs>
              <use href="#dropdown-arrow"></use>
            </svg>
          </button>

          <!-- List -->
          <button
            aria-label="List"
            type="button"
            onclick={(e) => toogleDropdown(e.currentTarget, "list-dropdown")}
            class:is-active={$editor.isActive("bulletList") ||
              $editor.isActive("orderedList") ||
              $editor.isActive("taskList")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
          >
            {#if $editor.isActive("bulletList")}
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
                  d="M7 6C7 5.44772 7.44772 5 8 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H8C7.44772 7 7 6.55228 7 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7 12C7 11.4477 7.44772 11 8 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H8C7.44772 13 7 12.5523 7 12Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7 18C7 17.4477 7.44772 17 8 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H8C7.44772 19 7 18.5523 7 18Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 6C2 5.44772 2.44772 5 3 5H3.01C3.56228 5 4.01 5.44772 4.01 6C4.01 6.55228 3.56228 7 3.01 7H3C2.44772 7 2 6.55228 2 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 12C2 11.4477 2.44772 11 3 11H3.01C3.56228 11 4.01 11.4477 4.01 12C4.01 12.5523 3.56228 13 3.01 13H3C2.44772 13 2 12.5523 2 12Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 18C2 17.4477 2.44772 17 3 17H3.01C3.56228 17 4.01 17.4477 4.01 18C4.01 18.5523 3.56228 19 3.01 19H3C2.44772 19 2 18.5523 2 18Z"
                  fill="currentColor"
                ></path></svg
              >
            {:else if $editor.isActive("orderedList")}
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
                  d="M9 6C9 5.44772 9.44772 5 10 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H10C9.44772 7 9 6.55228 9 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9 12C9 11.4477 9.44772 11 10 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H10C9.44772 13 9 12.5523 9 12Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9 18C9 17.4477 9.44772 17 10 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H10C9.44772 19 9 18.5523 9 18Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3 6C3 5.44772 3.44772 5 4 5H5C5.55228 5 6 5.44772 6 6V10C6 10.5523 5.55228 11 5 11C4.44772 11 4 10.5523 4 10V7C3.44772 7 3 6.55228 3 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3 10C3 9.44772 3.44772 9 4 9H6C6.55228 9 7 9.44772 7 10C7 10.5523 6.55228 11 6 11H4C3.44772 11 3 10.5523 3 10Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.82219 13.0431C6.54543 13.4047 6.99997 14.1319 6.99997 15C6.99997 15.5763 6.71806 16.0426 6.48747 16.35C6.31395 16.5814 6.1052 16.8044 5.91309 17H5.99997C6.55226 17 6.99997 17.4477 6.99997 18C6.99997 18.5523 6.55226 19 5.99997 19H3.99997C3.44769 19 2.99997 18.5523 2.99997 18C2.99997 17.4237 3.28189 16.9575 3.51247 16.65C3.74323 16.3424 4.03626 16.0494 4.26965 15.8161C4.27745 15.8083 4.2852 15.8006 4.29287 15.7929C4.55594 15.5298 4.75095 15.3321 4.88748 15.15C4.96287 15.0495 4.99021 14.9922 4.99911 14.9714C4.99535 14.9112 4.9803 14.882 4.9739 14.8715C4.96613 14.8588 4.95382 14.845 4.92776 14.8319C4.87723 14.8067 4.71156 14.7623 4.44719 14.8944C3.95321 15.1414 3.35254 14.9412 3.10555 14.4472C2.85856 13.9533 3.05878 13.3526 3.55276 13.1056C4.28839 12.7378 5.12272 12.6934 5.82219 13.0431Z"
                  fill="currentColor"
                ></path></svg
              >
            {:else if $editor.isActive("taskList")}
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
                  d="M2 6C2 4.89543 2.89543 4 4 4H8C9.10457 4 10 4.89543 10 6V10C10 11.1046 9.10457 12 8 12H4C2.89543 12 2 11.1046 2 10V6ZM8 6H4V10H8V6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M9.70711 14.2929C10.0976 14.6834 10.0976 15.3166 9.70711 15.7071L5.70711 19.7071C5.31658 20.0976 4.68342 20.0976 4.29289 19.7071L2.29289 17.7071C1.90237 17.3166 1.90237 16.6834 2.29289 16.2929C2.68342 15.9024 3.31658 15.9024 3.70711 16.2929L5 17.5858L8.29289 14.2929C8.68342 13.9024 9.31658 13.9024 9.70711 14.2929Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 6C12 5.44772 12.4477 5 13 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H13C12.4477 7 12 6.55228 12 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 12C12 11.4477 12.4477 11 13 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13C12.4477 13 12 12.5523 12 12Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 18C12 17.4477 12.4477 17 13 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H13C12.4477 19 12 18.5523 12 18Z"
                  fill="currentColor"
                ></path></svg
              >
            {:else}
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
                  d="M7 6C7 5.44772 7.44772 5 8 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H8C7.44772 7 7 6.55228 7 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7 12C7 11.4477 7.44772 11 8 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H8C7.44772 13 7 12.5523 7 12Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7 18C7 17.4477 7.44772 17 8 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H8C7.44772 19 7 18.5523 7 18Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 6C2 5.44772 2.44772 5 3 5H3.01C3.56228 5 4.01 5.44772 4.01 6C4.01 6.55228 3.56228 7 3.01 7H3C2.44772 7 2 6.55228 2 6Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 12C2 11.4477 2.44772 11 3 11H3.01C3.56228 11 4.01 11.4477 4.01 12C4.01 12.5523 3.56228 13 3.01 13H3C2.44772 13 2 12.5523 2 12Z"
                  fill="currentColor"
                ></path><path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 18C2 17.4477 2.44772 17 3 17H3.01C3.56228 17 4.01 17.4477 4.01 18C4.01 18.5523 3.56228 19 3.01 19H3C2.44772 19 2 18.5523 2 18Z"
                  fill="currentColor"
                ></path></svg
              >
            {/if}

            <svg
              class="toogle-dropdown-button-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <use href="#dropdown-arrow"></use>
            </svg>
          </button>
        </div>

        <!-- Code block & blockquote -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <!-- Code block -->
          <button
            aria-label="Code block"
            type="button"
            onclick={() => $editor.chain().focus().toggleCodeBlock().run()}
            class={$editor.isActive("codeBlock") ? "is-active" : ""}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
                d="M6.70711 2.29289C7.09763 2.68342 7.09763 3.31658 6.70711 3.70711L4.41421 6L6.70711 8.29289C7.09763 8.68342 7.09763 9.31658 6.70711 9.70711C6.31658 10.0976 5.68342 10.0976 5.29289 9.70711L2.29289 6.70711C1.90237 6.31658 1.90237 5.68342 2.29289 5.29289L5.29289 2.29289C5.68342 1.90237 6.31658 1.90237 6.70711 2.29289Z"
                fill="currentColor"
              ></path><path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.2929 2.29289C10.6834 1.90237 11.3166 1.90237 11.7071 2.29289L14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L11.7071 9.70711C11.3166 10.0976 10.6834 10.0976 10.2929 9.70711C9.90237 9.31658 9.90237 8.68342 10.2929 8.29289L12.5858 6L10.2929 3.70711C9.90237 3.31658 9.90237 2.68342 10.2929 2.29289Z"
                fill="currentColor"
              ></path><path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17 4C17 3.44772 17.4477 3 18 3H19C20.6569 3 22 4.34315 22 6V18C22 19.6569 20.6569 21 19 21H5C3.34315 21 2 19.6569 2 18V12C2 11.4477 2.44772 11 3 11C3.55228 11 4 11.4477 4 12V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V6C20 5.44772 19.5523 5 19 5H18C17.4477 5 17 4.55228 17 4Z"
                fill="currentColor"
              ></path></svg
            >
          </button>

          <!-- Blockquote -->
          <button
            aria-label="Blockquote"
            type="button"
            onclick={() => $editor.chain().focus().toggleBlockquote().run()}
            class={$editor.isActive("blockquote") ? "is-active" : ""}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M9.42503 3.44136C10.0561 3.23654 10.7837 3.2402 11.3792 3.54623C12.7532 4.25224 13.3477 6.07191 12.7946 8C12.5465 8.8649 12.1102 9.70472 11.1861 10.5524C10.262 11.4 8.98034 11.9 8.38571 11.9C8.17269 11.9 8 11.7321 8 11.525C8 11.3179 8.17644 11.15 8.38571 11.15C9.06497 11.15 9.67189 10.7804 10.3906 10.236C10.9406 9.8193 11.3701 9.28633 11.608 8.82191C12.0628 7.93367 12.0782 6.68174 11.3433 6.34901C10.9904 6.73455 10.5295 6.95946 9.97725 6.95946C8.7773 6.95946 8.0701 5.99412 8.10051 5.12009C8.12957 4.28474 8.66032 3.68954 9.42503 3.44136ZM3.42503 3.44136C4.05614 3.23654 4.78366 3.2402 5.37923 3.54623C6.7532 4.25224 7.34766 6.07191 6.79462 8C6.54654 8.8649 6.11019 9.70472 5.1861 10.5524C4.26201 11.4 2.98034 11.9 2.38571 11.9C2.17269 11.9 2 11.7321 2 11.525C2 11.3179 2.17644 11.15 2.38571 11.15C3.06497 11.15 3.67189 10.7804 4.39058 10.236C4.94065 9.8193 5.37014 9.28633 5.60797 8.82191C6.06282 7.93367 6.07821 6.68174 5.3433 6.34901C4.99037 6.73455 4.52948 6.95946 3.97725 6.95946C2.7773 6.95946 2.0701 5.99412 2.10051 5.12009C2.12957 4.28474 2.66032 3.68954 3.42503 3.44136Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path></svg
            >
          </button>
        </div>

        <!-- Font size editor -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <div class="fl-font-size-editor">
            <button
              type="button"
              aria-label="Decrease font size"
              onclick={decrementFontSize}
              class="fl-font-size-editor-button"
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
                class="icon icon-tabler icons-tabler-outline icon-tabler-minus"
                ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                  d="M5 12l14 0"
                /></svg
              >
            </button>
            <input type="text" bind:value={fontSize} />
            <button
              type="button"
              aria-label="Increase font size"
              onclick={incrementFontSize}
              class="fl-font-size-editor-button"
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
                class="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                  d="M12 5l0 14"
                /><path d="M5 12l14 0" /></svg
              >
            </button>
          </div>
        </div>

        <!-- Line height -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <button
            class="fl-font-size-button"
            aria-label="Line height"
            type="button"
            onclick={(e) =>
              toogleDropdown(e.currentTarget, "line-height-dropdown")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-line-height"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M3 8l3 -3l3 3"
              /><path d="M3 16l3 3l3 -3" /><path d="M6 5l0 14" /><path
                d="M13 6l7 0"
              /><path d="M13 12l7 0" /><path d="M13 18l7 0" /></svg
            >

            <svg
              class="toogle-dropdown-button-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <use href="#dropdown-arrow"></use>
            </svg>
          </button>
        </div>

        <!-- Bold, Italic, Underline, Strike, Code, Link -->
        <!-- <div role="group" class="fl-rich-text-toolbar-group">
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleBold().run()}
            disabled={!$editor.can().chain().focus().toggleBold().run()}
            class={$editor.isActive("bold") ? "is-active" : ""}
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
            class={$editor.isActive("italic") ? "is-active" : ""}
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
            disabled={!$editor.can().chain().focus().toggleUnderline().run()}
            class={$editor.isActive("underline") ? "is-active" : ""}
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
            class={$editor.isActive("strike") ? "is-active" : ""}
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
            class={$editor.isActive("code") ? "is-active" : ""}
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
        </div> -->

        <!-- Special box, horizontal rule, Hard break -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <!-- Special box -->
          <button
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor?.isActive("specialBox")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
            onclick={toggleSpecialBox}
            type="button"
            aria-label="Special Box"
          >
            <span class="special-box-icon">A</span>
          </button>

          <!-- Horizontal rule -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().setHorizontalRule().run()}
            aria-label="Horizontal rule"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path></svg
            >
          </button>

          <!-- Hard break -->
          <button
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
        </div>

        <!-- Text color & highlight -->
        <!-- <div role="group" class="fl-rich-text-toolbar-group">
          <button
            aria-label="Toggle text color dropdown"
            type="button"
            onclick={(e) =>
              toogleDropdown(e.currentTarget, "text-color-dropdown")}
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
              viewBox="0 0 20 12"
            >
              <use href="#dropdown-arrow"></use>
            </svg>
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
        </div> -->

        <!-- Inline math -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <button
            type="button"
            onclick={addInlineMath}
            aria-label="Add inline LaTeX math"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-math"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M19 5h-7l-4 14l-3 -6h-2"
              /><path d="M14 13l6 6" /><path d="M14 19l6 -6" /></svg
            >
          </button>
        </div>

        <!-- Audio & image -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <!-- Image -->
          <button
            type="button"
            onclick={addImage}
            aria-label="Image"
            class:is-active={$editor.isActive("image")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-photo"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M8.813 11.612c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.986 4.986l.094 .083a1 1 0 0 0 1.403 -1.403l-.083 -.094l-1.292 -1.293l.292 -.293l.106 -.095c.457 -.38 .918 -.38 1.386 .011l.108 .098l4.674 4.675a4 4 0 0 1 -3.775 3.599l-.206 .005h-12a4 4 0 0 1 -3.98 -3.603l6.687 -6.69l.106 -.095zm9.187 -9.612a4 4 0 0 1 3.995 3.8l.005 .2v9.585l-3.293 -3.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-.307 .306l-2.293 -2.292l-.15 -.137c-1.256 -1.095 -2.85 -1.097 -4.096 -.017l-.154 .14l-5.307 5.306v-9.585a4 4 0 0 1 3.8 -3.995l.2 -.005h12zm-2.99 5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z"
              /></svg
            >
          </button>
          <!-- Audio -->
          <button
            type="button"
            onclick={addAudio}
            aria-label="Audio"
            class:is-active={$editor.isActive("audio")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
          >
            <svg
              style="transform: scale(1.1);"
              fill="currentColor"
              width="24px"
              viewBox="0 -960 960 960"
              height="24px"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"
              ></path></svg
            >
          </button>
        </div>

        <!-- Media Grid & Table -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <!-- Grid -->
          <button
            type="button"
            onclick={addMediaGrid}
            aria-label="Media grid"
            class:is-active={$editor.isActive("MediaGridComponent")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="icon icon-tabler icons-tabler-filled icon-tabler-layout-grid"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M9 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
              /><path
                d="M19 3a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
              /><path
                d="M9 13a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
              /><path
                d="M19 13a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2z"
              /></svg
            >
          </button>
          <!-- Table -->
          <button
            type="button"
            onclick={addTable}
            aria-label="Table"
            class:is-active={$editor.isActive("table")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
              class="icon icon-tabler icons-tabler-outline icon-tabler-table"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14"
              /><path d="M3 10h18" /><path d="M10 3v18" /></svg
            >
          </button>
        </div>

        <!-- Text align, clear formatting, clear nodes -->
        <div role="group" class="fl-rich-text-toolbar-group">
          <!-- Text align left -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleTextAlign("left").run()}
            class:is-active={$editor.isActive({ textAlign: "left" })}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
            aria-label="Align left"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M2 4.5C2 4.22386 2.22386 4 2.5 4H12.5C12.7761 4 13 4.22386 13 4.5C13 4.77614 12.7761 5 12.5 5H2.5C2.22386 5 2 4.77614 2 4.5ZM2 7.5C2 7.22386 2.22386 7 2.5 7H7.5C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8H2.5C2.22386 8 2 7.77614 2 7.5ZM2 10.5C2 10.2239 2.22386 10 2.5 10H10.5C10.7761 10 11 10.2239 11 10.5C11 10.7761 10.7761 11 10.5 11H2.5C2.22386 11 2 10.7761 2 10.5Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path></svg
            >
          </button>

          <!-- Text align center -->
          <button
            type="button"
            onclick={() =>
              $editor.chain().focus().toggleTextAlign("center").run()}
            class:is-active={$editor.isActive({ textAlign: "center" })}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
            aria-label="Align center"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M2 4.5C2 4.22386 2.22386 4 2.5 4H12.5C12.7761 4 13 4.22386 13 4.5C13 4.77614 12.7761 5 12.5 5H2.5C2.22386 5 2 4.77614 2 4.5ZM4 7.5C4 7.22386 4.22386 7 4.5 7H10.5C10.7761 7 11 7.22386 11 7.5C11 7.77614 10.7761 8 10.5 8H4.5C4.22386 8 4 7.77614 4 7.5ZM3 10.5C3 10.2239 3.22386 10 3.5 10H11.5C11.7761 10 12 10.2239 12 10.5C12 10.7761 11.7761 11 11.5 11H3.5C3.22386 11 3 10.7761 3 10.5Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path></svg
            >
          </button>

          <!-- Text align right -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleTextAlign("right").run()}
            class:is-active={$editor.isActive({ textAlign: "right" })}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
            aria-label="Align right"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M2 4.5C2 4.22386 2.22386 4 2.5 4H12.5C12.7761 4 13 4.22386 13 4.5C13 4.77614 12.7761 5 12.5 5H2.5C2.22386 5 2 4.77614 2 4.5ZM7 7.5C7 7.22386 7.22386 7 7.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H7.5C7.22386 8 7 7.77614 7 7.5ZM4 10.5C4 10.2239 4.22386 10 4.5 10H12.5C12.7761 10 13 10.2239 13 10.5C13 10.7761 12.7761 11 12.5 11H4.5C4.22386 11 4 10.7761 4 10.5Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path></svg
            >
          </button>

          <!-- Clear formatting -->
          <button
            aria-label="Clear formatting"
            type="button"
            onclick={() => $editor.chain().focus().unsetAllMarks().run()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-clear-formatting"
              ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
                d="M17 15l4 4m0 -4l-4 4"
              /><path d="M7 6v-1h11v1" /><path d="M7 19l4 0" /><path
                d="M13 5l-4 14"
              /></svg
            >
          </button>

          <!-- Clear nodes -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().clearNodes().run()}
          >
            Clear
          </button>
        </div>
      </div>
    </header>
  {/if}

  <EditorContent editor={$editor} class="fl-rich-text-content" />
</div>

<div
  class="fl-toolbar-dropdown-panel"
  bind:this={tooltip}
  style="display: {tooltipVisible
    ? 'flex'
    : 'none'}; 
  left: {tooltipX}px;
  top: {tooltipY}px;
  --fl-editor-accent-color: {editorConfig.editorAccentColor};
  "
>
  {#if activeDropdownType === "headings-dropdown"}
    <div role="group" class="fl-rich-text-toolbar-group">
      <button
        type="button"
        onclick={() =>
          $editor.chain().focus().toggleHeading({ level: 1 }).run()}
        class={$editor.isActive("heading", { level: 1 }) ||
        $editor.isActive("h1")
          ? "is-active"
          : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
        aria-label="H1"
        disabled={!$editor.isActive("h1")}
      >
        <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() =>
          $editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class={$editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
        aria-label="H2"
        disabled={$editor.isActive("h1")}
      >
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() =>
          $editor.chain().focus().toggleHeading({ level: 3 }).run()}
        class={$editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
        aria-label="H3"
        disabled={$editor.isActive("h1")}
      >
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() =>
          $editor.chain().focus().toggleHeading({ level: 4 }).run()}
        class={$editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
        aria-label="H4"
        disabled={$editor.isActive("h1")}
      >
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM22 8V16H23.5V18H22V20H20V18H14.5V16.66L19.5 8H22ZM20 11.133L17.19 16H20V11.133Z"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() =>
          $editor.chain().focus().toggleHeading({ level: 5 }).run()}
        class={$editor.isActive("heading", { level: 5 }) ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
        aria-label="H5"
        disabled={$editor.isActive("h1")}
      >
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M22 8V10H17.6769L17.2126 12.6358C17.5435 12.5472 17.8912 12.5 18.25 12.5C20.4591 12.5 22.25 14.2909 22.25 16.5C22.25 18.7091 20.4591 20.5 18.25 20.5C16.4233 20.5 14.8827 19.2756 14.4039 17.6027L16.3271 17.0519C16.5667 17.8881 17.3369 18.5 18.25 18.5C19.3546 18.5 20.25 17.6046 20.25 16.5C20.25 15.3954 19.3546 14.5 18.25 14.5C17.6194 14.5 17.057 14.7918 16.6904 15.2478L14.8803 14.3439L16 8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"
          ></path></svg
        >
      </button>

      <button
        type="button"
        onclick={() =>
          $editor.chain().focus().toggleHeading({ level: 6 }).run()}
        class={$editor.isActive("heading", { level: 6 }) ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
        aria-label="H6"
        disabled={$editor.isActive("h1")}
      >
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M21.097 8L18.499 12.5C20.7091 12.5 22.5 14.2909 22.5 16.5C22.5 18.7091 20.7091 20.5 18.5 20.5C16.2909 20.5 14.5 18.7091 14.5 16.5C14.5 15.7636 14.699 15.0737 15.0461 14.4811L18.788 8H21.097ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 14.5C17.3954 14.5 16.5 15.3954 16.5 16.5C16.5 17.6046 17.3954 18.5 18.5 18.5C19.6046 18.5 20.5 17.6046 20.5 16.5C20.5 15.3954 19.6046 14.5 18.5 14.5Z"
          ></path></svg
        >
      </button>
    </div>
  {:else if activeDropdownType === "list-dropdown"}
    <div role="group" class="fl-rich-text-toolbar-group">
      <button
        aria-label="Bullet list"
        type="button"
        onclick={() => $editor.chain().focus().toggleBulletList().run()}
        class={$editor.isActive("bulletList") ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
            d="M7 6C7 5.44772 7.44772 5 8 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H8C7.44772 7 7 6.55228 7 6Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 12C7 11.4477 7.44772 11 8 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H8C7.44772 13 7 12.5523 7 12Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 18C7 17.4477 7.44772 17 8 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H8C7.44772 19 7 18.5523 7 18Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2 6C2 5.44772 2.44772 5 3 5H3.01C3.56228 5 4.01 5.44772 4.01 6C4.01 6.55228 3.56228 7 3.01 7H3C2.44772 7 2 6.55228 2 6Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2 12C2 11.4477 2.44772 11 3 11H3.01C3.56228 11 4.01 11.4477 4.01 12C4.01 12.5523 3.56228 13 3.01 13H3C2.44772 13 2 12.5523 2 12Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M2 18C2 17.4477 2.44772 17 3 17H3.01C3.56228 17 4.01 17.4477 4.01 18C4.01 18.5523 3.56228 19 3.01 19H3C2.44772 19 2 18.5523 2 18Z"
            fill="currentColor"
          ></path></svg
        >
      </button>

      <button
        aria-label="Ordered list"
        type="button"
        onclick={() => $editor.chain().focus().toggleOrderedList().run()}
        class={$editor.isActive("orderedList") ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
            d="M9 6C9 5.44772 9.44772 5 10 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H10C9.44772 7 9 6.55228 9 6Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9 12C9 11.4477 9.44772 11 10 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H10C9.44772 13 9 12.5523 9 12Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9 18C9 17.4477 9.44772 17 10 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H10C9.44772 19 9 18.5523 9 18Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M3 6C3 5.44772 3.44772 5 4 5H5C5.55228 5 6 5.44772 6 6V10C6 10.5523 5.55228 11 5 11C4.44772 11 4 10.5523 4 10V7C3.44772 7 3 6.55228 3 6Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M3 10C3 9.44772 3.44772 9 4 9H6C6.55228 9 7 9.44772 7 10C7 10.5523 6.55228 11 6 11H4C3.44772 11 3 10.5523 3 10Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.82219 13.0431C6.54543 13.4047 6.99997 14.1319 6.99997 15C6.99997 15.5763 6.71806 16.0426 6.48747 16.35C6.31395 16.5814 6.1052 16.8044 5.91309 17H5.99997C6.55226 17 6.99997 17.4477 6.99997 18C6.99997 18.5523 6.55226 19 5.99997 19H3.99997C3.44769 19 2.99997 18.5523 2.99997 18C2.99997 17.4237 3.28189 16.9575 3.51247 16.65C3.74323 16.3424 4.03626 16.0494 4.26965 15.8161C4.27745 15.8083 4.2852 15.8006 4.29287 15.7929C4.55594 15.5298 4.75095 15.3321 4.88748 15.15C4.96287 15.0495 4.99021 14.9922 4.99911 14.9714C4.99535 14.9112 4.9803 14.882 4.9739 14.8715C4.96613 14.8588 4.95382 14.845 4.92776 14.8319C4.87723 14.8067 4.71156 14.7623 4.44719 14.8944C3.95321 15.1414 3.35254 14.9412 3.10555 14.4472C2.85856 13.9533 3.05878 13.3526 3.55276 13.1056C4.28839 12.7378 5.12272 12.6934 5.82219 13.0431Z"
            fill="currentColor"
          ></path></svg
        >
      </button>

      <button
        aria-label="Task list"
        type="button"
        onclick={() => $editor.chain().focus().toggleTaskList().run()}
        class={$editor.isActive("taskList") ? "is-active" : ""}
        class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
            d="M2 6C2 4.89543 2.89543 4 4 4H8C9.10457 4 10 4.89543 10 6V10C10 11.1046 9.10457 12 8 12H4C2.89543 12 2 11.1046 2 10V6ZM8 6H4V10H8V6Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M9.70711 14.2929C10.0976 14.6834 10.0976 15.3166 9.70711 15.7071L5.70711 19.7071C5.31658 20.0976 4.68342 20.0976 4.29289 19.7071L2.29289 17.7071C1.90237 17.3166 1.90237 16.6834 2.29289 16.2929C2.68342 15.9024 3.31658 15.9024 3.70711 16.2929L5 17.5858L8.29289 14.2929C8.68342 13.9024 9.31658 13.9024 9.70711 14.2929Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 6C12 5.44772 12.4477 5 13 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H13C12.4477 7 12 6.55228 12 6Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 12C12 11.4477 12.4477 11 13 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13C12.4477 13 12 12.5523 12 12Z"
            fill="currentColor"
          ></path><path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 18C12 17.4477 12.4477 17 13 17H21C21.5523 17 22 17.4477 22 18C22 18.5523 21.5523 19 21 19H13C12.4477 19 12 18.5523 12 18Z"
            fill="currentColor"
          ></path></svg
        >
      </button>
    </div>
  {:else if activeDropdownType === "text-color-dropdown"}
    <div class="fl-editor-color-palette">
      <button
        class="fl-color-swatch fl-color-picker-btn"
        aria-label="Text color picker"
        type="button"
      >
        <input
          type="color"
          onblur={(event: any) => {
            const inclued = recentCustomColors.includes(event?.target?.value);
            if (!inclued) {
              recentCustomColors = [
                ...recentCustomColors,
                event?.target?.value,
              ];
            }
            $editor.chain().focus().setColor(event?.target?.value).run();
            hideDropdown();
          }}
          onchange={(event: any) => {
            const inclued = recentCustomColors.includes(event?.target?.value);
            if (!inclued) {
              recentCustomColors = [
                ...recentCustomColors,
                event?.target?.value,
              ];
            }
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
          onblur={(event: any) => {
            const inclued = recentCustomColors.includes(event?.target?.value);
            if (!inclued) {
              recentCustomColors = [
                ...recentCustomColors,
                event?.target?.value,
              ];
            }
            $editor
              .chain()
              .focus()
              .setHighlight({ color: event?.target?.value })
              .run();
            hideDropdown();
          }}
          onchange={(event: any) => {
            const inclued = recentCustomColors.includes(event?.target?.value);
            if (!inclued) {
              recentCustomColors = [
                ...recentCustomColors,
                event?.target?.value,
              ];
            }

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
  {:else if activeDropdownType === "line-height-dropdown"}
    <div class="fl-range-element">
      <span class="fl-range-element-value">
        {lineHeight.toFixed(2)}
      </span>
      <input
        oninput={handleRangeInput}
        type="range"
        min="0.5"
        max="4"
        step="0.05"
        bind:value={lineHeight}
      />
    </div>
  {/if}
</div>

{#if editor}
  <!-- General Menu -->
  <div class="hidden">
    <BubbleMenu
      options={{ placement: "top", strategy: "fixed", offset: bubbleOffset, flip: false }}
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
      appendTo={document.body}
    >
      <div data-test-id="bubble-menu" class="fl-bubble-menu flex">
        <div role="group" class="fl-rich-text-toolbar-group">
          <!-- Bold -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleBold().run()}
            disabled={!$editor.can().chain().focus().toggleBold().run()}
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor.isActive("bold")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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

          <!-- Italic -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleItalic().run()}
            disabled={!$editor.can().chain().focus().toggleItalic().run()}
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor.isActive("italic")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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

          <!-- Underline -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleUnderline().run()}
            disabled={!$editor.can().chain().focus().toggleStrike().run()}
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor.isActive("underline")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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

          <!-- Strike -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleStrike().run()}
            disabled={!$editor.can().chain().focus().toggleStrike().run()}
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor.isActive("strike")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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

          <!-- Code -->
          <button
            type="button"
            onclick={() => $editor.chain().focus().toggleCode().run()}
            disabled={!$editor.can().chain().focus().toggleCode().run()}
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor.isActive("code")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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

          <!-- Link -->
          <button
            type="button"
            onclick={() => setLink()}
            class="fl-bubble-menu-mark-button"
            class:is-active={$editor.isActive("link")}
            class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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

          <!-- Highlight -->
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

          <!-- Text color -->
          <button
            aria-label="Text color"
            type="button"
            bind:this={textColorDropdownTriggerEl}
            onclick={() =>
              toogleDropdown(textColorDropdownTriggerEl, "text-color-dropdown")}
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

      <!-- <div
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
        {/if}
      </div> -->
    </BubbleMenu>
  </div>

  <!-- Image Menu -->
   <div class="hidden">
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
          class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
          class:accent-soft={editorConfig.buttonStyle === "accent-soft"}
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
  </div>
{/if}


<style>
  .hidden {
    display: none;
  }
</style>