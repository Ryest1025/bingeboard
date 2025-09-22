import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: '0.0.0.0', // Allow external access for Codespaces
    port: 3001, // Use port 3001 for frontend (matching actual dev server)
    strictPort: true, // Fail if 3001 is busy
    hmr: {
      protocol: 'ws',
      host: 'localhost', // Match browser access for proper WebSocket connection
      port: 3001, // Match actual frontend port
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Backend on port 5000
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          console.log('🔗 API proxy configured: /api -> http://127.0.0.1:5000');
        }
      }
    }
  },
  preview: {
    port: 3001,
  },
});