import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: [
      '.app.github.dev',
      '.codespaces.app',
      '.github.dev',
      'fuzzy-xylophone-5g97jqp4vq9wf4jjr-3000.app.github.dev'
    ] as string[],
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
  // Explicitly ensure Vite root points at the client directory when running in middleware mode.
  // This mirrors the root setting in the base config but we reassert it here since we spread viteConfig
  // and then override configFile (which can sometimes skip certain path normalizations in edge cases).
  root: path.resolve(__dirname, "..", "client"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        console.error('Vite error (non-fatal):', msg);
        // Don't exit on Vite errors - just log them
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes - let them be handled by the API middleware
    if (url.startsWith('/api/')) {
      return next();
    }

    // If the request looks like a direct module/asset request (has an extension that isn't .html)
    // let Vite's middleware (or static serving) handle it instead of forcing index.html.
    if (/\.[a-zA-Z0-9]+($|\?)/.test(url) && !url.endsWith('.html')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // Server-side lightweight prefetch for /discover (non-blocking if it fails)
      if (url.startsWith('/discover')) {
        try {
          const qc = new QueryClient();
          // Prefetch discover data from internal API
            await qc.prefetchQuery({ queryKey: ['discover'], queryFn: async () => {
              const res = await fetch(`http://localhost:${process.env.PORT || 5000}/api/discover`);
              if (!res.ok) throw new Error('prefetch failed');
              return res.json();
            }});
          const dehydrated = JSON.stringify(dehydrate(qc));
          template = template.replace('</head>', `<script>window.__RQ__=${dehydrated}</script></head>`);
        } catch (e) {
          console.warn('⚠️ Discover prefetch failed:', (e as Error).message);
        }
      }

      // Let Vite handle script injection and CSS processing - don't manually modify
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist, but skip API routes
  app.use("*", (req, res, next) => {
    // Skip API routes - let them be handled by the API middleware
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
