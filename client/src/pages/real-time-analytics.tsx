import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
// Temporarily disable advanced charts to fix WebSocket connection
// import { AdvancedCharts } from '@/components/analytics/advanced-charts';
import { useWebSocket, useRealTimeNotifications } from '@/hooks/use-websocket';
import { usePerformanceMonitoring, useCacheOptimization } from '@/hooks/use-performance-optimization';
import { FloatingNotifications, useFloatingNotifications } from '@/components/ui/floating-notifications';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  TrendingUp, 
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Monitor
} from 'lucide-react';
import type { Client, Task, TeamMember, Statistics } from '@/../../shared/schema';

export default function RealTimeAnalytics() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Data queries with real-time updates
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000
  });

  const { data: teamMembers = [], isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000
  });

  const { data: stats } = useQuery<Statistics>({
    queryKey: ['/api/statistics'],
    refetchInterval: autoRefresh ? refreshInterval : false,
    staleTime: 10000
  });

  // Real-time WebSocket connection
  const { isConnected, connectionState, sendMessage } = useWebSocket({
    onMessage: (message) => {
      console.log('Real-time update received:', message);
      floatingNotifications.showInfo(
        'Real-time Update',
        `${message.type.replace('_', ' ')} data refreshed`,
        { duration: 3000 }
      );
    },
    onConnected: () => {
      floatingNotifications.showSuccess(
        'Connected',
        'Real-time updates enabled',
        { duration: 3000 }
      );
    },
    onDisconnected: () => {
      floatingNotifications.showWarning(
        'Disconnected',
        'Real-time updates paused',
        { duration: 5000 }
      );
    }
  });

  // Real-time notifications
  const { notifications: realtimeNotifications } = useRealTimeNotifications();

  // Floating notifications
  const floatingNotifications = useFloatingNotifications();

  // Performance monitoring
  const { metrics, startRenderTimer, endRenderTimer, trackApiCall } = usePerformanceMonitoring();

  // Cache optimization
  const { prefetchData, invalidateMultiple } = useCacheOptimization();

  // Track render performance
  useEffect(() => {
    startRenderTimer();
    return () => endRenderTimer();
  }, [startRenderTimer, endRenderTimer]);

  // Real-time metrics calculation
  const realTimeMetrics = React.useMemo(() => {
    const totalRevenue = clients.reduce((sum, client) => {
      return sum + (client.kpis?.reduce((kpiSum, kpi) => {
        return kpiSum + (typeof kpi.actual === 'number' ? kpi.actual : 0);
      }, 0) || 0);
    }, 0);

    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    const urgentTasks = tasks.filter(task => 
      task.priority === 'high' || task.priority === 'critical'
    ).length;

    const clientHealth = clients.map(client => {
      const kpis = client.kpis || [];
      const metKpis = kpis.filter(kpi => kpi.met).length;
      return kpis.length > 0 ? (metKpis / kpis.length) * 100 : 100;
    });

    const avgClientHealth = clientHealth.length > 0 
      ? clientHealth.reduce((sum, score) => sum + score, 0) / clientHealth.length 
      : 100;

    return {
      totalRevenue,
      completionRate,
      urgentTasks,
      avgClientHealth,
      activeClients: clients.length,
      teamSize: teamMembers.length,
      lastUpdated: new Date().toLocaleTimeString()
    };
  }, [clients, tasks, teamMembers]);

  // Auto-refresh control
  const handleRefreshToggle = (enabled: boolean) => {
    setAutoRefresh(enabled);
    if (enabled) {
      floatingNotifications.showInfo(
        'Auto-refresh Enabled',
        `Updates every ${refreshInterval / 1000} seconds`,
        { duration: 3000 }
      );
    } else {
      floatingNotifications.showInfo(
        'Auto-refresh Disabled',
        'Manual refresh only',
        { duration: 3000 }
      );
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    await invalidateMultiple(['/api/clients', '/api/tasks', '/api/team-members', '/api/statistics']);
    floatingNotifications.showSuccess(
      'Data Refreshed',
      'All data updated successfully',
      { duration: 2000 }
    );
  };

  // Performance alerts
  useEffect(() => {
    if (metrics.renderTime > 100) {
      floatingNotifications.showWarning(
        'Performance Alert',
        `Slow rendering detected: ${metrics.renderTime.toFixed(1)}ms`,
        { duration: 5000 }
      );
    }

    if (metrics.memoryUsage && metrics.memoryUsage > 80) {
      floatingNotifications.showWarning(
        'Memory Usage High',
        `${metrics.memoryUsage.toFixed(1)}% memory used`,
        { duration: 7000 }
      );
    }
  }, [metrics, floatingNotifications]);

  const isLoading = clientsLoading || tasksLoading || teamLoading;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <FloatingNotifications 
        notifications={floatingNotifications.notifications}
        onDismiss={floatingNotifications.dismissNotification}
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Real-time Controls */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Real-Time Analytics
            </h1>
            <p className="text-slate-600 dark:text-gray-300 mt-1">
              Live business intelligence and performance monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Live</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>

            {/* Auto-refresh Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Auto-refresh</span>
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={handleRefreshToggle}
              />
            </div>

            {/* Manual Refresh */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* Last Updated */}
            <Badge variant="secondary" className="font-mono">
              {realTimeMetrics.lastUpdated}
            </Badge>
          </div>
        </header>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Live Revenue</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    ${realTimeMetrics.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Real-time</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-200 dark:bg-blue-700 rounded-full">
                  <Activity className="h-8 w-8 text-blue-700 dark:text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">Task Completion</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {realTimeMetrics.completionRate.toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {tasks.filter(t => t.status === 'completed').length} of {tasks.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-200 dark:bg-green-700 rounded-full">
                  <BarChart3 className="h-8 w-8 text-green-700 dark:text-green-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Urgent Tasks</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {realTimeMetrics.urgentTasks}
                  </p>
                  <div className="flex items-center mt-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">Needs attention</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-200 dark:bg-orange-700 rounded-full">
                  <Clock className="h-8 w-8 text-orange-700 dark:text-orange-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Client Health</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {realTimeMetrics.avgClientHealth.toFixed(1)}%
                  </p>
                  <div className="flex items-center mt-2">
                    <Users className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">
                      {realTimeMetrics.activeClients} clients
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-200 dark:bg-purple-700 rounded-full">
                  <PieChart className="h-8 w-8 text-purple-700 dark:text-purple-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Monitor */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-semibold">Render Time</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.renderTime.toFixed(1)}ms
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">API Calls</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.apiCallCount}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.cacheHitRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Monitor className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold">Memory Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.memoryUsage?.toFixed(1) || 'N/A'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Analytics Charts - Temporarily disabled */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              Advanced charts available after WebSocket connection is established
            </p>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
              <Badge variant="secondary" className="ml-2">
                {realtimeNotifications.length} updates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {realtimeNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No real-time updates yet</p>
                <p className="text-sm">Updates will appear here when data changes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {realtimeNotifications.slice(0, 10).map((notification, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium">{notification.data?.title || notification.type}</p>
                      <p className="text-sm text-gray-600">{notification.data?.message}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}