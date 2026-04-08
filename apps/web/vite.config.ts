import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Re-export from root config with apps/web specific adjustments
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Strip console.* and debugger from production builds
  ...(mode === 'production' && {
    // Escaping aggressive esbuild minification issues 
    // esbuild: { drop: ['console', 'debugger'] },
  }),
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
    minify: 'terser',
    sourcemap: true,
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'charts';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf';
            if (id.includes('exceljs')) return 'excel';
          }
        },
      },
    },
  },
}));
