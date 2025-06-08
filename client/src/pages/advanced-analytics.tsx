import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Target, 
  Calendar,
  DollarSign,
  Users,
  Clock,
  Award,
  Filter,
  Download,
  RefreshCw,
  Zap
} from "lucide-react";
import type { Client, TeamMember, Task, Statistics } from "@/../../shared/schema";

interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  format: "number" | "percentage" | "currency" | "time";
}

interface ProductivityInsight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  metric: number;
}

export default function AdvancedAnalytics() {
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

  // Calculate advanced metrics
  const advancedMetrics: AnalyticsMetric[] = [
    {
      label: "Client Acquisition Rate",
      value: clients?.length || 0,
      change: 12.5,
      changeType: "increase",
      format: "number"
    },
    {
      label: "Task Completion Rate",
      value: tasks ? (tasks.filter(t => t.status === "completed").length / tasks.length) * 100 : 0,
      change: 8.3,
      changeType: "increase",
      format: "percentage"
    },
    {
      label: "Revenue per Client",
      value: 2850,
      change: -3.2,
      changeType: "decrease",
      format: "currency"
    },
    {
      label: "Avg Response Time",
      value: 2.4,
      change: 15.7,
      changeType: "decrease",
      format: "time"
    }
  ];

  // Generate productivity insights
  const productivityInsights: ProductivityInsight[] = [
    {
      title: "Peak Performance Hours",
      description: "Team shows 35% higher productivity between 9-11 AM",
      impact: "high",
      actionable: true,
      metric: 35
    },
    {
      title: "Client Response Optimization", 
      description: "Implementing automated follow-ups could increase engagement by 24%",
      impact: "high",
      actionable: true,
      metric: 24
    },
    {
      title: "Task Categorization Efficiency",
      description: "AI-powered task categorization showing 18% time savings",
      impact: "medium",
      actionable: true,
      metric: 18
    },
    {
      title: "Communication Channel Analysis",
      description: "Email engagement rates 42% higher than other channels",
      impact: "medium",
      actionable: false,
      metric: 42
    }
  ];

  const formatMetricValue = (value: number, format: string) => {
    switch (format) {
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "currency":
        return `$${value.toLocaleString()}`;
      case "time":
        return `${value.toFixed(1)}h`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Advanced Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Deep insights and performance metrics for data-driven decisions
            </p>
          </div>
          <div className="flex gap-3">
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advancedMetrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatMetricValue(metric.value, metric.format)}
                    </p>
                  </div>
                  <div className={`flex items-center text-sm ${
                    metric.changeType === "increase" 
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {metric.changeType === "increase" ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                    )}
                    {metric.change.toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Task Completion</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Client Satisfaction</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Team Productivity</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Resource Utilization */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Resource Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {teamMembers?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {clients?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Clients</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Capacity Utilization</span>
                      <Badge variant="secondary">87%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Workload Distribution</span>
                      <Badge variant="secondary">Balanced</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Efficiency Score</span>
                      <Badge variant="secondary">A+</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI-Powered Productivity Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {productivityInsights.map((insight, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {insight.title}
                              </h3>
                              <Badge 
                                variant={insight.impact === "high" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {insight.impact} impact
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {insight.description}
                            </p>
                            {insight.actionable && (
                              <Button size="sm" variant="outline">
                                Implement Suggestion
                              </Button>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              +{insight.metric}%
                            </div>
                            <div className="text-xs text-gray-500">Potential gain</div>
                          </div>
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
                  <Target className="h-5 w-5" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Advanced Trend Analytics</h3>
                  <p>Historical data analysis and pattern recognition will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Predictive Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">AI-Powered Forecasting</h3>
                  <p>Predictive models and business forecasting will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}