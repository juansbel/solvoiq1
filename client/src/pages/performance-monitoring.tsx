import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  Cpu,
  Database,
  Globe,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Monitor,
  Wifi,
  HardDrive
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  threshold: number;
  history: number[];
}

interface PerformanceAlert {
  id: string;
  type: "performance" | "security" | "system" | "user";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  resolved: boolean;
  affectedComponent: string;
}

export default function PerformanceMonitoring() {
  const [realTimeData, setRealTimeData] = useState<SystemMetric[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");

  // Simulate real-time system metrics
  useEffect(() => {
    const generateMetrics = (): SystemMetric[] => [
      {
        name: "CPU Usage",
        value: Math.random() * 40 + 30, // 30-70%
        unit: "%",
        status: "healthy",
        trend: "stable",
        threshold: 80,
        history: Array.from({ length: 20 }, () => Math.random() * 40 + 30)
      },
      {
        name: "Memory Usage",
        value: Math.random() * 30 + 45, // 45-75%
        unit: "%",
        status: "healthy",
        trend: "up",
        threshold: 85,
        history: Array.from({ length: 20 }, () => Math.random() * 30 + 45)
      },
      {
        name: "Response Time",
        value: Math.random() * 50 + 150, // 150-200ms
        unit: "ms",
        status: "healthy",
        trend: "down",
        threshold: 500,
        history: Array.from({ length: 20 }, () => Math.random() * 50 + 150)
      },
      {
        name: "Database Connections",
        value: Math.floor(Math.random() * 20 + 15), // 15-35
        unit: "active",
        status: "healthy",
        trend: "stable",
        threshold: 100,
        history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 20 + 15))
      },
      {
        name: "API Requests/min",
        value: Math.floor(Math.random() * 500 + 800), // 800-1300
        unit: "req/min",
        status: "healthy",
        trend: "up",
        threshold: 2000,
        history: Array.from({ length: 20 }, () => Math.floor(Math.random() * 500 + 800))
      },
      {
        name: "Error Rate",
        value: Math.random() * 0.5, // 0-0.5%
        unit: "%",
        status: "healthy",
        trend: "down",
        threshold: 5,
        history: Array.from({ length: 20 }, () => Math.random() * 0.5)
      }
    ];

    const updateMetrics = () => {
      if (isLive) {
        setRealTimeData(generateMetrics());
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const performanceAlerts: PerformanceAlert[] = [
    {
      id: "1",
      type: "performance",
      severity: "medium",
      message: "Response time increased by 15% in the last 5 minutes",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      resolved: false,
      affectedComponent: "API Gateway"
    },
    {
      id: "2",
      type: "system",
      severity: "low",
      message: "Disk usage reached 75% on production server",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resolved: false,
      affectedComponent: "Database Server"
    },
    {
      id: "3",
      type: "security",
      severity: "high",
      message: "Unusual login patterns detected from IP range 192.168.1.x",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resolved: true,
      affectedComponent: "Authentication Service"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "warning":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "critical":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "high":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
      case "critical":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "cpu usage":
        return <Cpu className="h-5 w-5" />;
      case "memory usage":
        return <HardDrive className="h-5 w-5" />;
      case "response time":
        return <Clock className="h-5 w-5" />;
      case "database connections":
        return <Database className="h-5 w-5" />;
      case "api requests/min":
        return <Globe className="h-5 w-5" />;
      case "error rate":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Performance Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Real-time system performance and health monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLive ? 'Live' : 'Paused'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realTimeData.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      {getMetricIcon(metric.name)}
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {metric.name}
                    </CardTitle>
                  </div>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value.toFixed(metric.name === "Error Rate" ? 2 : 0)}{metric.unit}
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Threshold</span>
                    <span className="font-medium">{metric.threshold}{metric.unit}</span>
                  </div>
                  <Progress 
                    value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                    className="h-2"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Monitoring */}
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Server Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {realTimeData[0]?.value.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={realTimeData[0]?.value || 0} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {realTimeData[1]?.value.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={realTimeData[1]?.value || 0} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disk I/O</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Normal</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Network & API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {realTimeData[4]?.value.toFixed(0) || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Requests/min</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {realTimeData[2]?.value.toFixed(0) || 0}ms
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {realTimeData[5]?.value.toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={realTimeData[5]?.value || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {alert.affectedComponent}
                            </span>
                            {alert.resolved ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 mb-2">
                            {alert.message}
                          </p>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {alert.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!alert.resolved && (
                            <Button variant="outline" size="sm">
                              Resolve
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 font-mono text-sm">
                  {[
                    { time: "10:12:34", level: "INFO", message: "API request completed successfully - /api/clients" },
                    { time: "10:12:33", level: "INFO", message: "Database query executed in 45ms" },
                    { time: "10:12:32", level: "WARN", message: "High memory usage detected: 78%" },
                    { time: "10:12:30", level: "INFO", message: "User authentication successful" },
                    { time: "10:12:28", level: "ERROR", message: "Failed to connect to external service" },
                    { time: "10:12:25", level: "INFO", message: "Background task completed" }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <span className="text-gray-500 dark:text-gray-400 w-20">
                        {log.time}
                      </span>
                      <Badge 
                        variant={log.level === "ERROR" ? "destructive" : 
                                log.level === "WARN" ? "secondary" : "default"}
                        className="w-16 justify-center"
                      >
                        {log.level}
                      </Badge>
                      <span className="text-gray-800 dark:text-gray-200">
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Database Query Optimization",
                        impact: "High",
                        description: "Optimize slow queries to reduce response time by 25%",
                        savings: "~200ms avg response time reduction"
                      },
                      {
                        title: "Caching Implementation",
                        impact: "Medium",
                        description: "Implement Redis caching for frequently accessed data",
                        savings: "~40% reduction in database load"
                      },
                      {
                        title: "Image Compression",
                        impact: "Medium",
                        description: "Compress static assets to reduce bandwidth usage",
                        savings: "~30% bandwidth reduction"
                      }
                    ].map((rec, index) => (
                      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{rec.title}</h3>
                              <Badge variant={rec.impact === "High" ? "destructive" : "secondary"}>
                                {rec.impact} Impact
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {rec.description}
                            </p>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Expected: {rec.savings}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Apply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Health Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { check: "Database Connection", status: "healthy", details: "All connections stable" },
                      { check: "API Endpoints", status: "healthy", details: "All endpoints responding" },
                      { check: "External Services", status: "warning", details: "1 service experiencing delays" },
                      { check: "Security Scan", status: "healthy", details: "No vulnerabilities detected" },
                      { check: "Backup Status", status: "healthy", details: "Last backup: 2 hours ago" },
                      { check: "SSL Certificate", status: "healthy", details: "Valid until 2024-12-01" }
                    ].map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          {check.status === "healthy" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <div className="font-medium">{check.check}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {check.details}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}