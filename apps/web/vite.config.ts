import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Re-export from root config with apps/web specific adjustments
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@orthoplus\/core-ui\/(.+)$/,
        replacement: path.resolve(__dirname, '../../categories/@orthoplus/core/packages/ui/src/components/$1.tsx'),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@/modules', replacement: path.resolve(__dirname, './src/modules') },
      { find: '@/contexts', replacement: path.resolve(__dirname, './src/contexts') },
      { find: '@/routes', replacement: path.resolve(__dirname, './src/routes') },
      { find: '@/assets', replacement: path.resolve(__dirname, './src/assets') },
      { find: '@/types', replacement: path.resolve(__dirname, './src/types') },
    ],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },
      '/rest': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 500,
  },
});
