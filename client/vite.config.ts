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
    port: 3000, // Use port 3000 for frontend
    proxy: {
      '/api': {
        // Use localhost (NOT 127.0.0.1) so Set-Cookie host matches frontend host and cookies are stored
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Ensure any Set-Cookie without explicit domain rewrites to localhost to avoid 127.0.0.1 mismatch
        cookieDomainRewrite: {
          '127.0.0.1': 'localhost'
        },
        configure: () => {
          console.log('🔗 API proxy configured: /api -> http://localhost:5000 (cookieDomainRewrite active)');
        }
      }
    }
  },
});