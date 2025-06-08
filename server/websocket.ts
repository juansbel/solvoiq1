import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './index';

interface WebSocketMessage {
  type: 'task_update' | 'client_update' | 'team_update' | 'notification';
  data: any;
  timestamp: number;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/api/ws'  // Use dedicated path to avoid conflicts with Vite
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'notification',
        data: {
          title: 'Connected',
          message: 'Real-time updates enabled'
        },
        timestamp: Date.now()
      });

      // Handle client messages
      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(ws, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log('WebSocket server initialized');
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
    const messageString = JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      } else {
        // Remove dead connections
        this.clients.delete(client);
      }
    });

    console.log(`Broadcasted ${message.type} to ${this.clients.size} clients`);
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
    this.clients.forEach(client => {
      client.close();
    });
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsManager = new WebSocketManager();

// Monitoring function to track performance and send alerts
export function startPerformanceMonitoring() {
  setInterval(async () => {
    try {
      // Get current statistics
      const stats = await storage.getStatistics();
      const clients = await storage.getClients();
      const tasks = await storage.getTasks();
      const teamMembers = await storage.getTeamMembers();

      // Calculate metrics
      const completionRate = stats.tasksCreated && stats.tasksCreated > 0 && stats.tasksCompleted !== null
        ? (stats.tasksCompleted / stats.tasksCreated) * 100 : 0;
      const totalRevenue = clients.reduce((sum, client) => {
        return sum + (client.kpis?.reduce((kpiSum, kpi) => {
          return kpiSum + (typeof kpi.actual === 'number' ? kpi.actual : 0);
        }, 0) || 0);
      }, 0);

      const urgentTasks = tasks.filter(task => 
        task.priority === 'high' || task.priority === 'critical'
      ).length;

      const clientHealthScores = clients.map(client => {
        const kpis = client.kpis || [];
        const metKpis = kpis.filter(kpi => kpi.met).length;
        return kpis.length > 0 ? (metKpis / kpis.length) * 100 : 100;
      });

      const avgClientHealth = clientHealthScores.length > 0 
        ? clientHealthScores.reduce((sum, score) => sum + score, 0) / clientHealthScores.length 
        : 100;

      // Send alerts based on thresholds
      if (completionRate < 70 && stats.tasksCreated && stats.tasksCreated > 0) {
        wsManager.sendBusinessAlert('task_completion', {
          message: `Task completion rate is ${completionRate.toFixed(1)}% - below target threshold`,
          metrics: { completionRate, totalTasks: tasks.length }
        });
      }

      if (urgentTasks > 3) {
        wsManager.sendBusinessAlert('task_completion', {
          message: `${urgentTasks} urgent tasks require immediate attention`,
          metrics: { urgentTasks, totalTasks: tasks.length }
        });
      }

      if (avgClientHealth < 75 && clients.length > 0) {
        wsManager.sendBusinessAlert('client_health', {
          message: `Average client health is ${avgClientHealth.toFixed(1)}% - review needed`,
          metrics: { avgClientHealth, totalClients: clients.length }
        });
      }

      if (totalRevenue > 50000) {
        wsManager.sendBusinessAlert('revenue', {
          message: `Revenue milestone reached: $${totalRevenue.toLocaleString()}`,
          metrics: { totalRevenue, clientCount: clients.length }
        });
      }

    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  }, 30000); // Check every 30 seconds
}