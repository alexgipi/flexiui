// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import astroExpressiveCode from 'astro-expressive-code'

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), astroExpressiveCode({
      // You can use any of the themes bundled with Shiki by name,
      // specify a path to JSON theme file, or pass an instance
      // of the `ExpressiveCodeTheme` class here:
      themes: ['dracula', 'solarized-light'],
      shiki: {
        // You can pass additional plugin options here,
        // e.g. to load custom language grammars:
        langs: [
          // import('./some-exported-grammar.mjs'),
          // JSON.parse(fs.readFileSync('./some-json-grammar.json', 'utf-8'))
        ],
      },
      styleOverrides: {
        codeBackground: 'transparent',
        borderWidth: '0px',
        frames: {
          frameBoxShadowCssValue: 'none'
        }
      }
    }), 
    mdx(),
  ]
});