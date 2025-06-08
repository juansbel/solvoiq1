import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Brain,
  Zap,
  MessageSquare
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: any;
  color: string;
  subtitle?: string;
}

interface PredictiveInsight {
  id: string;
  type: "opportunity" | "risk" | "trend";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  timeframe: string;
  actionItems: string[];
}

const EXECUTIVE_METRICS: MetricCard[] = [
  {
    title: "Revenue Pipeline",
    value: "$2.4M",
    change: 15.2,
    changeType: "increase",
    icon: DollarSign,
    color: "text-green-600",
    subtitle: "Q4 Projection"
  },
  {
    title: "Client Retention",
    value: "94.2%",
    change: 2.1,
    changeType: "increase",
    icon: Users,
    color: "text-blue-600",
    subtitle: "30-day average"
  },
  {
    title: "Team Productivity",
    value: "87%",
    change: -3.2,
    changeType: "decrease",
    icon: Target,
    color: "text-orange-600",
    subtitle: "Efficiency Score"
  },
  {
    title: "Response Time",
    value: "2.3h",
    change: 12.5,
    changeType: "decrease",
    icon: Clock,
    color: "text-purple-600",
    subtitle: "Average"
  }
];

const PREDICTIVE_INSIGHTS: PredictiveInsight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Upselling Opportunity Detected",
    description: "Client 'TechCorp' shows 85% probability for premium package upgrade based on usage patterns and engagement metrics.",
    confidence: 85,
    impact: "high",
    timeframe: "Next 2 weeks",
    actionItems: [
      "Schedule executive meeting with TechCorp leadership",
      "Prepare custom ROI analysis for premium features",
      "Share success stories from similar enterprise clients"
    ]
  },
  {
    id: "2",
    type: "risk",
    title: "Churn Risk Alert",
    description: "Client 'StartupXYZ' shows decreased engagement (-40%) and delayed responses. 72% probability of churn within 30 days.",
    confidence: 72,
    impact: "medium",
    timeframe: "Next 30 days",
    actionItems: [
      "Immediate check-in call with account manager",
      "Review service delivery and identify pain points",
      "Offer additional support or training resources"
    ]
  },
  {
    id: "3",
    type: "trend",
    title: "Market Expansion Opportunity",
    description: "Analysis indicates 67% success probability for expanding into healthcare sector based on current client portfolio patterns.",
    confidence: 67,
    impact: "high",
    timeframe: "Next quarter",
    actionItems: [
      "Conduct market research in healthcare sector",
      "Develop healthcare-specific case studies",
      "Identify potential healthcare industry contacts"
    ]
  }
];

const TEAM_PERFORMANCE = [
  { name: "Alice Wilson", efficiency: 92, clientSatisfaction: 4.8, tasksCompleted: 47, revenue: 245000 },
  { name: "Bob Johnson", efficiency: 88, clientSatisfaction: 4.6, tasksCompleted: 43, revenue: 198000 },
  { name: "Carol Davis", efficiency: 85, clientSatisfaction: 4.7, tasksCompleted: 39, revenue: 156000 },
  { name: "David Brown", efficiency: 91, clientSatisfaction: 4.9, tasksCompleted: 51, revenue: 278000 },
  { name: "Eva Martinez", efficiency: 87, clientSatisfaction: 4.5, tasksCompleted: 41, revenue: 189000 }
];

const REVENUE_FORECAST = [
  { month: "Jan", actual: 180000, predicted: 185000, pipeline: 220000 },
  { month: "Feb", actual: 195000, predicted: 200000, pipeline: 245000 },
  { month: "Mar", actual: 210000, predicted: 215000, pipeline: 265000 },
  { month: "Apr", actual: 225000, predicted: 230000, pipeline: 285000 },
  { month: "May", actual: 0, predicted: 245000, pipeline: 310000 },
  { month: "Jun", actual: 0, predicted: 260000, pipeline: 335000 }
];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Analytics - ClientHub AI";
  }, []);

  // Fetch real data from API
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
    staleTime: 30000,
  });

  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
    staleTime: 30000,
  });

  const { data: statistics } = useQuery<any>({
    queryKey: ["/api/statistics"],
    staleTime: 30000,
  });

  // Calculate real metrics from API data
  const realMetrics = useMemo(() => {
    const totalRevenue = clients.reduce((sum: number, client: any) => {
      return sum + (client.kpis?.reduce((kpiSum: number, kpi: any) => kpiSum + (kpi.actual || 0), 0) || 0);
    }, 0);

    const completedTasks = tasks.filter((task: any) => task.status === "completed").length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const avgResponseTime = statistics?.avgResponseTime || 2.3;
    const clientRetention = statistics?.clientRetention || 94.2;

    return {
      revenue: totalRevenue,
      completionRate,
      avgResponseTime,
      clientRetention,
      totalClients: clients.length,
      totalTasks: tasks.length
    };
  }, [clients, tasks, statistics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "risk": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "trend": return <BarChart3 className="h-5 w-5 text-blue-600" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-100";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Analytics</h1>
          <p className="text-slate-600 mt-1">AI-powered business intelligence and predictive insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Executive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {EXECUTIVE_METRICS.map((metric, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{metric.value}</p>
                  {metric.subtitle && (
                    <p className="text-xs text-slate-500 mt-1">{metric.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full bg-slate-50 ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {metric.changeType === "increase" ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metric.changeType === "increase" ? "text-green-600" : "text-red-600"
                }`}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-slate-500 ml-1">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <CardTitle>AI-Powered Predictive Insights</CardTitle>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PREDICTIVE_INSIGHTS.map((insight, index) => (
              <div key={insight.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                      {insight.confidence}% confidence
                    </Badge>
                    <Badge variant={insight.impact === "high" ? "default" : "secondary"}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {insight.timeframe}
                  </span>
                  <Button variant="outline" size="sm">
                    View Action Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Team Performance Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {TEAM_PERFORMANCE.map((member, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{member.name}</h3>
                    <Badge variant="outline">${(member.revenue / 1000).toFixed(0)}K revenue</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Efficiency</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={member.efficiency} className="flex-1" />
                        <span className="font-medium">{member.efficiency}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-600">Satisfaction</p>
                      <p className="font-medium text-slate-900 mt-1">
                        ⭐ {member.clientSatisfaction}/5.0
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Tasks</p>
                      <p className="font-medium text-slate-900 mt-1">{member.tasksCompleted} completed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Forecast */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Forecast & Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {REVENUE_FORECAST.map((month, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900 w-12">{month.month}</span>
                    <div className="flex items-center gap-4">
                      {month.actual > 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          ${(month.actual / 1000).toFixed(0)}K actual
                        </Badge>
                      )}
                      <Badge variant="outline">
                        ${(month.predicted / 1000).toFixed(0)}K predicted
                      </Badge>
                      <Badge variant="secondary">
                        ${(month.pipeline / 1000).toFixed(0)}K pipeline
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    {month.actual > 0 && (
                      <div className="flex items-center gap-1">
                        {month.actual >= month.predicted ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${
                          month.actual >= month.predicted ? "text-green-600" : "text-red-600"
                        }`}>
                          {((month.actual / month.predicted - 1) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Intelligence */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
              <p className="text-sm text-slate-600">Sentiment Analysis</p>
              <p className="text-xs text-slate-500 mt-1">Positive client interactions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">2.1h</div>
              <p className="text-sm text-slate-600">Avg Response Time</p>
              <p className="text-xs text-slate-500 mt-1">15% improvement this month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">87%</div>
              <p className="text-sm text-slate-600">Resolution Rate</p>
              <p className="text-xs text-slate-500 mt-1">First contact resolution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}