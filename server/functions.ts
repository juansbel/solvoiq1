import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import { Server } from 'http';
import { WebSocketManager } from './websocket';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { createDevServer } from './vite';

const app = express();
let server: Server;

// Initialize Firebase Functions
export const api = functions.https.onRequest(async (req, res) => {
  if (!server) {
    server = new Server();
    const wsManager = new WebSocketManager(server);
    
    // Setup middleware
    setupMiddleware(app);
    
    // Setup routes
    setupRoutes(app);
    
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