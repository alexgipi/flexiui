import { Mark } from "@tiptap/core";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    specialBox: {
      specialBox: () => ReturnType
      isActive: (options: any) => ReturnType
    }
  }
}

export const SpecialBox = Mark.create({
  name: "specialBox",
  excludes: 'code highlight',

  parseHTML() {
    return [
      {
        tag: "span[data-special-box]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "class": "special-box",
        "data-special-box": "true",
        style: "line-height: 1.5;",
      },
      0,
    ];
  },

  addCommands(): any {
    return {
      specialBox: () => ({ commands }: any) => {
        return commands.toggleMark(this.name);
      },
      isActive: (options: any) => {
        return options.type === this.name;
      },
    };
  },
});