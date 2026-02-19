<script lang="ts" generics="T extends keyof SvelteHTMLElements = 'div'">
  import type { SvelteHTMLElements } from 'svelte/elements';
  import "./styles.css";
  import "katex/dist/katex.min.css";
  import { onMount, onDestroy } from "svelte";
  import type { Readable } from "svelte/store";
  import { computePosition, offset, autoUpdate } from "@floating-ui/dom";
  import {
    Mathematics,
    migrateMathStrings,
  } from "@tiptap/extension-mathematics";
  import { CharacterCount } from '@tiptap/extensions'
  import { CellSelection } from "prosemirror-tables";
  import {
    createEditor,
    Editor,
    // EditorContent,
    BubbleMenu,
  } from "svelte-tiptap";

  import EditorContent from "./svelte-tiptap-extends/EditorContent.svelte";
  import { getRichTextExtensions } from "./getExtensions";
  import { rgbToHex } from "./utils";

  import MergeCellsBtn from "./Toolbar/action-buttons/MergeCellsBtn.svelte";
  import SplitCellBtn from "./Toolbar/action-buttons/SplitCellBtn.svelte";

  import HeadingBtn from "./Toolbar/action-buttons/nodes/HeadingBtn.svelte";

  import LineHeightDropdown from "./Toolbar/dropdowns/LineHeightDropdown.svelte";
  import ListBtn from "./Toolbar/action-buttons/nodes/ListBtn.svelte";
  import BubbleMenuImage from "./Toolbar/bubble-menus/BubbleMenuImage.svelte";

  import RenderToolbarButton from "./Toolbar/RenderToolbarButton.svelte";

  import { Document } from "@tiptap/extension-document";

  const InlineDoc = Document.extend({ content: "inline*" })

  interface Props {
    id?: string;
    className?: string;
    editable?: boolean;
    content?: string | { type: string; content: any[] } | null;
    nodesLimit?: number;
    charactersLimit?: number;
    limitWarningMessage?: string;
    showToolbar?: boolean;
    showCountersBar?: boolean;
    toolbarAlign?: "left" | "center" | "right";
    semanticHeadings?: boolean;
    uniqueH1?: boolean;
    toolbarConfig?: ToolbarConfig;
    bubbleMenuConfig?: BubbleMenuConfig;
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
      toolbarJustifyContent?: string;
      toolbarGap?: string;
      toolbarBtnPadding?: string;
      toolbarBtnRadius?: string;
      toolbarBtnMinHeight?: string;
      toolbarBtnMinWidth?: string;
      docMaxWidth?: string;
      docPadding?: string;
      docBg?: string;
      docMarginInline?: string;
      docMarginBlock?: string;
      docRadius?: string;
      docTextColor?: string;
      buttonStyle?: "accent-soft" | "accent-solid";
    };
    contentWrapperAs?: T;
    inlineNodeMode?: boolean;
    trailingNode?: boolean;
  }

  type ToolbarButton =
    | string
    | {
        type?: string;
        tooltip?: string;
        icon?: string;
        name?: string;
      };

  type ToolbarSelect = {
    select: ToolbarButton[];
    name?: string;
    tooltip?: string;
    icon?: string;
    type?: string;
  };

  type ToolbarItem = ToolbarButton | ToolbarSelect;
  type ToolbarConfig = ToolbarItem[] | ToolbarItem[][];
  type BubbleMenuConfig = ToolbarItem[] | ToolbarItem[][];

  let {
    id = "fl-rich-text-editor",
    className,
    editable,
    content,
    nodesLimit,
    charactersLimit,
    limitWarningMessage,
    showToolbar = true,
    showCountersBar = true,
    toolbarAlign = "center",
    semanticHeadings = false,
    uniqueH1 = false,
    toolbarConfig = undefined,
    bubbleMenuConfig = undefined,
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
    contentWrapperAs = "div" as T,
    inlineNodeMode = false,
    trailingNode = true,
  }: Props = $props();

  let editor = $state() as Readable<Editor>;

  const DEFAULT_TOOLBAR = [
    [{ type: "undo" }, "redo"],
    [{ type: "headings" }, { type: "lists" }],
    ["codeBlock", "blockquote"],
    ["fontSize", "lineHeight"],
    ["horizontalRule", "hardBreak"],
    ["inlineMath"],
    ["image", "audio"],
    ["mediaGrid", "table"],
    ["textAlignLeft", "textAlignCenter", "textAlignRight", "clearFormatting", "clearNodes"],
    // ...
  ];

  const DEFAULT_BUBBLE_MENU = [
    ["bold", "italic", "underline", "strike", "code", "link", "specialBox"],
    ["textColor", "highlight", "hardBreak"],
  ];

  const defaultEditorConfig = {
    editorAccentColor: "var(--purple)",
    editorBgColor: "transparent",
    editorRadius: "12px",
    toolbarStickyPosition: 0,
    toolbarBgColor: "#242424",
    toolbarTextColor: "currentColor",
    toolbarZIndex: 10,
    toolbarPadding: "8px",
    toolbarJustifyContent: "center",
    toolbarGap: "5px",
    toolbarBtnPadding: "0 9px",
    toolbarBtnRadius: "9px",
    toolbarBtnMinHeight: "34px",
    toolbarBtnMinWidth: "34px",
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

  if (toolbarAlign === "left") {
    editorConfig.toolbarJustifyContent = "flex-start";
  } else if (toolbarAlign === "right") {
    editorConfig.toolbarJustifyContent = "flex-end";
  }

  let bubbleOffset = $editor?.storage.tableCell.customTableSelection === "column" ? 18 : 8;

  let tooltipVisible = $state(false);
  let tooltipX = $state(0);
  let tooltipY = $state(0);
  let tooltip: HTMLDivElement = null as HTMLDivElement;
  let cleanup: () => void;
  let currentTriggerEl: HTMLElement | null = null;

  let activeDropdownType = $state(null);
  let enterPressed = $state(false);
  let fontSize = $state(16) as number;
  let lineHeight = $state(null) as number;
  let currentNodeCount = $state(0);
  let showLimitWarning = $state(false);
  let nodeCounters = $state({ totalCount: 0, h1Count: 0 });

  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
  let headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

  let recentCustomColors = $state([]) as string[];

  const isAccentSoft = editorConfig.buttonStyle === "accent-soft";
  let percentage = $derived.by(() => {
    return $editor ? (100 / charactersLimit) * $editor.storage.characterCount.characters() : 0
  });

  let toolbarGroups = $derived(
    toolbarConfig
      ? Array.isArray(toolbarConfig[0])
        ? (toolbarConfig as ToolbarItem[][])
        : [toolbarConfig]
      : DEFAULT_TOOLBAR,
  );

  let bubbleMenuGroups = $derived(
    bubbleMenuConfig
      ? Array.isArray(bubbleMenuConfig[0])
        ? (bubbleMenuConfig as ToolbarItem[][])
        : [bubbleMenuConfig]
      : DEFAULT_BUBBLE_MENU,
  );

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

  const extensions = getRichTextExtensions({
    editable: true,
    trailingNode,
    customExtensions: [
      Mathematics.configure({
        inlineOptions: {
          onClick: (node, pos) => {
            const katex = prompt(
              "Update math LaTeX expression:",
              node.attrs.latex,
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

      inlineNodeMode && InlineDoc,

      CharacterCount.configure({
        limit: charactersLimit,
      }),
      ...customExtensions,
    ],
  });

  function toogleDropdown(el: HTMLElement, type: string = null) {
    if (!el) return;
    // console.log(el);
    activeDropdownType = type;

    if (tooltipVisible) {
      hideDropdown();
    } else {
      hideDropdown();
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
            // Verificar si hay límite de nodos y si se ha alcanzado
            enterPressed = true;

            const isList =
              $editor.isActive("bulletList") ||
              $editor.isActive("orderedList") ||
              $editor.isActive("taskList");

            const { from } = view.state.selection;

            // Obtener el nodo de ProseMirror en la posición actual
            const pos = view.state.doc.resolve(from);
            const nodeBefore = pos.node(pos.depth);

            const isNodeEmpty = nodeBefore.content.size === 0;

            if ((nodesLimit && !isList) || (isList && isNodeEmpty)) {
              const currentCount = currentNodeCount;
              if (currentCount >= nodesLimit) {
                if (!showLimitWarning) {
                  showLimitWarning = true;
                  setTimeout(() => {
                    showLimitWarning = false;
                  }, 3000);
                }

                event.preventDefault();
                event.stopPropagation();
                return true;
              }
            }

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
                    computedLineHeight.replace("px", ""),
                  );
                  const fontSizePx = parseFloat(computedSize.replace("px", ""));

                  const lineHeightUnitless = lineHeightPx / fontSizePx;

                  // console.log(lineHeightUnitless.toFixed(2)); // ej: "x.xx"

                  fontSize = Math.round(Number(computedSize.replace("px", "")));
                  $editor.chain().focus().unsetNodeFontSize().run();
                  $editor.chain().focus().unsetFontSize().run();

                  $editor.chain().focus().unsetNodeLineHeight().run();
                }
              }
            }, 200);
          }
        },
      },
      onTransaction: ({ editor, transaction }) => {
        // Actualizar contador de nodos
        updateNodeCount();

        if (enterPressed) {
          return;
        }

        editorEvents.onTransaction({ editor, transaction });
        editor = editor;

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

        // find editor h1 and toggle the extra h1 to paragraph
        normalizeH1(editor);
      },

      onBeforeCreate({ editor }) {
        editorEvents.onBeforeCreate({ editor });
      },

      onCreate: ({ editor }) => {
        editorEvents.onCreate({ editor });
        migrateMathStrings(editor);

        // updateNodeCount();
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

  // Helper functions

  function isButton(item: ToolbarItem): item is ToolbarButton {
    return (
      typeof item === "string" ||
      (typeof item === "object" && !("select" in item))
    );
  }

  // función para saber si hay una selección de celdas
  const isCellSelection = () =>
    $editor && $editor.state.selection instanceof CellSelection;

  // función para contar nodos en el documento
  function countNodes(doc: any): { totalCount: number; h1Count: number } {
    // Solo contar los nodos de primer nivel (hijos directos del doc)
    const h1Count = doc?.content?.filter((node) => node.type === "h1").length;

    if (doc.type === "doc" && doc.content) {
      return { totalCount: doc.content.length, h1Count };
    }

    return { totalCount: 0, h1Count: 0 };
  }

  // función para actualizar el contador de nodos
  function updateNodeCount() {
    if ($editor) {
      nodeCounters = countNodes($editor.getJSON());
      currentNodeCount = nodeCounters.totalCount;
    }
  }

  function normalizeH1(editor) {
    const { state } = editor;
    const { doc } = state;

    let firstFound = false;
    let tr = state.tr;

    doc.descendants((node, pos) => {
      // console.log(node.type.name);
      if (node.type.name === "h1") {
        // console.log("Es un h1");
        if (!firstFound) {
          firstFound = true;
        } else {
          tr = tr.setNodeMarkup(pos, state.schema.nodes.paragraph);
        }
      }
    });

    if (tr.docChanged) {
      editor.view.dispatch(tr);
    }
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
  --fl-toolbar-justify-content: {editorConfig.toolbarJustifyContent};
  --fl-toolbar-text-color: {editorConfig.toolbarTextColor};
  --fl-toolbar-btn-padding: {editorConfig.toolbarBtnPadding};
  --fl-toolbar-btn-radius: {editorConfig.toolbarBtnRadius};
  --fl-toolbar-btn-min-height: {editorConfig.toolbarBtnMinHeight};
  --fl-toolbar-btn-min-width: {editorConfig.toolbarBtnMinWidth || editorConfig.toolbarBtnMinHeight};
  --fl-doc-max-width: {editorConfig.docMaxWidth};
  --fl-doc-padding: {editorConfig.docPadding};
  --fl-doc-bg: {editorConfig.docBg};
  --fl-doc-margin-inline: {editorConfig.docMarginInline};
  --fl-doc-margin-block: {editorConfig.docMarginBlock};
  --fl-doc-radius: {editorConfig.docRadius};
  --fl-doc-text-color: {editorConfig.docTextColor};
"
>
  {#if editor && showToolbar}
    <header class="fl-rich-text-toolbar">
      <div class="fl-rich-text-toolbar-container container">
        {#each toolbarGroups as toolbarGroup}
          {#if toolbarGroup.length > 0}
            <div role="group" class="fl-rich-text-toolbar-group">
              {#each toolbarGroup as toolbarItem}
                {#if Array.isArray(toolbarItem)}
                  <!-- Si por alguna razón hay un array anidado, manejarlo -->
                  <p>Array anidado (no debería pasar)</p>
                {:else if typeof toolbarItem === "string"}
                  <RenderToolbarButton
                  type={toolbarItem}
                  {editor}
                  {nodeCounters}
                  {nodesLimit}
                  {currentNodeCount}
                  accentSoft={isAccentSoft}
                  {fontSize}
                  onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
                    toogleDropdown(e.currentTarget as HTMLElement, dropdownName);
                  }}
                  />
                {:else if isButton(toolbarItem)}
                  <RenderToolbarButton
                  type={toolbarItem.type}
                  {editor}
                  {nodeCounters}
                  {nodesLimit}
                  {currentNodeCount}
                  accentSoft={isAccentSoft}
                  {fontSize}
                  onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
                    toogleDropdown(e.currentTarget as HTMLElement, dropdownName);
                  }}
                  />
                {/if}
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    </header>
  {/if}

  <EditorContent as={contentWrapperAs} editor={$editor} class="fl-rich-text-content" data-fl-editable="true" />

  <!-- Warning message for node limit -->
  {#if showLimitWarning && nodesLimit}
    <div class="fl-node-limit-warning">
      {limitWarningMessage ||
        ` No se pueden añadir más nodos a este editor. Max: ${nodesLimit}`}
    </div>
  {/if}

  <!-- Bottom bar showing node count -->
  {#if showCountersBar || percentage >= 90}
    <div class="fl-counters-bar">
      <div class="fl-character-count" class:fl-character-count--warning={percentage >= 100}>
        {#if charactersLimit}
          <svg height="20" width="20" viewBox="0 0 20 20">
              <circle r="10" cx="10" cy="10" fill="#ffffff30" />
              <circle
                r="5"
                cx="10"
                cy="10"
                fill="transparent"
                stroke="currentColor"
                stroke-width="10"
                stroke-dasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
                transform="rotate(-90) translate(-20)"
              />
              <circle r="6" cx="10" cy="10" fill="var(--fl-editor-bg)" />
          </svg>
        {/if}

        <span>
          Characters: {$editor?.storage?.characterCount?.characters()} 
          {#if charactersLimit} / {charactersLimit}{/if}
        </span>
      </div>

      {#if showCountersBar}
        <span>
          Words: {$editor?.storage?.characterCount?.words()}
        </span>
      {/if}

      {#if nodesLimit}
        <span class="fl-node-count-text">
          Nodes: {currentNodeCount} / {nodesLimit}
        </span>
      {/if}

      <!-- <div class="fl-node-count-progress">
        <div
          class="fl-node-count-progress-bar"
          style="width: {Math.min((currentNodeCount / nodesLimit) * 100, 100)}%"
        ></div>
      </div> -->
    </div>
  {/if}
</div>

<div
  class="fl-toolbar-dropdown-panel"
  bind:this={tooltip}
  style="display: {tooltipVisible ? 'flex' : 'none'}; 
  left: {tooltipX}px;
  top: {tooltipY}px;
  --fl-editor-accent-color: {editorConfig.editorAccentColor};
  "
>
  {#if activeDropdownType === "headings-dropdown"}
    <div role="group" class="fl-rich-text-toolbar-group">
      {#each headingLevels as level}
        <HeadingBtn
          {editor}
          {nodeCounters}
          {uniqueH1}
          {level}
          accenSoft={isAccentSoft}
        />
      {/each}
    </div>
  {:else if activeDropdownType === "lists-dropdown"}
    <div role="group" class="fl-rich-text-toolbar-group">
      <ListBtn {editor} type="bulletList" accenSoft={isAccentSoft} />

      <ListBtn {editor} type="orderedList" accenSoft={isAccentSoft} />

      <ListBtn {editor} type="taskList" accenSoft={isAccentSoft} />
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
    <LineHeightDropdown {lineHeight} {editor} />
  {/if}
</div>

{#if editor}
  <div class="hidden">
    <BubbleMenu
      options={{
        placement: "top",
        strategy: "absolute",
        offset: bubbleOffset,
        flip: false,
      }}
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

        if (isRow || isColumn) {
          return false;
        }

        // // Ocultar si es CellSelection completa
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
        {#each bubbleMenuGroups as bubbleMenuGroup}
          {#if bubbleMenuGroup.length > 0}
            <div role="group" class="fl-rich-text-toolbar-group">
              {#each bubbleMenuGroup as bubbleMenuItem}
                {#if Array.isArray(bubbleMenuItem)}
                  <!-- Si por alguna razón hay un array anidado, manejarlo -->
                  <p>Array anidado (no debería pasar)</p>
                {:else if typeof bubbleMenuItem === "string"}
                  <RenderToolbarButton
                  type={bubbleMenuItem}
                  {editor}
                  {nodeCounters}
                  {nodesLimit}
                  {currentNodeCount}
                  accentSoft={isAccentSoft}
                  {fontSize}
                  onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
                    toogleDropdown(e.currentTarget as HTMLElement, dropdownName);
                  }}
                  />
                {:else if isButton(bubbleMenuItem)}
                  <RenderToolbarButton
                  type={bubbleMenuItem.type}
                  {editor}
                  {nodeCounters}
                  {nodesLimit}
                  {currentNodeCount}
                  accentSoft={isAccentSoft}
                  {fontSize}
                  onToggleDropdown={(e: MouseEvent, dropdownName: string) => {
                    toogleDropdown(e.currentTarget as HTMLElement, dropdownName);
                  }}
                  />
                {/if}
              {/each}
            </div>
          {/if}
        {/each}

        {#if isCellSelection()}
          <div role="group" class="fl-rich-text-toolbar-group">
            <MergeCellsBtn {editor} />
            <SplitCellBtn {editor} />
          </div>
        {/if}
      </div>
    </BubbleMenu>
  </div>

  <BubbleMenuImage {editor} accentSoft={isAccentSoft} />
{/if}

<style>
  .hidden {
    display: none;
  }

  .fl-node-count-text {
    strong {
      margin-right: 4px;
    }
  }
</style>