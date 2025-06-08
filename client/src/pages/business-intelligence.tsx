import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Briefcase,
  Award
} from "lucide-react";
import type { Client, TeamMember, Task, Statistics } from "@/../../shared/schema";

interface BusinessMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: "increase" | "decrease";
  trend: number[];
  format: "currency" | "percentage" | "number" | "time";
  target?: number;
  category: "revenue" | "productivity" | "growth" | "efficiency";
}

interface PerformanceKPI {
  metric: string;
  current: number;
  target: number;
  previous: number;
  unit: string;
  status: "on-track" | "at-risk" | "behind";
}

export default function BusinessIntelligence() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeView, setActiveView] = useState("overview");

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Calculate comprehensive business metrics
  const businessMetrics: BusinessMetric[] = [
    {
      id: "revenue",
      name: "Monthly Revenue",
      value: 125750,
      previousValue: 118200,
      change: 6.4,
      changeType: "increase",
      trend: [98000, 105000, 112000, 118200, 125750],
      format: "currency",
      target: 130000,
      category: "revenue"
    },
    {
      id: "client-acquisition",
      name: "New Clients",
      value: clients?.length || 0,
      previousValue: (clients?.length || 0) - 2,
      change: clients?.length ? ((clients.length - (clients.length - 2)) / (clients.length - 2)) * 100 : 0,
      changeType: "increase",
      trend: [8, 12, 15, (clients?.length || 0) - 2, clients?.length || 0],
      format: "number",
      target: 25,
      category: "growth"
    },
    {
      id: "task-completion",
      name: "Task Completion Rate",
      value: tasks ? (tasks.filter(t => t.status === "completed").length / tasks.length) * 100 : 0,
      previousValue: 82.5,
      change: tasks ? ((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) - 82.5 : 0,
      changeType: "increase",
      trend: [78, 80, 82, 82.5, tasks ? (tasks.filter(t => t.status === "completed").length / tasks.length) * 100 : 0],
      format: "percentage",
      target: 90,
      category: "productivity"
    },
    {
      id: "avg-response-time",
      name: "Avg Response Time",
      value: Number(statistics?.avgResponseTime) || 2.3,
      previousValue: 2.8,
      change: -17.9,
      changeType: "decrease",
      trend: [3.2, 2.9, 2.6, 2.8, Number(statistics?.avgResponseTime) || 2.3],
      format: "time",
      target: 2.0,
      category: "efficiency"
    },
    {
      id: "client-retention",
      name: "Client Retention Rate",
      value: Number(statistics?.clientRetention) || 94.2,
      previousValue: 91.8,
      change: 2.6,
      changeType: "increase",
      trend: [89, 90.5, 91.2, 91.8, Number(statistics?.clientRetention) || 94.2],
      format: "percentage",
      target: 95,
      category: "growth"
    },
    {
      id: "team-utilization",
      name: "Team Utilization",
      value: 87.3,
      previousValue: 84.1,
      change: 3.8,
      changeType: "increase",
      trend: [82, 83.5, 84.8, 84.1, 87.3],
      format: "percentage",
      target: 85,
      category: "productivity"
    }
  ];

  const performanceKPIs: PerformanceKPI[] = [
    {
      metric: "Monthly Revenue Target",
      current: 125750,
      target: 130000,
      previous: 118200,
      unit: "$",
      status: "on-track"
    },
    {
      metric: "Client Satisfaction Score",
      current: 94.2,
      target: 95.0,
      previous: 91.8,
      unit: "%",
      status: "on-track"
    },
    {
      metric: "Project Delivery Time",
      current: 12.3,
      target: 10.0,
      previous: 14.5,
      unit: "days",
      status: "at-risk"
    },
    {
      metric: "Team Productivity Score",
      current: 87.3,
      target: 90.0,
      previous: 84.1,
      unit: "%",
      status: "behind"
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "currency":
        return `$${value.toLocaleString()}`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "time":
        return `${value.toFixed(1)}h`;
      default:
        return value.toString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "at-risk":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "behind":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getCategoryMetrics = (category: string) => {
    if (category === "all") return businessMetrics;
    return businessMetrics.filter(metric => metric.category === category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Business Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive business analytics and performance insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    $125,750
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +6.4% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Clients
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {clients?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +12.5% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {tasks ? ((tasks.filter(t => t.status === "completed").length / tasks.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  +8.3% vs last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Response Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {statistics?.avgResponseTime || 2.3}h
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  -17.9% vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category:
                </span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCategoryMetrics(selectedCategory).map((metric) => (
                  <Card key={metric.id} className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatValue(metric.value, metric.format)}
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          metric.changeType === "increase" 
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {metric.changeType === "increase" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(metric.change).toFixed(1)}%
                        </div>
                      </div>
                      
                      {metric.target && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Target Progress</span>
                            <span className="font-medium">
                              {formatValue(metric.target, metric.format)}
                            </span>
                          </div>
                          <Progress 
                            value={(metric.value / metric.target) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>vs Previous Period</span>
                          <span>{formatValue(metric.previousValue, metric.format)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Key Performance Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceKPIs.map((kpi, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {kpi.metric}
                            </h3>
                            <Badge className={getStatusColor(kpi.status)}>
                              {kpi.status.replace("-", " ")}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {kpi.unit === "$" ? `$${kpi.current.toLocaleString()}` : `${kpi.current}${kpi.unit}`}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Target: {kpi.unit === "$" ? `$${kpi.target.toLocaleString()}` : `${kpi.target}${kpi.unit}`}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress to Target</span>
                            <span className="font-medium">
                              {((kpi.current / kpi.target) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress 
                            value={(kpi.current / kpi.target) * 100} 
                            className={`h-2 ${
                              kpi.status === "on-track" ? "text-green-600" :
                              kpi.status === "at-risk" ? "text-yellow-600" : "text-red-600"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Historical Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Trend Analysis</h3>
                  <p>Interactive charts showing historical performance trends and patterns</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">AI-Powered Forecasting</h3>
                  <p>Machine learning models predicting future business performance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}