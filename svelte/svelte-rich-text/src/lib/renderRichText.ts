import { renderToHTMLString, serializeChildrenToHTMLString } from "@tiptap/static-renderer";
import katex from "katex";
import { getRichTextExtensions } from "./getExtensions";

interface RenderOptions {
    json: any;
    customExtensions?: any[];
}

export function renderHTMLFromJSON({json, customExtensions = []}: RenderOptions) {
    const extensions = getRichTextExtensions({ customExtensions });
    
    const html = renderToHTMLString({
        extensions: extensions, // using your extensions
        content: json,
        options: {
            nodeMapping: {
                // Aquí le dices cómo renderizar el nodo "mathematics"
                inlineMath({ node }) {
                    const latex = node.attrs.latex || ''
                    // Devuelve el HTML que quieres que se genere
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
                    const src = node.attrs.src;
                    const controls = node.attrs.controls;

                    return `
            <fl-audio-player
            class="fl-audio-player"
            id="fl-audio-player-${node.attrs.id}" 
            src="${src}">
            </fl-audio-player>`
                }
            }
        }
    });

    return html;
}