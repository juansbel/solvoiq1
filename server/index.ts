import express from "express";
import { Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { DrizzleStorage } from "./db";
import { MemStorage } from "./storage";
import { wsManager, startPerformanceMonitoring } from "./websocket";
import { config } from "./config";
import logger from "./logger";
import { middleware } from "./middleware";
import healthRouter from "./health";
import cors from "cors";
import * as functions from 'firebase-functions';

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
let server: Server;

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
const api = functions.https.onRequest(async (req, res) => {
  if (!server) {
    server = new Server();
    const wsManager = new WebSocketManager(server);
    
    // Setup middleware
    middleware(app);
    
    // Setup routes
    registerRoutes(app);
    
    // Setup Vite in development
    if (process.env.NODE_ENV === 'development') {
      const vite = await createDevServer();
      app.use(vite.middlewares);
    }
    
    // Attach Express to the server
    server.on('request', app);
  }
  
  // Handle the request
  app(req, res);
});

// Only start the server directly if not running in Firebase Functions
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_TARGET) {
  const PORT = process.env.PORT || 3001;
  server = new Server();
  const wsManager = new WebSocketManager(server);
  
  middleware(app);
  registerRoutes(app);
  
  if (process.env.NODE_ENV === 'development') {
    createDevServer().then(vite => {
      app.use(vite.middlewares);
      server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    });
  } else {
    serveStatic(app);
    // Add catch-all route for client-side routing
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist/public" });
    });
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  }
}

// Error handling middleware (should be last)
app.use(middleware.error);

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

// Export the Express app for Vercel
export default app;
