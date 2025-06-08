import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Brain,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Mail,
  MessageSquare,
  FileText,
  Users,
  Target,
  Calendar,
  Bell,
  Workflow,
  GitBranch,
  Database,
  Plus
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  executionCount: number;
  lastExecuted?: string;
  successRate: number;
}

interface AIWorkflow {
  id: string;
  name: string;
  type: "email" | "client" | "task" | "report";
  status: "active" | "paused" | "draft";
  automationLevel: number;
  timeSaved: string;
  accuracy: number;
  description: string;
}

const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "1",
    name: "Auto-respond to Client Inquiries",
    description: "Automatically generate intelligent responses to common client questions using AI",
    trigger: "New email received",
    action: "Generate AI response draft",
    isActive: true,
    executionCount: 247,
    lastExecuted: "2 minutes ago",
    successRate: 94
  },
  {
    id: "2",
    name: "Task Generation from Meetings",
    description: "Extract action items from meeting transcripts and create tasks automatically",
    trigger: "Meeting transcript uploaded",
    action: "Create tasks with due dates",
    isActive: true,
    executionCount: 89,
    lastExecuted: "1 hour ago",
    successRate: 91
  },
  {
    id: "3",
    name: "Client Risk Assessment",
    description: "Monitor client engagement patterns and flag potential churn risks",
    trigger: "Client activity decreases",
    action: "Create risk alert",
    isActive: true,
    executionCount: 156,
    lastExecuted: "3 hours ago",
    successRate: 87
  },
  {
    id: "4",
    name: "Weekly Report Generation",
    description: "Generate comprehensive weekly performance reports with insights",
    trigger: "Every Monday 9:00 AM",
    action: "Compile and send report",
    isActive: true,
    executionCount: 52,
    lastExecuted: "2 days ago",
    successRate: 96
  }
];

const AI_WORKFLOWS: AIWorkflow[] = [
  {
    id: "1",
    name: "Intelligent Email Processing",
    type: "email",
    status: "active",
    automationLevel: 85,
    timeSaved: "12h/week",
    accuracy: 94,
    description: "AI analyzes, categorizes, and suggests responses for all incoming emails"
  },
  {
    id: "2", 
    name: "Smart Client Onboarding",
    type: "client",
    status: "active",
    automationLevel: 78,
    timeSaved: "8h/week",
    accuracy: 91,
    description: "Automated welcome sequences, document collection, and initial setup"
  },
  {
    id: "3",
    name: "Predictive Task Management",
    type: "task",
    status: "active",
    automationLevel: 72,
    timeSaved: "6h/week",
    accuracy: 89,
    description: "AI predicts task priorities and automatically assigns based on team capacity"
  },
  {
    id: "4",
    name: "Executive Reporting",
    type: "report",
    status: "paused",
    automationLevel: 90,
    timeSaved: "4h/week",
    accuracy: 97,
    description: "Automated generation of executive dashboards and KPI reports"
  }
];

const INTEGRATION_OPTIONS = [
  { name: "Slack", icon: MessageSquare, connected: true, description: "Team communication automation" },
  { name: "Google Calendar", icon: Calendar, connected: true, description: "Meeting scheduling and reminders" },
  { name: "Salesforce", icon: Database, connected: false, description: "CRM data synchronization" },
  { name: "Jira", icon: GitBranch, connected: true, description: "Project management integration" },
  { name: "Microsoft Teams", icon: Users, connected: false, description: "Video conferencing automation" },
  { name: "HubSpot", icon: Target, connected: false, description: "Marketing automation sync" }
];

export default function AIAutomation() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    trigger: "",
    action: ""
  });

  // Set page title
  useEffect(() => {
    document.title = "AI Automation - ClientHub AI";
  }, []);

  const toggleRule = (ruleId: string) => {
    // Toggle automation rule on/off
    console.log(`Toggling rule ${ruleId}`);
  };

  const createNewRule = () => {
    setIsCreatingRule(false);
    setNewRule({ name: "", description: "", trigger: "", action: "" });
    // API call to create new rule
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "paused": return "bg-yellow-100 text-yellow-700";
      case "draft": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "client": return Users;
      case "task": return CheckCircle;
      case "report": return FileText;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">AI Automation Center</h1>
          <p className="text-slate-600 mt-1">Configure and monitor intelligent automation workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreatingRule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Automation Rule
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Workflows</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">12</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+2 this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Time Saved</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">34h</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-slate-500">per week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">92%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">Above target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Executions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">1,247</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-slate-500">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">AI Workflows</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* AI Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {AI_WORKFLOWS.map((workflow) => {
              const TypeIcon = getTypeIcon(workflow.type);
              return (
                <Card key={workflow.id} className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <p className="text-sm text-slate-600">{workflow.description}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Automation Level</span>
                          <span className="text-sm font-medium">{workflow.automationLevel}%</span>
                        </div>
                        <Progress value={workflow.automationLevel} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Time Saved</span>
                          <p className="font-medium text-slate-900">{workflow.timeSaved}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Accuracy</span>
                          <p className="font-medium text-slate-900">{workflow.accuracy}%</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          {workflow.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Automation Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <div className="space-y-4">
            {AUTOMATION_RULES.map((rule) => (
              <Card key={rule.id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {rule.executionCount} executions
                        </Badge>
                        <Badge variant={rule.successRate >= 90 ? "default" : "secondary"} className="text-xs">
                          {rule.successRate}% success
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span><strong>Trigger:</strong> {rule.trigger}</span>
                        <span><strong>Action:</strong> {rule.action}</span>
                        {rule.lastExecuted && (
                          <span><strong>Last run:</strong> {rule.lastExecuted}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Rule Modal would go here */}
          {isCreatingRule && (
            <Card className="border-2 border-dashed border-slate-300">
              <CardHeader>
                <CardTitle>Create New Automation Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea
                    id="rule-description"
                    value={newRule.description}
                    onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                    placeholder="Describe what this rule does"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-trigger">Trigger</Label>
                    <Select value={newRule.trigger} onValueChange={(value) => setNewRule({...newRule, trigger: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email-received">Email received</SelectItem>
                        <SelectItem value="client-created">New client added</SelectItem>
                        <SelectItem value="task-completed">Task completed</SelectItem>
                        <SelectItem value="schedule">On schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rule-action">Action</Label>
                    <Select value={newRule.action} onValueChange={(value) => setNewRule({...newRule, action: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send-notification">Send notification</SelectItem>
                        <SelectItem value="create-task">Create task</SelectItem>
                        <SelectItem value="generate-report">Generate report</SelectItem>
                        <SelectItem value="ai-response">AI response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createNewRule}>Create Rule</Button>
                  <Button variant="outline" onClick={() => setIsCreatingRule(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATION_OPTIONS.map((integration, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <integration.icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                        <p className="text-sm text-slate-600">{integration.description}</p>
                      </div>
                    </div>
                    <Badge variant={integration.connected ? "default" : "outline"}>
                      {integration.connected ? "Connected" : "Available"}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={integration.connected ? "outline" : "default"}
                  >
                    {integration.connected ? "Configure" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}