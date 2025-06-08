import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket, useRealTimeNotifications } from '@/hooks/use-websocket';
import { useFloatingNotifications } from '@/components/ui/floating-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Users, 
  CheckSquare, 
  AlertCircle,
  Trash2
} from 'lucide-react';

interface LiveUpdatesProps {
  onDataUpdate?: (type: string, data: any) => void;
  showNotifications?: boolean;
  autoReconnect?: boolean;
}

export function LiveUpdates({ 
  onDataUpdate, 
  showNotifications = true,
  autoReconnect = true 
}: LiveUpdatesProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const floatingNotifications = useFloatingNotifications();

  const handleMessage = useCallback((message: any) => {
    if (isPaused) return;

    setUpdateCount(prev => prev + 1);
    setLastUpdateTime(new Date());
    
    onDataUpdate?.(message.type, message.data);

    if (showNotifications) {
      floatingNotifications.showInfo(
        `${message.type.replace('_', ' ').toUpperCase()}`,
        message.data?.message || 'Data updated',
        { duration: 3000 }
      );
    }
  }, [isPaused, onDataUpdate, showNotifications, floatingNotifications]);

  const { 
    isConnected, 
    connectionState, 
    connect,
    disconnect 
  } = useWebSocket({
    onMessage: handleMessage,
    onConnected: () => {
      floatingNotifications.showSuccess(
        'Connected',
        'Real-time updates enabled',
        { duration: 2000 }
      );
    },
    onDisconnected: () => {
      floatingNotifications.showWarning(
        'Disconnected',
        'Real-time updates paused',
        { duration: 3000 }
      );
    },
    onError: () => {
      floatingNotifications.showError(
        'Connection Error',
        'Failed to establish real-time connection',
        { duration: 5000 }
      );
    }
  });

  const { 
    notifications, 
    clearNotifications,
    markAsRead 
  } = useRealTimeNotifications();

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    floatingNotifications.showInfo(
      isPaused ? 'Resumed' : 'Paused',
      `Real-time updates ${isPaused ? 'enabled' : 'disabled'}`,
      { duration: 2000 }
    );
  }, [isPaused, floatingNotifications]);

  const handleReconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  const resetCounter = useCallback(() => {
    setUpdateCount(0);
    setLastUpdateTime(null);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              Live Updates
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {connectionState}
              </Badge>
              {lastUpdateTime && (
                <Badge variant="outline" className="font-mono text-xs">
                  {lastUpdateTime.toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{updateCount}</div>
              <div className="text-sm text-gray-600">Updates Received</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Notifications</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className={`text-2xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-gray-600">Connection</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className={`text-2xl font-bold ${isPaused ? 'text-yellow-600' : 'text-blue-600'}`}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={!isPaused} 
                  onCheckedChange={() => togglePause()}
                  id="pause-updates"
                />
                <label htmlFor="pause-updates" className="text-sm font-medium">
                  {isPaused ? 'Resume' : 'Pause'} Updates
                </label>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReconnect}
                disabled={isConnected && connectionState === 'connected'}
              >
                Reconnect
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetCounter}
                disabled={updateCount === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Reset
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearNotifications}
                disabled={notifications.length === 0}
              >
                Clear Notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Updates will appear here when data changes</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notification, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    notification.data?.read ? 'opacity-60' : ''
                  }`}
                  onClick={() => markAsRead(notification.timestamp)}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.data?.title || notification.type.replace('_', ' ')}
                      </p>
                      <Badge variant="outline" className="font-mono text-xs ml-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.data?.message || 'Data updated'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LiveUpdateIndicator() {
  const { isConnected } = useWebSocket();
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setUpdateCount(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white border rounded-full shadow-sm">
      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">Live</span>
          <Badge variant="secondary" className="text-xs">
            {updateCount}
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-xs font-medium text-red-700">Offline</span>
        </div>
      )}
    </div>
  );
}