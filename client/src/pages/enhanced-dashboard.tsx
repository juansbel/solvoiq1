import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useEffect, useState } from "react";
import type { Client, TeamMember, Task, Statistics } from "@/../../shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NotificationCenter } from "@/components/notification-center";
import { FloatingNotifications, useFloatingNotifications } from "@/components/ui/floating-notifications";
import { useMobile } from "@/hooks/use-mobile";
import { 
  Users, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  DollarSign,
  Clock,
  Brain,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Mail,
  Phone,
  Activity,
  PieChart,
  BarChart3,
  Eye,
  ExternalLink,
  Briefcase,
  Star,
  Award,
  Send,
  PlusCircle,
  Bell,
  X
} from "lucide-react";
import { PredictiveAnalytics } from "@/components/dashboard/predictive-analytics";
import { CrossPageInsights } from "@/components/shared/cross-page-insights";
import { DataSyncIndicator } from "@/components/shared/data-sync-indicator";
import { useDataIntegration } from "@/contexts/DataIntegrationContext";
import { useRealTimeSync } from "@/hooks/use-real-time-sync";
import { usePerformanceOptimization } from '@/hooks/use-performance-optimization';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  targetPage: string;
}

interface ClientAlert {
  id: number;
  clientName: string;
  type: "churn_risk" | "opportunity" | "overdue" | "high_value";
  message: string;
  urgency: "high" | "medium" | "low";
  daysAgo: number;
}

interface TeamMetric {
  id: number;
  name: string;
  avatar: string;
  role: string;
  tasksCompleted: number;
  clientSatisfaction: number;
  responseTime: string;
  revenue: number;
  efficiency: number;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "analytics",
    title: "View Analytics",
    description: "Executive insights & predictive analytics",
    icon: BarChart3,
    color: "bg-blue-500",
    targetPage: "analytics"
  },
  {
    id: "automation",
    title: "AI Automation",
    description: "Configure smart workflows",
    icon: Brain,
    color: "bg-purple-500",
    targetPage: "automation"
  },
  {
    id: "commission",
    title: "Commission Tracking",
    description: "Monitor KPIs & performance",
    icon: DollarSign,
    color: "bg-green-500",
    targetPage: "commission"
  },
  {
    id: "new-client",
    title: "Add Client",
    description: "Onboard new client",
    icon: PlusCircle,
    color: "bg-orange-500",
    targetPage: "clients"
  }
];

const CLIENT_ALERTS: ClientAlert[] = [
  {
    id: 1,
    clientName: "TechCorp Industries",
    type: "churn_risk",
    message: "40% decrease in engagement, delayed responses",
    urgency: "high",
    daysAgo: 3
  },
  {
    id: 2,
    clientName: "StartupXYZ",
    type: "opportunity",
    message: "85% probability for premium upgrade",
    urgency: "medium", 
    daysAgo: 1
  },
  {
    id: 3,
    clientName: "Global Solutions",
    type: "overdue",
    message: "Invoice #1234 overdue by 15 days",
    urgency: "high",
    daysAgo: 15
  },
  {
    id: 4,
    clientName: "Innovation Labs",
    type: "high_value",
    message: "Contract renewal approaching in 30 days",
    urgency: "medium",
    daysAgo: 0
  }
];

const TEAM_METRICS: TeamMetric[] = [
  {
    id: 1,
    name: "Alice Wilson",
    avatar: "AW",
    role: "Senior Account Manager",
    tasksCompleted: 47,
    clientSatisfaction: 4.8,
    responseTime: "1.2h",
    revenue: 245000,
    efficiency: 92
  },
  {
    id: 2,
    name: "Bob Johnson", 
    avatar: "BJ",
    role: "Client Success Manager",
    tasksCompleted: 43,
    clientSatisfaction: 4.6,
    responseTime: "2.1h", 
    revenue: 198000,
    efficiency: 88
  },
  {
    id: 3,
    name: "Carol Davis",
    avatar: "CD",
    role: "Business Development",
    tasksCompleted: 39,
    clientSatisfaction: 4.7,
    responseTime: "1.8h",
    revenue: 156000,
    efficiency: 85
  }
];

