import { Extension } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nodeFontSize: {
      setNodeFontSize: (fontSize: string) => ReturnType;
      unsetNodeFontSize: () => ReturnType;
    };
  }
}

const allowedTypes = ["paragraph", "heading", "h1"];

export const NodeFontSize = Extension.create({
  name: "nodeFontSize",

  addGlobalAttributes() {
    return [
      {
        types: allowedTypes,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setNodeFontSize:
        (fontSize: string) =>
          ({ state, commands }) => {
            const { $from } = state.selection;

            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d);

              if (allowedTypes.includes(node.type.name)) {
                return commands.updateAttributes(node.type.name, {
                  fontSize,
                });
              }
            }

            return false;
          },

      unsetNodeFontSize:
        () =>
          ({ state, commands }) => {
            const { $from } = state.selection;

            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d);

              if (allowedTypes.includes(node.type.name)) {
                return commands.updateAttributes(node.type.name, {
                  fontSize: null,
                });
              }
            }

            return false;
          },
    };
  }
});
