import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { DrizzleStorage } from "./db";
import { MemStorage } from "./storage";
import { wsManager, startPerformanceMonitoring } from "./websocket";
import { config } from "./config";
import logger from "./logger";
import { middleware } from "./middleware";
import healthRouter from "./health";

// Initialize storage with database
export let storage: DrizzleStorage | MemStorage;

// Use database storage if DATABASE_URL is available, otherwise use in-memory storage
if (config.database.url) {
  storage = new DrizzleStorage(config.database.url);
  logger.info("Using database storage");
} else {
  storage = new MemStorage();
  logger.info("Using in-memory storage (no DATABASE_URL provided)");
}

const app = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(middleware.security);
app.use(middleware.performance);

// Health check routes
app.use('/health', healthRouter);

// Register API routes
const server = createServer(app);
registerRoutes(app);

// Initialize WebSocket server only in development
if (config.env === "development") {
  wsManager.initialize(server);
  startPerformanceMonitoring();
}

// Setup development or production environment
if (config.env === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
  // Add catch-all route for client-side routing
  app.get("*", (req, res) => {
    res.sendFile("index.html", { root: "dist/public" });
  });
}

// Error handling middleware (should be last)
app.use(middleware.error);

// Start server only in development
if (config.env === "development") {
  server.listen(config.port, "127.0.0.1", () => {
    logger.info(`Server running on port ${config.port}`);
  });
}

// Export the Express app for Vercel
export default app;

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  
  // Close database connection if using DrizzleStorage
  if (storage instanceof DrizzleStorage) {
    await storage.shutdown();
  }
  
  // Close WebSocket connections
  wsManager.close();
  
  // Close HTTP server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

// Handle shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
