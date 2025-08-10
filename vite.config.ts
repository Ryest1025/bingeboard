import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
      overlay: false
    },
    host: '0.0.0.0', // Allow access from all network interfaces
    cors: true, // Enable CORS for all origins
    allowedHosts: [
      '.app.github.dev',
      '.codespaces.app',
      '.github.dev',
      'fuzzy-xylophone-5g97jqp4vq9wf4jjr-3000.app.github.dev' // Match Express port
    ],
    // ✅ Re-introduced proxy so frontend dev server (3000) can forward to backend (5000) with consistent localhost origin
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Use localhost (not 127.0.0.1) to keep cookies on same origin family
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          console.log('🔗 API proxy active: /api -> http://localhost:5000');
        }
      }
    }
  },
});
