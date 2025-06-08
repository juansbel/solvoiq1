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
  User, Mail, MapPin, Calendar, Trophy, Target, Clock,
  CheckCircle, AlertCircle, TrendingUp, BarChart3, Users,
  MessageSquare, FileText, Settings, Star, Award, Zap
} from "lucide-react";
import { format } from "date-fns";
import type { TeamMember, Task, Client } from "@shared/schema";

export default function TeamMemberProfile() {
  const [, params] = useRoute("/team/:id");
  const memberId = parseInt(params?.id || "0");
  const queryClient = useQueryClient();

  const { data: teamMember, isLoading } = useQuery<TeamMember>({
    queryKey: ["/api/team-members", memberId],
    enabled: !!memberId
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"]
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const memberTasks = tasks.filter(task => 
    task.description?.toLowerCase().includes(teamMember?.name.toLowerCase() || "")
  );

  const assignedClients = clients.filter(client => 
    client.assignedTeamMembers?.includes(teamMember?.name || "")
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team member not found</h2>
      </div>
    );
  }

  const getPerformanceMetrics = () => {
    const completedTasks = memberTasks.filter(task => task.status === "completed").length;
    const totalTasks = memberTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      completionRate,
      totalTasks,
      completedTasks,
      activeClients: assignedClients.length,
      productivity: Math.min(completionRate + Math.random() * 20, 100)
    };
  };

  const metrics = getPerformanceMetrics();

  const getSkillLevel = (skill: string) => {
    const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teamMember.name)}&background=6366f1&color=fff&size=128`} />
                <AvatarFallback className="text-lg">{teamMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{teamMember.name}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center mt-1">
                  <User className="h-4 w-4 mr-2" />
                  {teamMember.role}
                </p>
                {teamMember.position && (
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{teamMember.position}</p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-1" />
                    {teamMember.email}
                  </div>
                  {teamMember.location && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" />
                      {teamMember.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">4.8</span>
                <span className="text-sm text-gray-500">Rating</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Joined {format(teamMember.createdAt ? new Date(teamMember.createdAt) : new Date(), 'MMM yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Task Completion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(metrics.completionRate)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeClients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(metrics.productivity)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={metrics.productivity} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Role & Responsibilities</p>
                  <p className="text-gray-900 dark:text-white">
                    {teamMember.role} specializing in client relationship management and project execution. 
                    Responsible for maintaining high-quality deliverables and ensuring client satisfaction.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team ID</p>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {teamMember.teamMemberId || `TM-${teamMember.id.toString().padStart(4, '0')}`}
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Workload</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={(metrics.activeClients / 10) * 100} className="flex-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {metrics.activeClients}/10 clients
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Award className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Client Satisfaction Champion</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Achieved 95% client satisfaction rating</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Project Delivery Excellence</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed {metrics.completedTasks} projects on time</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Innovation Contributor</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Implemented 3 process improvements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button className="justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button className="justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule 1:1
                </Button>
                <Button className="justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
                <Button className="justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {teamMember.skills && teamMember.skills.length > 0 ? (
                  <div className="space-y-4">
                    {teamMember.skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{skill}</span>
                          <Badge variant="outline">{getSkillLevel(skill)}</Badge>
                        </div>
                        <Progress value={Math.random() * 40 + 60} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No skills listed</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Development Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Advanced Analytics</span>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Leadership Training</span>
                    <span className="text-sm text-gray-500">45%</span>
                  </div>
                  <Progress value={45} />
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Project Management</span>
                    <span className="text-sm text-gray-500">90%</span>
                  </div>
                  <Progress value={90} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Tasks</CardTitle>
              <CardDescription>
                Current and completed tasks for {teamMember.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberTasks.length > 0 ? (
                <div className="space-y-4">
                  {memberTasks.map((task) => (
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
                      <div className="flex items-center space-x-2">
                        <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No tasks assigned to this team member
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Clients</CardTitle>
              <CardDescription>
                Clients managed by {teamMember.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedClients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`} />
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{client.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{client.company}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No clients assigned to this team member
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Task Completion Rate</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(metrics.completionRate)}%</span>
                  </div>
                  <Progress value={metrics.completionRate} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Client Satisfaction</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">96%</span>
                  </div>
                  <Progress value={96} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Excellent</span>
                  </div>
                  <Progress value={92} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">4.8/5.0</span>
                  </div>
                  <Progress value={96} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Complete 15 Tasks</span>
                      <p className="text-sm text-green-700 dark:text-green-300">{metrics.completedTasks}/15 completed</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <span className="font-medium text-blue-900 dark:text-blue-100">Client Check-ins</span>
                      <p className="text-sm text-blue-700 dark:text-blue-300">8/10 completed</p>
                    </div>
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <span className="font-medium text-purple-900 dark:text-purple-100">Skill Development</span>
                      <p className="text-sm text-purple-700 dark:text-purple-300">2/2 courses completed</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="development">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Career Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Level</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{teamMember.role}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Career Step</p>
                  <p className="text-gray-900 dark:text-white">Senior {teamMember.role}</p>
                  <Progress value={65} />
                  <p className="text-xs text-gray-500 dark:text-gray-400">65% progress to promotion</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Areas for Growth</p>
                  <div className="space-y-1">
                    <Badge variant="outline">Leadership Skills</Badge>
                    <Badge variant="outline">Advanced Analytics</Badge>
                    <Badge variant="outline">Client Strategy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning & Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Completed Courses</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Advanced Project Management</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Client Communication Excellence</p>
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">In Progress</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Data Analytics Fundamentals (75%)</p>
                  <Progress value={75} className="mt-2" />
                </div>
                <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Recommended</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Leadership Development Program</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Advanced Client Strategy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}