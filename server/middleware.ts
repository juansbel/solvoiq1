import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import logger from './logger';

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    /^https:\/\/.*\.vercel\.app$/,
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Request logging
const requestLogger = morgan(
  (tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms"
    ].join(" ");
  },
  {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }
);

// Performance monitoring
const performanceMonitor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
};

// Error handling
const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  logger.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'PostgresError') {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while accessing the database'
    });
  }

  // Default error response
  res.status(500).json({
    error: err.message || 'Internal Server Error'
  });
};

// Group middleware by purpose
export const middleware = {
  security: [
    helmet(),
    cors(corsOptions),
    limiter
  ],
  performance: [
    compression(),
    requestLogger,
    performanceMonitor
  ],
  error: errorHandler
}; 