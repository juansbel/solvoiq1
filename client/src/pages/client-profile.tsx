import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, Mail, Phone, MapPin, Calendar, DollarSign, 
  TrendingUp, AlertCircle, CheckCircle, Clock, Users,
  FileText, MessageSquare, Target, BarChart3, Activity
} from "lucide-react";
import { format } from "date-fns";
import type { Client, ClientActivity, Task, TeamMember } from "@shared/schema";

export default function ClientProfile() {
  const [, params] = useRoute("/clients/:id");
  const clientId = parseInt(params?.id || "0");
  const queryClient = useQueryClient();

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
    task.description?.toLowerCase().includes(client?.name.toLowerCase() || "")
  );

  const assignedTeam = teamMembers.filter(member => 
    client?.assignedTeamMembers?.includes(member.name)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client not found</h2>
      </div>
    );
  }

  const getClientHealth = () => {
    const completedTasks = clientTasks.filter(task => task.status === "completed").length;
    const totalTasks = clientTasks.length;
    const healthScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
    
    if (healthScore >= 80) return { status: "Excellent", color: "text-green-600", bgColor: "bg-green-100" };
    if (healthScore >= 60) return { status: "Good", color: "text-blue-600", bgColor: "bg-blue-100" };
    if (healthScore >= 40) return { status: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { status: "Needs Attention", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const health = getClientHealth();
  const completionRate = clientTasks.length > 0 
    ? (clientTasks.filter(task => task.status === "completed").length / clientTasks.length) * 100 
    : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=3b82f6&color=fff`} />
                <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center mt-1">
                  <Building2 className="h-4 w-4 mr-2" />
                  {client.company}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-1" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-1" />
                      {client.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${health.bgColor} ${health.color} border-0 px-3 py-1`}>
                {health.status}
              </Badge>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Client since {format(client.createdAt ? new Date(client.createdAt) : new Date(), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(completionRate)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {clientTasks.filter(task => task.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignedTeam.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activities</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activities.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-white">
                    {client.notes || "No notes available"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Key Performance Indicators</p>
                  {client.kpis && client.kpis.length > 0 ? (
                    <div className="space-y-2">
                      {client.kpis.slice(0, 3).map((kpi, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="font-medium">{kpi.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {kpi.actual}/{kpi.target}
                            </span>
                            {kpi.met ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No KPIs defined</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Client Tasks</CardTitle>
              <CardDescription>
                All tasks related to {client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clientTasks.length > 0 ? (
                <div className="space-y-4">
                  {clientTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{task.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                        {task.suggestedDueDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Due: {format(new Date(task.suggestedDueDate), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                      <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No tasks found for this client
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Team</CardTitle>
              <CardDescription>
                Team members working with {client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedTeam.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedTeam.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No team members assigned to this client
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Timeline of interactions with {client.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 border-l-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">{activity.content}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {format(activity.createdAt ? new Date(activity.createdAt) : new Date(), 'MMM dd, yyyy hh:mm a')}
                        </p>
                      </div>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No activities recorded for this client
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Task Completion Rate</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(completionRate)}%</span>
                  </div>
                  <Progress value={completionRate} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Communication Frequency</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
                  </div>
                  <Progress value={85} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Excellent</span>
                  </div>
                  <Progress value={95} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Total Interactions</span>
                    <span className="text-lg font-bold">{activities.length + clientTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Projects Completed</span>
                    <span className="text-lg font-bold">{clientTasks.filter(t => t.status === "completed").length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="font-medium">Active Projects</span>
                    <span className="text-lg font-bold">{clientTasks.filter(t => t.status === "pending").length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}