const REVENUE_TREND = [
  { month: "Jan", value: 180000, target: 200000 },
  { month: "Feb", value: 195000, target: 210000 },
  { month: "Mar", value: 210000, target: 220000 },
  { month: "Apr", value: 225000, target: 230000 }
];

const EnhancedDashboard: React.FC = () => {
  const { clients, teamMembers, tasks, clientActivity, isLoading, error, forceSync, lastSync } = useDataIntegration();
  const { connectionState, latestData, sendMessage } = useRealTimeSync();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const { getClientHealth, getTeamEfficiency, getRevenueTrend, getTaskDistribution } = usePerformanceOptimization();

  const { isMobile, isTablet } = useMobile();
  
  // Set page title
  useEffect(() => {
    document.title = "Dashboard - ClientHub AI";
  }, []);

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    staleTime: 30000,
    retry: 3,
  });

  const floatingNotifications = useFloatingNotifications();

  // Combined loading state
  const combinedLoading = statsLoading || isLoading;
  const hasError = statsError || error;

  // Early return for loading states
  if (combinedLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Early return for error states
  if (hasError) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">⚠️</div>
              <p className="text-gray-600 dark:text-gray-300">Unable to load dashboard data</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Memoized calculations for performance - now using real user data
  const dashboardMetrics = useMemo(() => {
    // Calculate real task completion rate from user data
    const completionRate = stats?.tasksCreated && stats.tasksCreated > 0 && stats.tasksCompleted !== null
      ? Math.round((stats.tasksCompleted / stats.tasksCreated) * 100) 
      : 0;

    // Calculate real client metrics
    const activeClients = clients?.length || 0;
    const clientsWithKPIs = clients?.filter(client => client.kpis && client.kpis.length > 0).length || 0;
    
    // Calculate team productivity metrics
    const teamSize = teamMembers?.length || 0;
    const tasksPerTeamMember = teamSize > 0 ? Math.round((tasks?.length || 0) / teamSize) : 0;
    
    // Calculate real revenue from client KPIs
    const totalRevenue = clients?.reduce((sum, client) => {
      const clientRevenue = client.kpis?.reduce((kpiSum, kpi) => {
        return kpiSum + (typeof kpi.actual === 'number' ? kpi.actual : 0);
      }, 0) || 0;
      return sum + clientRevenue;
    }, 0) || 0;

    // Calculate client health scores
    const clientHealthScores = clients?.map(client => {
      const kpis = client.kpis || [];
      const metKpis = kpis.filter(kpi => kpi.met).length;
      return kpis.length > 0 ? (metKpis / kpis.length) * 100 : 100;
    }) || [];
    
    const avgClientHealth = clientHealthScores.length > 0 
      ? clientHealthScores.reduce((sum, score) => sum + score, 0) / clientHealthScores.length 
      : 100;

    // Calculate task urgency metrics
    const urgentTasks = tasks?.filter(task => 
      task.priority === 'high' || task.priority === 'critical'
    ).length || 0;

    const overdueTasks = tasks?.filter(task => 
      task.suggestedDueDate && 
      new Date(task.suggestedDueDate) < new Date() &&
      task.status !== 'completed'
    ).length || 0;

    // Calculate communication volume
    const totalCommunications = stats?.communicationsSent || 0;

    return {
      completionRate,
      activeClients,
      clientsWithKPIs,
      teamSize,
      tasksPerTeamMember,
      totalRevenue,
      avgClientHealth,
      urgentTasks,
      overdueTasks,
      totalCommunications,
      recentTasks: tasks?.slice(0, 5) || []
    };
  }, [stats, tasks, clients, teamMembers]);

  // Real-time business intelligence alerts
  useEffect(() => {
    if (stats && clients && tasks) {
      const { 
        completionRate, 
        overdueTasks, 
        urgentTasks, 
        avgClientHealth,
        totalRevenue,
        tasksPerTeamMember 
      } = dashboardMetrics;
      
      // Check for low task completion rate
      if (completionRate < 70 && stats?.tasksCreated && stats.tasksCreated > 0) {
        floatingNotifications.showWarning(
          "Task Completion Alert",
          `Current completion rate is ${completionRate}% - below target threshold`,
          {
            actionLabel: "Review Tasks",
            onAction: () => onTabChange?.("tasks"),
            duration: 8000
          }
        );
      }

      // Check for high revenue achievement
      if (totalRevenue > 50000) {
        floatingNotifications.showRevenue(
          "Revenue Milestone",
          `Total tracked revenue: $${totalRevenue.toLocaleString()}`,
          {
            actionLabel: "View Analytics",
            onAction: () => onTabChange?.("analytics"),
            duration: 6000
          }
        );
      }

      // Check for overdue tasks
      if (overdueTasks > 0) {
        floatingNotifications.showWarning(
          "Overdue Tasks",
          `${overdueTasks} tasks are overdue and require attention`,
          {
            actionLabel: "Review Tasks",
            onAction: () => onTabChange?.("tasks"),
            duration: 7000
          }
        );
      }

      // Check for urgent tasks
      if (urgentTasks > 2) {
        floatingNotifications.showWarning(
          "High Priority Tasks",
          `${urgentTasks} urgent tasks need immediate attention`,
          {
            actionLabel: "View Urgent",
            onAction: () => onTabChange?.("tasks"),
            duration: 6000
          }
        );
      }

      // Check for low client health
      if (avgClientHealth < 75 && clients.length > 0) {
        floatingNotifications.showClient(
          "Client Health Alert",
          `Average client health is ${Math.round(avgClientHealth)}% - review KPIs`,
          {
            actionLabel: "View Clients",
            onAction: () => onTabChange?.("clients"),
            duration: 8000
          }
        );
      }
    }
  }, [stats, clients, tasks, dashboardMetrics, floatingNotifications, onTabChange]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "churn_risk": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "opportunity": return <Target className="h-4 w-4 text-green-500" />;
      case "overdue": return <Clock className="h-4 w-4 text-orange-500" />;
      case "high_value": return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const teamEfficiencyData = getTeamEfficiency();
  const revenueTrendData = getRevenueTrend();
  const taskDistributionData = getTaskDistribution();

  const memoizedClientHealth = useMemo(() => {
    return (clientId: number) => getClientHealth(clientId);
  }, [getClientHealth]);

  const activeClients = clients.filter(c => c.status === 'Active');
  const recentActivities = clientActivity.slice(0, 5);

  useEffect(() => {
    // Example of a side effect after data fetching
    console.log("Dashboard data loaded:", { clients, teamMembers, tasks });
  }, [clients, teamMembers, tasks]);

  const TEAM_METRICS = [
    { name: 'Active Projects', value: '12', change: '+5%', changeType: 'increase' },
    { name: 'Avg. Task Completion', value: '3.5 days', change: '-0.2 days', changeType: 'decrease' },
  ];

  const REVENUE_TREND = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
    { name: 'Jul', revenue: 6500 },
    { name: 'Aug', revenue: 7000 },
    { name: 'Sep', revenue: 6800 },
    { name: 'Oct', revenue: 7200 },
    { name: 'Nov', revenue: 7500 },
    { name: 'Dec', revenue: 5200 },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <FloatingNotifications 
        notifications={floatingNotifications.notifications} 
        onDismiss={floatingNotifications.dismissNotification} 
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header Section - Responsive */}
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              ClientHub AI Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <NotificationCenter onNavigate={onTabChange} />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNotifications(true)}
                size={isMobile ? "sm" : "default"}
                className={isMobile ? "flex-1" : ""}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {!isMobile && "This Month"}
              </Button>
              <Button 
                onClick={() => onTabChange?.("analytics")}
                size={isMobile ? "sm" : "default"}
                className={isMobile ? "flex-1" : ""}
              >
                <Eye className="h-4 w-4 mr-2" />
                {!isMobile && "Analytics"}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators - Responsive */}
        <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-300 truncate">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                    ${dashboardMetrics.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" aria-hidden="true" />
                    <span className="text-sm text-green-600 font-medium">From {dashboardMetrics.clientsWithKPIs} clients</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-blue-200 dark:bg-blue-700 rounded-full flex-shrink-0" aria-hidden="true">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-700 dark:text-blue-200" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={Math.min((dashboardMetrics.totalRevenue / 100000) * 100, 100)} className="h-2" aria-label={`Revenue progress toward $100K goal`} />
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  {Math.min((dashboardMetrics.totalRevenue / 100000) * 100, 100).toFixed(1)}% toward $100K goal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">Active Clients</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{dashboardMetrics.activeClients}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" aria-hidden="true" />
                    <span className="text-sm text-green-600 font-medium">{dashboardMetrics.clientsWithKPIs} with KPIs</span>
                  </div>
                </div>
                <div className="p-3 bg-green-200 dark:bg-green-700 rounded-full" aria-hidden="true">
                  <Users className="h-8 w-8 text-green-700 dark:text-green-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Task Completion</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{dashboardMetrics.completionRate}%</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" aria-hidden="true" />
                    <span className="text-sm text-green-600 font-medium">
                      {dashboardMetrics.completionRate > 85 ? 'Excellent!' : dashboardMetrics.completionRate > 70 ? 'Good progress' : 'Needs attention'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-200 dark:bg-purple-700 rounded-full" aria-hidden="true">
                  <CheckSquare className="h-8 w-8 text-purple-700 dark:text-purple-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Team Performance</p>
                  <p className="text-3xl font-bold text-orange-900">{Math.round(dashboardMetrics.avgClientHealth)}%</p>
                  <div className="flex items-center mt-2">
                    <Zap className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">{dashboardMetrics.tasksPerTeamMember} tasks/member</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <Brain className="h-8 w-8 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Grid */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-3 sm:gap-4 ${
              isMobile ? 'grid-cols-1' : 
              isTablet ? 'grid-cols-2' : 
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onTabChange?.(action.targetPage)}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all touch-optimized"
                >
                  <div className={`p-2 rounded-lg ${action.color} flex-shrink-0`}>
                    <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm sm:text-base truncate">{action.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 truncate">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Client Alerts & Opportunities - Responsive */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Client Intelligence
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "sm" : "default"}
                    onClick={() => onTabChange?.("analytics")}
                    className="self-start sm:self-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isMobile ? "Insights" : "View All Insights"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {CLIENT_ALERTS.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-3 sm:p-4 ${getUrgencyColor(alert.urgency)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h3 className="font-semibold">{alert.clientName}</h3>
                          <p className="text-sm mt-1">{alert.message}</p>
                          <p className="text-xs mt-2 opacity-75">
                            {alert.daysAgo === 0 ? "Today" : `${alert.daysAgo} days ago`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.urgency} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Overview */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Top Performers
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => onTabChange?.("team")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Team
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers?.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-900 dark:text-white">{member.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-400">{member.position || 'Team Member'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-gray-400">
                        <span>📧 {member.email}</span>
                        <span>📍 {member.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Tasks
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => onTabChange?.("tasks")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardMetrics.recentTasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === "completed" ? "bg-green-500" : "bg-orange-500"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{task.name}</p>
                      <p className="text-sm text-slate-600">{task.description}</p>
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Revenue Analytics</h3>
                <p className="text-slate-600 mb-4">Total Revenue Tracked: ${dashboardMetrics.totalRevenue.toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-900">Active Clients</div>
                    <div className="text-2xl font-bold text-blue-700">{dashboardMetrics.activeClients}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-900">Avg Health</div>
                    <div className="text-2xl font-bold text-green-700">{Math.round(dashboardMetrics.avgClientHealth)}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EnhancedDashboard;