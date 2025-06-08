import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './index';
import { log } from './vite';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface PerformanceMetrics {
  activeConnections: number;
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private metrics: PerformanceMetrics = {
    activeConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0
  };

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket) => {
      this.clients.add(ws);
      this.metrics.activeConnections = this.clients.size;

      ws.on("message", (message: string) => {
        this.metrics.messagesReceived++;
        try {
          const data = JSON.parse(message);
          // Handle incoming messages
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
        this.metrics.activeConnections = this.clients.size;
      });
    });
  }

  public broadcast(message: WebSocketMessage) {
    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now()
    };

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(messageWithTimestamp));
        this.metrics.messagesSent++;
      }
    });
  }

  public getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
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
}

export const wsManager = new WebSocketManager();

export function startPerformanceMonitoring() {
  setInterval(() => {
    try {
      const metrics = wsManager.getCurrentMetrics();
      wsManager.broadcast({
        type: 'performance',
        data: metrics
      });
    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }, 5000); // Send metrics every 5 seconds
}