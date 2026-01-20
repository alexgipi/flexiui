import { Extension } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    nodeLineHeight: {
      setNodeLineHeight: (lineHeight: string) => ReturnType;
      unsetNodeLineHeight: () => ReturnType;
    };
  }
}

const allowedTypes = ["paragraph", "heading", "h1"];

export const NodeLineHeight = Extension.create({
  name: "nodeLineHeight",

  addGlobalAttributes() {
    return [
      {
        types: allowedTypes,
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

              if (allowedTypes.includes(node.type.name)) {
                return commands.updateAttributes(node.type.name, {
                  lineHeight,
                });
              }
            }

            return false;
          },

      unsetNodeLineHeight:
        () =>
          ({ state, commands }) => {
            const { $from } = state.selection;

            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d);

              if (allowedTypes.includes(node.type.name)) {
                return commands.updateAttributes(node.type.name, {
                  lineHeight: null,
                });
              }
            }

            return false;
          },
    };
  }
});
