import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataIntegration } from '@/contexts/DataIntegrationContext';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  ArrowRight,
  Activity,
  Lightbulb,
  BarChart,
  FileText
} from 'lucide-react';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CrossPageInsightsProps {
  contextType: 'client' | 'team-member' | 'task' | 'general';
  contextId?: number;
  showNavigation?: boolean;
}

export function CrossPageInsights({ contextType, contextId, showNavigation = true }: CrossPageInsightsProps) {
  const { 
    consolidatedData, 
    getClientMetrics, 
    getTeamMemberMetrics, 
    getRelatedKnowledge,
    getClientTasks,
    getTeamMemberTasks
  } = useDataIntegration();
  const [, setLocation] = useLocation();

  const renderClientInsights = (clientId: number) => {
    const client = consolidatedData.clients.find(c => c.id === clientId);
    if (!client) return null;

    const metrics = getClientMetrics(clientId);
    const relatedKnowledge = getRelatedKnowledge(client.name);
    const clientTasks = getClientTasks(clientId);
    const recentTasks = clientTasks.slice(0, 3);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                  <p className="text-lg font-bold">{metrics.totalTasks}</p>
                </div>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-green-600">{metrics.completedTasks}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-lg font-bold text-red-600">{metrics.overdueTasks}</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Team Members</p>
                  <p className="text-lg font-bold">{metrics.assignedTeamMembers}</p>
                </div>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {recentTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Recent Tasks
                {showNavigation && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation('/tasks')}
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate">{task.name}</span>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {relatedKnowledge.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Related Knowledge
                </span>
                {showNavigation && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation('/knowledge')}
                  >
                    Browse <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedKnowledge.map(article => (
                <div key={article.id} className="p-2 bg-gray-50 rounded">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  <p className="text-xs text-gray-500">{article.status}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTeamMemberInsights = (memberId: number) => {
    const member = consolidatedData.teamMembers.find(m => m.id === memberId);
    if (!member) return null;

    const metrics = getTeamMemberMetrics(memberId);
    const memberTasks = getTeamMemberTasks(memberId);
    const recentTasks = memberTasks.slice(0, 3);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                  <p className="text-lg font-bold">{metrics.totalTasks}</p>
                </div>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-green-600">{metrics.completedTasks}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Clients</p>
                  <p className="text-lg font-bold">{metrics.clientCount}</p>
                </div>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Workload</p>
                  <Badge variant={
                    metrics.workload === 'heavy' ? 'destructive' : 
                    metrics.workload === 'moderate' ? 'default' : 'secondary'
                  }>
                    {metrics.workload}
                  </Badge>
                </div>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {recentTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Current Tasks
                {showNavigation && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setLocation('/tasks')}
                  >
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm truncate">{task.name}</span>
                  <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                    {task.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderGeneralInsights = () => {
    const { clients, tasks, teamMembers, statistics } = consolidatedData;
    
    const activeTasks = tasks.filter(task => task.status !== 'completed');
    const overdueTasks = tasks.filter(task => 
      task.suggestedDueDate && new Date(task.suggestedDueDate) < new Date() && task.status !== 'completed'
    );
    const completionRate = tasks.length > 0 ? 
      Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Clients</p>
                <p className="text-lg font-bold">{clients.length}</p>
              </div>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Active Tasks</p>
                <p className="text-lg font-bold">{activeTasks.length}</p>
              </div>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-lg font-bold text-red-600">{overdueTasks.length}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-lg font-bold text-green-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {contextType === 'client' && contextId && renderClientInsights(contextId)}
      {contextType === 'team-member' && contextId && renderTeamMemberInsights(contextId)}
      {contextType === 'general' && renderGeneralInsights()}
    </div>
  );
}