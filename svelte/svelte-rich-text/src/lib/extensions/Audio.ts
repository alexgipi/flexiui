import {
  Node,
  mergeAttributes,
  nodeInputRule,
} from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'
import AudioPlayer from './AudioPlayerWrapper.svelte'

export interface AudioOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>

  // 🎨 defaults configurables
  bgColor: string
  textColor: string
  borderRadius: string
  accentColor: string
  accentColorPaused: string
  seekBarBgColor: string
  playBtnBgColor: string
  playBtnTextColor: string
  colorPlay: string
  maxWidth: string
}

export interface SetAudioOptions {
  src: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean

  bgColor?: string
  textColor?: string
  borderRadius?: string
  accentColor?: string
  accentColorPaused?: string
  seekBarBgColor?: string
  playBtnBgColor?: string
  playBtnTextColor?: string
  colorPlay?: string
  maxWidth?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: SetAudioOptions) => ReturnType
    }
  }
}

/**
 * Solo acepta: ![audio](url)
 */
export const audioInputRegex =
  /(?:^|\s)(!\[audio\]\((\S+?)\))$/

export const Audio = Node.create<AudioOptions>({
  name: 'audio',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},

      // 🎨 Defaults configurables para configure()
      bgColor: '#8989891f',
      textColor: 'currentColor',
      borderRadius: '18px',
      accentColor: '#5e17eb',
      accentColorPaused: '#fff',
      seekBarBgColor: '#8d8d8d3a',
      playBtnBgColor: '#8d8d8d26',
      playBtnTextColor: 'currentColor',
      colorPlay: '#5d5d5dc9',
      maxWidth: '100%',
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
      src: { default: null },
      controls: { default: true },
      autoplay: { default: false },
      loop: { default: false },

      id: {
        default: `fl-audio-player-${Math.random().toString(36).slice(2)}`,
        renderHTML: attrs => ({ 'data-id': attrs.id }),
      },

      bgColor: {
        default: this.options.bgColor,
        renderHTML: a => ({ 'data-bg-color': a.bgColor }),
      },

      textColor: {
        default: this.options.textColor,
        renderHTML: a => ({ 'data-text-color': a.textColor }),
      },

      borderRadius: {
        default: this.options.borderRadius,
        renderHTML: a => ({ 'data-border-radius': a.borderRadius }),
      },

      accentColor: {
        default: this.options.accentColor,
        renderHTML: a => ({ 'data-accent-color': a.accentColor }),
      },

      accentColorPaused: {
        default: this.options.accentColorPaused,
        renderHTML: a => ({ 'data-accent-color-paused': a.accentColorPaused }),
      },

      seekBarBgColor: {
        default: this.options.seekBarBgColor,
        renderHTML: a => ({ 'data-seek-bar-bg-color': a.seekBarBgColor }),
      },

      playBtnBgColor: {
        default: this.options.playBtnBgColor,
        renderHTML: a => ({ 'data-play-btn-bg-color': a.playBtnBgColor }),
      },

      playBtnTextColor: {
        default: this.options.playBtnTextColor,
        renderHTML: a => ({ 'data-play-btn-text-color': a.playBtnTextColor }),
      },

      colorPlay: {
        default: this.options.colorPlay,
        renderHTML: a => ({ 'data-color-play': a.colorPlay }),
      },

      maxWidth: {
        default: this.options.maxWidth,
        renderHTML: a => ({ 'data-max-width': a.maxWidth }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'fl-audio-player' }]
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
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    }
  },

  /**
   * ✍️ Al escribir: ![audio](url)
   */
  addInputRules() {
    return [
      nodeInputRule({
        find: audioInputRegex,
        type: this.type,
        getAttributes: match => {
          const [, , src] = match
          return { src, controls: true }
        },
      }),
    ]
  },

  /**
   * 📋 Al pegar: ![audio](url)
   */
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')
            if (!text) return false

            const match = text.match(/!\[audio\]\((\S+?)\)/)
            if (!match) return false

            const [, src] = match
            const { state, dispatch } = view
            const { from, to } = state.selection

            dispatch(
              state.tr.replaceRangeWith(
                from,
                to,
                this.type.create({
                  src,
                  controls: true,
                }),
              ),
            )

            return true
          },
        },
      }),
    ]
  },
})
