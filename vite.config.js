import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import os from 'os';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Store Vite cache on C: drive (which has 10 GB free space) to resolve D: drive space limits
  cacheDir: path.join(os.tmpdir(), 'vite-cache-devforge'),
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  }
});
