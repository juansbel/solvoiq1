import { useEffect, useRef, useState, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: 'task_update' | 'client_update' | 'team_update' | 'notification';
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = `ws://${window.location.host}/api/ws`,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onConnected,
    onDisconnected,
    onError
  } = options;

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const connect = useCallback(() => {
    try {
      setConnectionState('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttempts.current = 0;
        onConnected?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Auto-invalidate React Query cache based on message type
          switch (message.type) {
            case 'task_update':
              queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
              break;
            case 'client_update':
              queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
              break;
            case 'team_update':
              queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
              break;
          }
          
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        onDisconnected?.();
        
        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeout.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
      };

    } catch (error) {
      setConnectionState('error');
      console.error('WebSocket connection failed:', error);
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onMessage, onConnected, onDisconnected, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    connect,
    disconnect
  };
}

// Real-time notification hook
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'notification') {
      setNotifications(prev => [message, ...prev.slice(0, 49)]); // Keep last 50
    }
  }, []);

  const { isConnected, connectionState, sendMessage } = useWebSocket({
    onMessage: handleMessage
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((timestamp: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.timestamp === timestamp 
          ? { ...notif, data: { ...notif.data, read: true }}
          : notif
      )
    );
  }, []);

  return {
    notifications,
    isConnected,
    connectionState,
    clearNotifications,
    markAsRead,
    sendMessage
  };
}