import { Extension } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      setNodeLineHeight: (lineHeight: string) => ReturnType;
      unsetNodeLineHeight: () => ReturnType;
    };
  }
}

export const NodeLineHeight = Extension.create({
  name: "nodeLineHeight",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setNodeLineHeight:
        (lineHeight: string) =>
          ({ state, commands }) => {
            const { $from } = state.selection;

            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d);

              if (node.type.name === "paragraph") {
                return commands.updateAttributes("paragraph", {
                  lineHeight,
                });
              }

              if (node.type.name === "heading") {
                return commands.updateAttributes("heading", {
                  lineHeight,
                });
              }
            }

            return false;
          },

      unsetNodeLineHeight:
        () =>
          ({ commands }) => {
            return commands.updateAttributes("paragraph", {
              lineHeight: null,
            });
          },
    };
  }
});
