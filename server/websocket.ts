import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './index';
import { log } from './vite';

interface WebSocketMessage {
  type: 'task_update' | 'client_update' | 'team_update' | 'notification' | 'performance';
  data: any;
  timestamp: number;
}

interface PerformanceMetrics {
  timestamp: number;
  cpu: number;
  memory: number;
  activeConnections: number;
  responseTime: number;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 100;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws) => {
      log('New WebSocket connection established');
      
      // Send initial metrics
      this.sendMetrics(ws);
      
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
      
      ws.on('close', () => {
        log('WebSocket connection closed');
      });
    });
    
    log('WebSocket server initialized');
  }

  private sendMetrics(ws: any) {
    const metrics = this.getCurrentMetrics();
    try {
      ws.send(JSON.stringify(metrics));
    } catch (error) {
      console.error('Error sending metrics:', error);
    }
  }

  private getCurrentMetrics(): PerformanceMetrics {
    const metrics = {
      timestamp: Date.now(),
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      memory: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
      activeConnections: this.wss?.clients.size || 0,
      responseTime: this.calculateAverageResponseTime()
    };
    
    this.metrics.push(metrics);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
    
    return metrics;
  }

  private calculateAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.responseTime, 0);
    return sum / this.metrics.length;
  }

  private handleClientMessage(ws: WebSocket, message: any) {
    // Handle different types of client messages
    switch (message.type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'notification',
          data: { title: 'Pong', message: 'Connection active' },
          timestamp: Date.now()
        });
        break;
      
      case 'subscribe':
        // Handle subscription to specific data types
        console.log('Client subscribed to:', message.data);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: WebSocketMessage) {
    if (!this.wss) return;
    
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (error) {
          console.error('Error broadcasting message:', error);
        }
      }
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