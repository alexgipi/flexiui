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

export const HEADINGS = [
    {
        level: 1,
        ariaLabel: "H1",
        icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM21.0005 8V20H19.0005L19 10.204L17 10.74V8.67L19.5005 8H21.0005Z"></path></svg>`
    },
    {
        level: 2,
        ariaLabel: "H2",
        icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 8C20.5711 8 22.25 9.67893 22.25 11.75C22.25 12.6074 21.9623 13.3976 21.4781 14.0292L21.3302 14.2102L18.0343 18H22V20H15L14.9993 18.444L19.8207 12.8981C20.0881 12.5908 20.25 12.1893 20.25 11.75C20.25 10.7835 19.4665 10 18.5 10C17.5818 10 16.8288 10.7071 16.7558 11.6065L16.75 11.75H14.75C14.75 9.67893 16.4289 8 18.5 8Z"></path></svg>`
    },
    {
        level: 3,
        ariaLabel: "H3",
        icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8L21.9984 10L19.4934 12.883C21.0823 13.3184 22.25 14.7728 22.25 16.5C22.25 18.5711 20.5711 20.25 18.5 20.25C16.674 20.25 15.1528 18.9449 14.8184 17.2166L16.7821 16.8352C16.9384 17.6413 17.6481 18.25 18.5 18.25C19.4665 18.25 20.25 17.4665 20.25 16.5C20.25 15.5335 19.4665 14.75 18.5 14.75C18.214 14.75 17.944 14.8186 17.7056 14.9403L16.3992 13.3932L19.3484 10H15V8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path></svg>`
    },
    {
        level: 4,
        ariaLabel: "H4",
        icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 20H11V13H4V20H2V4H4V11H11V4H13V20ZM22 8V16H23.5V18H22V20H20V18H14.5V16.66L19.5 8H22ZM20 11.133L17.19 16H20V11.133Z"></path></svg>`
    },
    {
        level: 5,
        ariaLabel: "H5",
        icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8V10H17.6769L17.2126 12.6358C17.5435 12.5472 17.8912 12.5 18.25 12.5C20.4591 12.5 22.25 14.2909 22.25 16.5C22.25 18.7091 20.4591 20.5 18.25 20.5C16.4233 20.5 14.8827 19.2756 14.4039 17.6027L16.3271 17.0519C16.5667 17.8881 17.3369 18.5 18.25 18.5C19.3546 18.5 20.25 17.6046 20.25 16.5C20.25 15.3954 19.3546 14.5 18.25 14.5C17.6194 14.5 17.057 14.7918 16.6904 15.2478L14.8803 14.3439L16 8H22ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4Z"></path></svg>`
    },
    {
        level: 6,
        ariaLabel: "H6",
        icon: `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.097 8L18.499 12.5C20.7091 12.5 22.5 14.2909 22.5 16.5C22.5 18.7091 20.7091 20.5 18.5 20.5C16.2909 20.5 14.5 18.7091 14.5 16.5C14.5 15.7636 14.699 15.0737 15.0461 14.4811L18.788 8H21.097ZM4 4V11H11V4H13V20H11V13H4V20H2V4H4ZM18.5 14.5C17.3954 14.5 16.5 15.3954 16.5 16.5C16.5 17.6046 17.3954 18.5 18.5 18.5C19.6046 18.5 20.5 17.6046 20.5 16.5C20.5 15.3954 19.6046 14.5 18.5 14.5Z"></path></svg>`
    }
]

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