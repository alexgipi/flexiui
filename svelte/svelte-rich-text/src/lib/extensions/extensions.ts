import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { ListKit } from "@tiptap/extension-list";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Audio } from "./Audio";
import { NodeLineHeight } from "./NodeLineHeight";
import { EnhancedLink } from "./EnhancedLink";

import katex from "katex";

/**
 * Fuente única de extensiones
 */
export function createExtensions({
  customExtensions = [],
  editable = true,
}: {
  customExtensions?: any[];
  editable?: boolean;
} = {}) {
  return [
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

    Audio.configure({
      HTMLAttributes: { class: "audio-player" },
    }),

    Image.configure({
      inline: true,
    }),

    ListKit,

    TextAlign.configure({
      types: [
        "heading",
        "paragraph",
        "bulletList",
        "taskList",
        "listItem",
        "blockquote",
      ],
    }),

    Mathematics.extend({
      renderHTML({ node }) {
        const latex = node.attrs.latex ?? "";
        return [
          "span",
          {
            class: "math-inline",
            innerHTML: katex.renderToString(latex, {
              throwOnError: false,
            }),
          },
        ];
      },
    }).configure({
      katexOptions: {
        displayMode: false,
        throwOnError: false,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\ZZ": "\\mathbb{Z}",
        },
      },
      inlineOptions: editable
        ? {
            onClick: (node, pos) => {
              const latex = prompt("Update LaTeX:", node.attrs.latex);
              if (latex) {
                this.editor
                  .chain()
                  .setNodeSelection(pos)
                  .updateInlineMath({ latex })
                  .focus()
                  .run();
              }
            },
          }
        : {},
    }),

    NodeLineHeight,

    ...customExtensions,
  ];
}
