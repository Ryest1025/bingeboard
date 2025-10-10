import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env variables
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to replace HTTP references with HTTPS to prevent mixed content issues
const httpsRewritePlugin = () => ({
  name: 'https-rewrite',
  generateBundle(options: any, bundle: any) {
    Object.keys(bundle).forEach((fileName) => {
      const chunk = bundle[fileName];
      if (chunk.type === 'chunk' && typeof chunk.code === 'string') {
        // Replace common HTTP namespace URLs with HTTPS
        chunk.code = chunk.code
          .replace(/http:\/\/www\.w3\.org\/2000\/svg/g, 'https://www.w3.org/2000/svg')
          .replace(/http:\/\/www\.w3\.org\/1999\/xhtml/g, 'https://www.w3.org/1999/xhtml')
          .replace(/http:\/\/www\.w3\.org\/1999\/xlink/g, 'https://www.w3.org/1999/xlink')
          .replace(/http:\/\/www\.w3\.org\/XML\/1998\/namespace/g, 'https://www.w3.org/XML/1998/namespace')
          .replace(/http:\/\/schemas\.xmlsoap\.org\/soap\/envelope\//g, 'https://schemas.xmlsoap.org/soap/envelope/')
          .replace(/http:\/\/www\.apache\.org\/licenses\/LICENSE-2\.0/g, 'https://www.apache.org/licenses/LICENSE-2.0');
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), httpsRewritePlugin()],
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
    host: "0.0.0.0", // Allow external access for Codespaces
    port: 3001, // Match the port we're actually using
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost", // Client connects to localhost for HMR
      port: 3001, // Match the server port
    },
    allowedHosts: [
      '.app.github.dev',
      '.codespaces.app',
      '.github.dev',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // Keep path as-is
        configure: (proxy, options) => {
          console.log('🔗 API proxy active: /api -> http://localhost:5000');
          proxy.on('error', (err, req, res) => {
            console.error('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔀 Proxying request:', req.method, req.url, '-> http://localhost:5000' + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📡 Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID)
  }
});
