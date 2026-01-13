import { renderToHTMLString, serializeChildrenToHTMLString } from "@tiptap/static-renderer";
import katex from "katex";
import { getRichTextExtensions } from "./getExtensions";

interface RenderOptions {
    json: any;
    customExtensions?: any[];
    customNodeMapping?: any;
}

const nodeMapping: any = {
    inlineMath({ node }) {
        const latex = node.attrs.latex || ''
        return `<span class="math-inline">${katex.renderToString(latex, { throwOnError: false })}</span>`
    },
    MediaGridComponent({ node, children }) {
        const cols = node.attrs.cols || 2;
        const gap = node.attrs.gap || '1rem';
        const showIndicator = node.attrs.showIndicator || false;
        const indicatorType = node.attrs.indicatorType || 'numeric';

        return `
            <div 
            class="fl-media-grid" 
            data-cols="${cols}"
            data-gap="${gap}"
            data-show-indicator="${showIndicator}"
            data-indicator-type="${indicatorType}"
            style="
              --fl-grid-cols: ${cols};
              --fl-grid-gap: ${gap};
            ">
              ${serializeChildrenToHTMLString(children)}
            </div>`
    },
    gridItem({ node, children }) {
        return `<div class="fl-grid-item">${serializeChildrenToHTMLString(children)}</div>`
    },
    audio({ node, children }) {
        const {
            id,
            src,
            controls,
            bgColor,
            textColor,
            borderRadius,
            accentColor,
            accentColorPaused,
            playBtnBgColor,
            playBtnTextColor,
            maxWidth,
            colorPlay
        } = node.attrs;

        return `
        <fl-audio-player
        class="fl-audio-player"
        id="${id}" 
        src="${src}"
        controls="${controls}"
        bgColor="${bgColor}"
        textColor="${textColor}"
        borderRadius="${borderRadius}"
        accentColor="${accentColor}"
        accentColorPaused="${accentColorPaused}"
        playBtnBgColor="${playBtnBgColor}"
        playBtnTextColor="${playBtnTextColor}"
        maxWidth="${maxWidth}"
        colorPlay="${colorPlay}"
        >
        </fl-audio-player>
        `
    },
}


export function renderHTMLFromJSON({ json, customExtensions = [], customNodeMapping = {} }: RenderOptions) {
    const extensions = getRichTextExtensions({ customExtensions });

    const finalNodeMapping: any = {
        ...nodeMapping,
        ...customNodeMapping,
    }

    const html = renderToHTMLString({
        extensions: extensions, // using your extensions
        content: json,
        options: {
            nodeMapping: finalNodeMapping,
        }
    });

    return html;
}