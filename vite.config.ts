import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
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
    host: '0.0.0.0', // Allow external access
    port: 3000,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    hmr: {
<<<<<<< HEAD
      overlay: false
    },
    host: '0.0.0.0', // Allow access from all network interfaces
    port: 3000, // Try a different port
    cors: true, // Enable CORS for all origins
    ...(process.env.HTTPS === 'true' && {
      https: {
        key: './localhost.key',
        cert: './localhost.crt'
      }
    }),
=======
      port: 3001, // Use a separate port for HMR
    },
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
  },
});
