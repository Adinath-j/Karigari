import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Development server config
  server: {
    port: 5173,
    // Optional proxy for local development only
    proxy: {
      '/api': {
        target: 'http://localhost:10000', // Local backend for dev
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',        // Build output folder
    assetsDir: 'assets',   // Assets subfolder
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
  },

  // Production base path (Vercel static deployment)
  base: '/',
});
