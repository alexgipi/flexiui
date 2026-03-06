// getExtensions.ts
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { ListKit } from "@tiptap/extension-list";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Mathematics } from "@tiptap/extension-mathematics";
import { TableKit } from "@tiptap/extension-table";

import { Audio } from "./extensions/Audio";
import { NodeLineHeight } from "./extensions/NodeLineHeight";
import { NodeFontSize } from "./extensions/NodeFontSize";
import { MediaGridExtension } from "./extensions/MediaGrid/MediaGrid";
import { MediaGridItemExtension } from "./extensions/MediaGrid/MediaGridItem";
import { CustomTableCell } from "./extensions/Table/CustomTableCell";
import { CustomTableHeader } from "./extensions/Table/CustomTableHeader";
import { EnhancedLink } from "./extensions/EnhancedLink";
import { SemanticHeadings } from "./extensions/SemanticHeadings";
import { Heading } from "@tiptap/extension-heading";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    h1: {
      toggleH1: () => ReturnType;
    };

    h2: {
      toggleH2: () => ReturnType;
    };

    h3: {
      toggleH3: () => ReturnType;
    };

    h4: {
      toggleH4: () => ReturnType;
    };

    h5: {
      toggleH5: () => ReturnType;
    };

    h6: {
      toggleH6: () => ReturnType;
    };
  }
}

  const H1 = Heading.extend({
    name: "h1",
  
    addCommands() {
      return {
        toggleH1:
          () =>
          ({ commands }) => {
            return commands.toggleNode('h1', 'paragraph');
          },
      }
    },
  }).configure({ levels: [1] });

  const H2 = Heading.extend({
    name: "h2",
  
    addCommands() {
      return {
        toggleH2:
          () =>
          ({ commands }) => {
            return commands.toggleNode('h2', 'paragraph');
          },
      }
    },
  }).configure({ levels: [2] });

  const H3 = Heading.extend({
    name: "h3",
  
    addCommands() {
      return {
        toggleH3:
          () =>
          ({ commands }) => {
            return commands.toggleNode('h3', 'paragraph');
          },
      }
    },
  }).configure({ levels: [3] });

  const H4 = Heading.extend({
    name: "h4",
  
    addCommands() {
      return {
        toggleH4:
          () =>
          ({ commands }) => {
            return commands.toggleNode('h4', 'paragraph');
          },
      }
    },
  }).configure({ levels: [4] });

  const H5 = Heading.extend({
    name: "h5",
  
    addCommands() {
      return {
        toggleH5:
          () =>
          ({ commands }) => {
            return commands.toggleNode('h5', 'paragraph');
          },
      }
    },
  }).configure({ levels: [5] });

  const H6 = Heading.extend({
    name: "h6",
  
    addCommands() {
      return {
        toggleH6:
          () =>
          ({ commands }) => {
            return commands.toggleNode('h6', 'paragraph');
          },
      }
    },
  }).configure({ levels: [6] });


export function getRichTextExtensions(options?: {
  editable?: boolean;
  trailingNode?: boolean;
  customExtensions?: any[];
}) {
  const { editable = false, trailingNode = true, customExtensions = [] } = options ?? {};

  return [
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    // Heading.configure({ levels: [2, 3, 4, 5, 6] }),
    Highlight.configure({ multicolor: true }),
    TextStyleKit.configure({
      // fontSize: false
    }),
    StarterKit.configure({
      ...(!trailingNode && { trailingNode: false }),
      link: false,
      bulletList: false,
      listItem: false,
      orderedList: false,
      listKeymap: false,
    }),
    EnhancedLink,
    Image.configure({ inline: true }),
    Audio.configure({
      HTMLAttributes: { class: "audio-player" },
    }),
    ListKit,
    TextAlign.configure({
      types: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "heading",
        "paragraph",
        "bulletList",
        "taskList",
        "listItem",
        "blockquote",
      ],
    }),
    NodeLineHeight,
    NodeFontSize,
    MediaGridExtension,
    MediaGridItemExtension,
    TableKit.configure({
      table: {
        HTMLAttributes: { class: "fl-table-editable" },
        resizable: true,
        renderWrapper: true
      },
      tableCell: false,
      tableHeader: false,
    }),
    CustomTableCell.configure({
      HTMLAttributes: { class: "fl-cell-editable" },
    }),
    CustomTableHeader.configure({
      HTMLAttributes: { class: "fl-cell-editable" },
    }),
    !editable ? Mathematics : null,
    ...customExtensions,
  ];
}
