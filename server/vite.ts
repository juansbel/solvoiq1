import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from 'vite';
import type { Server as HttpServer } from 'http';
import type { ServerOptions } from 'vite';
import { createLogger } from "vite";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import type { ViteDevServer } from 'vite';

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

export async function createDevServer() {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100
      }
    },
    appType: 'custom',
    root: path.resolve(process.cwd(), 'client'),
    build: {
      target: 'esnext',
      outDir: 'dist/client'
    }
  });

  return vite;
}

export async function setupVite(app: Express, server: HttpServer) {
  const vite = await createDevServer();

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html",
      );

      // always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "client");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
