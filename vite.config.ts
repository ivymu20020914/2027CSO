import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@client': path.resolve(process.cwd(), 'client'),
      '@shared': path.resolve(process.cwd(), 'shared'),
      '@': path.resolve(process.cwd(), 'client/src'),
    },
  },
  build: { outDir: '../dist/client', emptyOutDir: true },
});
