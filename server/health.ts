import { Router } from "express";
import { IStorage } from "./storage";
import { MemStorage } from "./storage";
import { DrizzleStorage } from "./db";
import logger from './logger';
import { getCacheStats } from './cache';

const router = Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabase();
    
    // Get cache stats
    const cacheStats = getCacheStats();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    // Get uptime
    const uptime = process.uptime();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      database: dbStatus,
      cache: cacheStats,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      },
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Database health check
async function checkDatabase() {
  try {
    if (storage instanceof DrizzleStorage) {
      const isConnected = await storage.checkConnection();
      return {
        status: isConnected ? 'ok' : 'error',
        message: isConnected ? 'Connected' : 'Not connected',
      };
    }
    return {
      status: 'ok',
      message: 'Using in-memory storage',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function setupHealthCheck(storage: IStorage) {
  router.get("/health", async (req, res) => {
    try {
      const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          database: "ok",
          storage: "ok"
        }
      };

      // Check database connection if using DrizzleStorage
      if (storage instanceof DrizzleStorage) {
        try {
          await storage.checkConnection();
        } catch (error) {
          health.services.database = "error";
          health.status = "error";
        }
      }

      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return router;
}

export default router; 