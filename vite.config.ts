import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix: Define __dirname manually in ESM (ES Modules) environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    // Fix: Map API_KEY from process.env.API_KEY to ensure compliance with Gemini guidelines
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  resolve: {
    alias: {
      // Fix: Reference the manually defined __dirname to resolve paths correctly
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        // Fix: Reference the manually defined __dirname to resolve paths correctly
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
