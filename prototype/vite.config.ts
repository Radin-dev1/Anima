import { defineConfig } from 'vite';

// GitHub Pages project site: https://radin-dev1.github.io/Anima/
export default defineConfig({
  base: '/Anima/',
  root: '.',
  server: { port: 5173, open: false },
  build: { outDir: 'dist', sourcemap: true },
});
