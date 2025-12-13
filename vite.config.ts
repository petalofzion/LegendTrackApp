import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Ensure we can access the env variables
  envPrefix: 'VITE_',
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    // Svelte output is usually smaller, but let's keep reasonable defaults
    target: 'esnext',
  },
});