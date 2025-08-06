import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/content.js'),
      name: 'GitHubBranchGenerator',
      fileName: 'content-bundle',
      formats: ['iife']
    },
    outDir: 'dist',
    rollupOptions: {
      output: {
        inlineDynamicImports: true // Bundle everything into one file
      }
    },
    minify: false,
    sourcemap: false
  }
});