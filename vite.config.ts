import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(() => {
  const analyze = process.env.ANALYZE_BUNDLE === 'true';
  const plugins: PluginOption[] = [react()];

  if (analyze) {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    );
  }

  return {
    plugins,
    build: {
      chunkSizeWarningLimit: 900,
    },
  };
});
