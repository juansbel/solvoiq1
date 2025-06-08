import express from "express";
import { createServer } from "http";
import * as functions from 'firebase-functions';
import cors from "cors";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { DrizzleStorage } from "./db";
import { MemStorage } from "./storage";
import { initializeWebSocketManager, startPerformanceMonitoring, wsManager } from "./websocket";
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

// Configure CORS
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(middleware.security);
app.use(middleware.performance);

// Health check routes
app.use('/health', healthRouter);

// Register API routes
registerRoutes(app);

app.use(middleware.error);

export const api = functions.https.onRequest(app);

if (process.env.NODE_ENV !== 'production') {
  const server = createServer(app);
  const PORT = process.env.PORT || 3001;
  
  initializeWebSocketManager(server);

  const startServer = () => {
    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      startPerformanceMonitoring();
    });
  };

  if (process.env.NODE_ENV === 'development') {
    setupVite(app).then(startServer).catch(err => {
        logger.error("Failed to setup Vite", err);
        process.exit(1);
    });
  } else {
    serveStatic(app);
    startServer();
  }

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
}
