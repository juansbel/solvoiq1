import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { nanoid } from 'nanoid';
import { storage } from './index';
import { log } from './vite';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  uptime: number;
}

export interface IWebSocketManager {
  broadcast(message: WebSocketMessage): void;
  sendPerformanceMetrics(metrics: PerformanceMetrics): void;
  notifyTaskUpdate(taskId: number, action: 'created' | 'updated' | 'deleted'): void;
  notifyClientUpdate(clientId: number, action: 'created' | 'updated' | 'deleted'): void;
  notifyTeamUpdate(memberId: number, action: 'created' | 'updated' | 'deleted'): void;
  sendNotification(title: string, message: string, priority?: 'high' | 'medium' | 'low'): void;
  sendBusinessAlert(type: 'revenue' | 'task_completion' | 'client_health' | 'team_performance', data: any): void;
  getConnectionCount(): number;
  close(): void;
  getCurrentMetrics(): PerformanceMetrics;
}

export class WebSocketManager implements IWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = nanoid();
      this.clients.set(clientId, ws);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  public broadcast(message: WebSocketMessage) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public sendPerformanceMetrics(metrics: PerformanceMetrics) {
    this.broadcast({
      type: 'performance',
      data: metrics,
      timestamp: Date.now()
    });
  }

  // Notify clients about task updates
  notifyTaskUpdate(taskId: number, action: 'created' | 'updated' | 'deleted') {
    this.broadcast({
      type: 'task_update',
      data: {
        taskId,
        action,
        title: 'Task Updated',
        message: `Task ${action} successfully`,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  // Notify clients about client updates
  notifyClientUpdate(clientId: number, action: 'created' | 'updated' | 'deleted') {
    this.broadcast({
      type: 'client_update',
      data: {
        clientId,
        action,
        title: 'Client Updated',
        message: `Client ${action} successfully`,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  // Notify clients about team member updates
  notifyTeamUpdate(memberId: number, action: 'created' | 'updated' | 'deleted') {
    this.broadcast({
      type: 'team_update',
      data: {
        memberId,
        action,
        title: 'Team Updated',
        message: `Team member ${action} successfully`,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  // Send general notifications
  sendNotification(title: string, message: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    this.broadcast({
      type: 'notification',
      data: {
        title,
        message,
        priority,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  // Send business intelligence alerts
  sendBusinessAlert(type: 'revenue' | 'task_completion' | 'client_health' | 'team_performance', data: any) {
    this.broadcast({
      type: 'notification',
      data: {
        title: `Business Alert: ${type.replace('_', ' ')}`,
        message: data.message,
        alertType: type,
        metrics: data.metrics,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  close() {
    if (this.wss) {
      this.wss.close(() => {
        log('WebSocket server closed');
      });
    }
  }

  getCurrentMetrics(): PerformanceMetrics {
    // Implementation of getCurrentMetrics method
    // This is a placeholder and should be implemented based on your actual requirements
    return { cpu: 0, memory: 0, uptime: 0 };
  }
}

let wsManagerInstance: IWebSocketManager = new WebSocketManager(null);

export function initializeWebSocketManager(server?: Server): IWebSocketManager {
  if (server) {
    wsManagerInstance = new WebSocketManager(server);
  } else {
    log('Dummy WebSocketManager initialized');
  }
  return wsManagerInstance;
}

export { wsManagerInstance as wsManager };

export function startPerformanceMonitoring() {
  if (wsManagerInstance instanceof WebSocketManager) {
    log('Starting performance monitoring');
    setInterval(() => {
      try {
        const metrics = wsManagerInstance.getCurrentMetrics();
        wsManagerInstance.sendPerformanceMetrics(metrics);
      } catch (error) {
        log('Performance monitoring error:', error);
      }
    }, 5000);
  } else {
    log('Performance monitoring disabled for dummy WebSocketManager');
  }
}