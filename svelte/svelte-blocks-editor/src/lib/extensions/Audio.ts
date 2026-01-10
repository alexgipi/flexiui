import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { SvelteNodeViewRenderer } from 'svelte-tiptap';
import AudioPlayer from './AudioPlayerWrapper.svelte'

export interface AudioOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

export interface SetAudioOptions {
  src: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
  colorPlay?: string
  colorBar?: string
  maxWidth?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Añade un elemento de audio personalizado
       * @example
       * editor.commands.setAudio({ src: '/audio.mp3', controls: true })
       */
      setAudio: (options: SetAudioOptions) => ReturnType
    }
  }
}

export const inputRegex =
  /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export const Audio = Node.create<AudioOptions>({
  name: 'audio',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
        parseHTML: el => el.hasAttribute('controls'),
        renderHTML: attrs => (attrs.controls ? { controls: true } : {}),
      },
      autoplay: {
        default: false,
        parseHTML: el => el.hasAttribute('autoplay'),
        renderHTML: attrs => (attrs.autoplay ? { autoplay: true } : {}),
      },
      loop: {
        default: false,
        parseHTML: el => el.hasAttribute('loop'),
        renderHTML: attrs => (attrs.loop ? { loop: true } : {}),
      },
      colorPlay: {
        default: '#333',
        parseHTML: el => el.getAttribute('data-color-play') || '#333',
        renderHTML: attrs => ({
          'data-color-play': attrs.colorPlay,
        }),
      },
      colorBar: {
        default: '#888',
        parseHTML: el => el.getAttribute('data-color-bar') || '#888',
        renderHTML: attrs => ({
          'data-color-bar': attrs.colorBar,
        }),
      },
      maxWidth: {
        default: '100%',
        parseHTML: el => el.getAttribute('data-max-width') || '100%',
        renderHTML: attrs => ({
          'data-max-width': attrs.maxWidth,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'audio-player',
        getAttrs: el => {
          if (!(el instanceof HTMLElement)) return false
          return {
            src: el.getAttribute('src'),
            controls: el.hasAttribute('controls'),
            autoplay: el.hasAttribute('autoplay'),
            loop: el.hasAttribute('loop'),
            colorPlay: el.getAttribute('data-color-play') || '#333',
            colorBar: el.getAttribute('data-color-bar') || '#888',
            maxWidth: el.getAttribute('data-max-width') || '100%',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'audio-player',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ]
  },
  addNodeView() {
    return SvelteNodeViewRenderer(AudioPlayer)
  },

  addCommands() {
    return {
      setAudio:
        options =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            })
          },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: match => {
          const [, , , src] = match
          return { src, controls: true }
        },
      }),
    ]
  },
})
