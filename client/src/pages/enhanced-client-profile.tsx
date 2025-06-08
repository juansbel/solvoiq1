import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterAvatar } from "@/components/character-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, Mail, Phone, MapPin, Calendar, DollarSign, 
  TrendingUp, AlertCircle, CheckCircle, Clock, Users,
  FileText, MessageSquare, Target, BarChart3, Activity,
  ArrowLeft, Edit, Plus, Eye, Star, Award, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client, ClientActivity, Task, TeamMember } from "@shared/schema";

export default function EnhancedClientProfile() {
  const [, params] = useRoute("/clients/:id");
  const clientId = parseInt(params?.id || "0");
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ["/api/clients", clientId],
    enabled: !!clientId
  });

  const { data: activities = [] } = useQuery<ClientActivity[]>({
    queryKey: ["/api/client-activities", clientId],
    enabled: !!clientId
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"]
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"]
  });

  const clientTasks = tasks.filter(task => 
    task.assignedTo && task.assignedTo.includes(client?.name || "")
  );

  const assignedTeam = teamMembers.filter(member => 
    client?.assignedTeamMembers?.includes(member.name)
  );

  const getClientHealth = () => {
    if (!client) return { status: "unknown", score: 0, color: "text-gray-500" };
    
    const completedTasks = clientTasks.filter(task => task.status === "completed").length;
    const totalTasks = clientTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const kpis = client.kpis || [];
    const metKpis = kpis.filter(kpi => kpi.met).length;
    const kpiHealth = kpis.length > 0 ? (metKpis / kpis.length) * 100 : 100;
    
    const overallHealth = (completionRate + kpiHealth) / 2;
    
    let status: string;
    let color: string;
    
    if (overallHealth >= 80) {
      status = "Excellent";
      color = "text-green-600";
    } else if (overallHealth >= 60) {
      status = "Good";
      color = "text-blue-600";
    } else if (overallHealth >= 40) {
      status = "Needs Attention";
      color = "text-yellow-600";
    } else {
      status = "Critical";
      color = "text-red-600";
    }
    
    return { status, score: Math.round(overallHealth), color };
  };

  const addActivityMutation = useMutation({
    mutationFn: async (activity: { type: string; content: string; metadata?: any }) => {
      const response = await apiRequest("POST", `/api/client-activities`, {
        clientId,
        ...activity,
        createdAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-activities", clientId] });
      toast({
        title: "Activity added",
        description: "Client activity has been successfully recorded.",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Client not found</h3>
            <p className="text-muted-foreground mb-4">
              The requested client could not be found.
            </p>
            <Button asChild>
              <Link href="/clients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const health = getClientHealth();
  const activeTasks = clientTasks.filter(task => task.status !== "completed").length;
  const completedTasks = clientTasks.filter(task => task.status === "completed").length;
  const totalRevenue = client.kpis?.reduce((sum, kpi) => sum + (kpi.actual || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <CharacterAvatar name={client.name} size="lg" />
            <div>
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {client.company}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={health.color}>
            {health.status} • {health.score}%
          </Badge>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTasks}</p>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignedTeam.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({clientTasks.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({assignedTeam.length})</TabsTrigger>
          <TabsTrigger value="kpis">KPIs ({client.kpis?.length || 0})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{client.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Since:</span>
                        <span className="font-medium">
                          {client.createdAt ? format(new Date(client.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Health Score:</span>
                        <span className={`font-medium ${health.color}`}>{health.score}%</span>
                      </div>
                    </div>
                  </div>
                  {client.notes && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Notes:</span>
                      <p className="text-sm bg-muted p-3 rounded-lg">{client.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Activities</CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>No activities recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium capitalize">{activity.type}</span>
                              <span className="text-xs text-muted-foreground">
                                {activity.createdAt ? format(new Date(activity.createdAt), 'MMM dd, HH:mm') : ''}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                          </div>
                        </div>
                      ))}
                      {activities.length > 5 && (
                        <Button variant="ghost" size="sm" className="w-full">
                          View All Activities
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="text-4xl font-bold">{health.score}%</div>
                      <div className={`text-sm ${health.color}`}>{health.status}</div>
                    </div>
                    <Progress value={health.score} className="h-3" />
                    <div className="text-xs text-muted-foreground">
                      Based on task completion and KPI performance
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Client Tasks</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
          
          {clientTasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  No tasks have been assigned to this client yet.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {clientTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{task.name}</h4>
                          <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline">{task.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {format(new Date(task.dueDate), 'MMM dd')}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {task.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assigned Team Members</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Assign Member
            </Button>
          </div>
          
          {assignedTeam.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No team members assigned</h3>
                <p className="text-muted-foreground mb-4">
                  Assign team members to work on this client.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Team Member
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedTeam.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CharacterAvatar name={member.name} size="md" />
                      <div className="flex-1">
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/team/${member.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add KPI
            </Button>
          </div>
          
          {!client.kpis || client.kpis.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No KPIs defined</h3>
                <p className="text-muted-foreground mb-4">
                  Set up key performance indicators to track client success.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First KPI
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.kpis.map((kpi, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{kpi.name}</h4>
                        <Badge variant={kpi.met ? "default" : "secondary"}>
                          {kpi.met ? "Met" : "Not Met"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{kpi.actual} / {kpi.target}</span>
                        </div>
                        <Progress 
                          value={Math.min((kpi.actual / kpi.target) * 100, 100)} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Activities</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
          
          {activities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activities recorded</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking client interactions and milestones.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Activity
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{activity.type}</span>
                          <span className="text-sm text-muted-foreground">
                            {activity.createdAt ? format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm') : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}