import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
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
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // CRITICAL: Make sure Vite doesn't capture API routes
  // Add a middleware to exclude /api routes before applying Vite middlewares
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`👉 API request detected, bypassing Vite: ${req.method} ${req.path}`);
      return next();
    }
    // For non-API routes, continue to Vite middleware
    vite.middlewares(req, res, next);
  });

  // Fallback route handler for HTML5 history
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Double-check: Skip API routes - let them be handled by the API middleware
    if (url.startsWith('/api/')) {
      console.log(`👉 API request in fallback handler: ${req.method} ${url}`);
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
