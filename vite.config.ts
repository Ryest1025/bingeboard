import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env variables
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    host: '0.0.0.0', // Allow access from all network interfaces
    open: true,
    strictPort: true,
    cors: true, // Enable CORS for all origins
    allowedHosts: [
      '.app.github.dev',
      '.codespaces.app',
      '.github.dev',
      'fuzzy-xylophone-5g97jqp4vq9wf4jjr-5173.app.github.dev' // Match new Vite port
    ],
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          console.log('🔗 API proxy active: /api -> ' + (process.env.BACKEND_URL || 'http://localhost:5000'));
        }
      }
    }
  },
  define: {
    'process.env': process.env
  }
});
