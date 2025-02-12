import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'TagsInput',
      fileName: (format) => `tags-input.${format}.js`
    },
    rollupOptions: {
      // Excluir dependencias externas si las hubiera
      external: [],
      output: {
        globals: {}
      }
    }
  }
});