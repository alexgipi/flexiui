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
      id: {
        default: `fl-audio-player-${Math.random().toString(36).substring(2, 15)}`,
        parseHTML: el => el.getAttribute('data-id') || null,
        renderHTML: attrs => ({
          'data-id': attrs.id,
        }),
      },
      bgColor: {
        default: '#8c8c8c45',
        parseHTML: el => el.getAttribute('data-bg-color'),
        renderHTML: attrs => ({
          'data-bg-color': attrs.bgColor,
        }),
      },
      textColor: {
        default: 'currentColor',
        parseHTML: el => el.getAttribute('data-text-color'),
        renderHTML: attrs => ({
          'data-text-color': attrs.textColor,
        }),
      },
      borderRadius: {
        default: '18px',
        parseHTML: el => el.getAttribute('data-border-radius'),
        renderHTML: attrs => ({
          'data-border-radius': attrs.borderRadius,
        }),
      },
      accentColor: {
        default: '#5e17eb',
        parseHTML: el => el.getAttribute('data-accent-color'),
        renderHTML: attrs => ({
          'data-accent-color': attrs.accentColor,
        }),
      },
      accentColorPaused:{
        default: '#fff',
        parseHTML: el => el.getAttribute('data-accent-color-paused'),
        renderHTML: attrs => ({
          'data-accent-color-paused': attrs.accentColorPaused,
        }),
      },
      colorPlay: {
        default: '#5d5d5dc9',
        parseHTML: el => el.getAttribute('data-color-play'),
        renderHTML: attrs => ({
          'data-color-play': attrs.colorPlay,
        }),
      },
      maxWidth: {
        default: '100%',
        parseHTML: el => el.getAttribute('data-max-width'),
        renderHTML: attrs => ({
          'data-max-width': attrs.maxWidth,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'fl-audio-player',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'fl-audio-player',
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
