export function rgbToHex(str: string) {
  if (isHex(str)) return str;

  if (!str) {
    return '#ffffff'
  } else if (/#[0-9a-f]{3,8}\b/i.test(str)) {
    return str
  }

  return str.replace(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi, (match: any) => {
    const [r, g, b] = match.match(/\d+/g).map(Number)
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
  })
}

function isHex(str: string) {
  return /^#([0-9a-f]{3}){1,2}$/i.test(str)
}

export const exampleJSONContent = [
  {
    type: "heading",
    attrs: { level: 1 },
    content: [{ type: "text", text: "Hi there," }],
  },
  {
    type: "taskList",
    content: [
      {
        type: "taskItem",
        attrs: { checked: true },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Esto es un checkbox" }],
          },
        ],
      },
      {
        type: "taskItem",
        attrs: { checked: true },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Otro item del checkbox" }],
          },
        ],
      },
      {
        type: "taskItem",
        attrs: { checked: false },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "jhjkhjkjhkjh" }],
          },
        ],
      },
      {
        type: "taskItem",
        attrs: { checked: false },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "hgfhfgh" }],
          },
        ],
      },
    ],
  },
  {
    type: "paragraph",
    content: [
      { type: "text", text: "this is a " },
      { type: "text", marks: [{ type: "italic" }], text: "basic" },
      { type: "text", text: " example of " },
      { type: "text", marks: [{ type: "bold" }], text: "Tiptap" },
      {
        type: "text",
        text: ". Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:",
      },
    ],
  },
  {
    type: "bulletList",
    content: [
      {
        type: "listItem",
        attrs: { color: "" },
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "That’s a bullet list with one …" },
            ],
          },
        ],
      },
      {
        type: "listItem",
        attrs: { color: "" },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "… or two list items." }],
          },
        ],
      },
    ],
  },
  {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:",
      },
    ],
  },
  {
    type: "codeBlock",
    attrs: { language: "css" },
    content: [{ type: "text", text: "body {\n display: none;\n}" }],
  },
  {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.",
      },
    ],
  },
  {
    type: "blockquote",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Wow, that’s amazing. Good work, boy! 👏 ",
          },
          { type: "hardBreak" },
          { type: "text", text: "— Mom" },
        ],
      },
    ],
  },
  { type: "paragraph" },
  // {
  //   type: "MediaGridComponent",
  //   attrs: { cols: 2 },
  // },
  // {
  //   type: "SvelteEditableComponent",
  //   content: [
  //     {
  //       type: "text",
  //       text: "Editable component",
  //     },
  //   ],
  // }
]