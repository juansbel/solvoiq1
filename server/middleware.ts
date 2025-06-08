import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import logger from './logger';
import { stream } from './logger';

// CORS configuration
export const corsMiddleware = cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Request logging
export const requestLogger = morgan('combined', { stream });

// Performance monitoring middleware
export const performanceMonitor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    logger.debug('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
    });
  });

  next();
};

// Error handling middleware
export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: config.env === 'development' ? err.message : 'Something went wrong',
  });
};

// Security middleware
export const securityMiddleware = [
  helmet(),
  corsMiddleware,
  rateLimiter,
];

// Performance middleware
export const performanceMiddleware = [
  compression(),
  requestLogger,
  performanceMonitor,
];

// Export all middleware
export const middleware = {
  security: securityMiddleware,
  performance: performanceMiddleware,
  error: errorHandler,
}; 