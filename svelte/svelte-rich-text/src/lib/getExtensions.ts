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
import { MediaGridExtension } from "./extensions/MediaGrid/MediaGrid";
import { MediaGridItemExtension } from "./extensions/MediaGrid/MediaGridItem";
import { CustomTableCell } from "./extensions/Table/CustomTableCell";
import { CustomTableHeader } from "./extensions/Table/CustomTableHeader";
import { EnhancedLink } from "./extensions/EnhancedLink";
import { Placeholder } from "./extensions/Placeholder";
import { Heading } from "@tiptap/extension-heading";

  const DocHeading = Heading.extend({
    name: "h1",
    group: "none", // <- prevent it from being considered as a `block` in the body of the document
  }).configure({ levels: [1] });


export function getRichTextExtensions(options?: {
  editable?: boolean;
  customExtensions?: any[];
}) {
  const { editable = false, customExtensions = [] } = options ?? {};

  return [
    DocHeading,
    Heading.configure({ levels: [2, 3, 4, 5, 6] }),
    Highlight.configure({ multicolor: true }),
    TextStyleKit,
    StarterKit.configure({
      trailingNode: false,
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
        "heading",
        "paragraph",
        "bulletList",
        "taskList",
        "listItem",
        "blockquote",
      ],
    }),
    NodeLineHeight,
    MediaGridExtension,
    MediaGridItemExtension,
    TableKit.configure({
      table: {
        HTMLAttributes: { class: "fl-table-editable" },
        resizable: true,
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
