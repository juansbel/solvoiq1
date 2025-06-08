import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  Zap,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bot,
  Mail,
  Calendar,
  Users,
  FileText,
  Database,
  Webhook,
  GitBranch
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowTrigger {
  id: string;
  type: "schedule" | "event" | "webhook" | "manual";
  config: {
    schedule?: string;
    event?: string;
    webhook_url?: string;
  };
}

interface WorkflowAction {
  id: string;
  type: "email" | "task" | "notification" | "api_call" | "data_update";
  config: {
    template?: string;
    recipient?: string;
    subject?: string;
    url?: string;
    method?: string;
    data?: any;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "draft";
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  lastRun?: Date;
  runCount: number;
  successRate: number;
  created: Date;
}

const mockWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Client Onboarding Automation",
    description: "Automatically send welcome email and create initial tasks when new client is added",
    status: "active",
    trigger: {
      id: "t1",
      type: "event",
      config: { event: "client_created" }
    },
    actions: [
      {
        id: "a1",
        type: "email",
        config: {
          template: "welcome_client",
          recipient: "client_email",
          subject: "Welcome to our platform!"
        }
      },
      {
        id: "a2",
        type: "task",
        config: {
          template: "onboarding_checklist"
        }
      }
    ],
    lastRun: new Date("2024-01-15T10:30:00"),
    runCount: 24,
    successRate: 95.8,
    created: new Date("2024-01-01")
  },
  {
    id: "2",
    name: "Weekly Progress Reports",
    description: "Generate and send weekly progress reports to team leads",
    status: "active",
    trigger: {
      id: "t2",
      type: "schedule",
      config: { schedule: "0 9 * * 1" } // Every Monday at 9 AM
    },
    actions: [
      {
        id: "a3",
        type: "data_update",
        config: {
          data: "generate_reports"
        }
      },
      {
        id: "a4",
        type: "email",
        config: {
          template: "weekly_report",
          recipient: "team_leads",
          subject: "Weekly Progress Report"
        }
      }
    ],
    lastRun: new Date("2024-01-22T09:00:00"),
    runCount: 8,
    successRate: 100,
    created: new Date("2023-12-15")
  }
];

export default function WorkflowAutomation() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("workflows");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "draft": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "schedule": return Clock;
      case "event": return Zap;
      case "webhook": return Webhook;
      case "manual": return Play;
      default: return Settings;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "email": return Mail;
      case "task": return CheckCircle2;
      case "notification": return AlertCircle;
      case "api_call": return Database;
      case "data_update": return FileText;
      default: return Settings;
    }
  };

  const WorkflowCard = ({ workflow }: { workflow: Workflow }) => {
    const TriggerIcon = getTriggerIcon(workflow.trigger.type);
    
    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedWorkflow(workflow)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {workflow.name}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {workflow.description}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(workflow.status)}>
              {workflow.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TriggerIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {workflow.trigger.type.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {workflow.actions.length} action{workflow.actions.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {workflow.runCount} runs • {workflow.successRate}% success
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toast({
                    title: workflow.status === "active" ? "Workflow Paused" : "Workflow Activated",
                    description: `${workflow.name} is now ${workflow.status === "active" ? "inactive" : "active"}.`,
                  });
                }}
              >
                {workflow.status === "active" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWorkflow(workflow);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Workflow Automation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Automate repetitive tasks and streamline business processes
            </p>
          </div>
          <Dialog open={isNewWorkflowOpen} onOpenChange={setIsNewWorkflowOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input placeholder="Enter workflow name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="draft">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe what this workflow does" rows={3} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Trigger</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Trigger Type</Label>
                      <Select defaultValue="event">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="schedule">Schedule</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="webhook">Webhook</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Configuration</Label>
                      <Input placeholder="e.g., client_created, task_completed" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Actions</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Send Email</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Send welcome email to new client
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsNewWorkflowOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast({
                      title: "Workflow Created",
                      description: "Your new workflow has been saved as a draft.",
                    });
                    setIsNewWorkflowOpen(false);
                  }}>
                    Create Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="logs">Execution Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockWorkflows.map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Client Onboarding",
                  description: "Welcome new clients with automated emails and task creation",
                  icon: Users,
                  category: "Client Management"
                },
                {
                  name: "Task Reminder",
                  description: "Send reminders for overdue or upcoming tasks",
                  icon: Clock,
                  category: "Task Management"
                },
                {
                  name: "Weekly Reports",
                  description: "Generate and distribute weekly progress reports",
                  icon: FileText,
                  category: "Reporting"
                },
                {
                  name: "Data Sync",
                  description: "Synchronize data between different systems",
                  icon: Database,
                  category: "Integration"
                }
              ].map((template, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <template.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {template.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      workflow: "Client Onboarding Automation",
                      status: "success",
                      timestamp: new Date("2024-01-22T14:30:00"),
                      duration: "2.3s"
                    },
                    {
                      workflow: "Weekly Progress Reports",
                      status: "success",
                      timestamp: new Date("2024-01-22T09:00:00"),
                      duration: "45.2s"
                    },
                    {
                      workflow: "Client Onboarding Automation",
                      status: "failed",
                      timestamp: new Date("2024-01-21T16:15:00"),
                      duration: "1.8s"
                    }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          log.status === "success" 
                            ? "bg-green-500" 
                            : "bg-red-500"
                        }`} />
                        <div>
                          <div className="font-medium">{log.workflow}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {log.timestamp.toLocaleString()} • {log.duration}
                          </div>
                        </div>
                      </div>
                      <Badge variant={log.status === "success" ? "default" : "destructive"}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Workflow Detail Modal */}
        {selectedWorkflow && (
          <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Bot className="h-6 w-6" />
                  {selectedWorkflow.name}
                  <Badge className={getStatusColor(selectedWorkflow.status)}>
                    {selectedWorkflow.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedWorkflow.description}
                </p>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedWorkflow.runCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Runs</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedWorkflow.successRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedWorkflow.lastRun?.toLocaleDateString() || "Never"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Run</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Workflow Steps</h3>
                  <div className="space-y-3">
                    {/* Trigger */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded">
                        {(() => {
                          const TriggerIcon = getTriggerIcon(selectedWorkflow.trigger.type);
                          return <TriggerIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
                        })()}
                      </div>
                      <div>
                        <div className="font-medium">Trigger: {selectedWorkflow.trigger.type}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedWorkflow.trigger.config.event || 
                           selectedWorkflow.trigger.config.schedule || 
                           "Manual execution"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedWorkflow.actions.map((action, index) => (
                      <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                          {(() => {
                            const ActionIcon = getActionIcon(action.type);
                            return <ActionIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
                          })()}
                        </div>
                        <div>
                          <div className="font-medium">Action {index + 1}: {action.type}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {action.config.subject || action.config.template || action.type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">
                    Edit Workflow
                  </Button>
                  <Button>
                    Run Now
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}