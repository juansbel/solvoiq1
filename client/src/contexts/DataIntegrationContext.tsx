import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Client, Task, TeamMember, Statistics, KnowledgeArticle } from '@/../../shared/schema';

interface DataIntegrationContextType {
  // Consolidated data
  consolidatedData: {
    clients: Client[];
    tasks: Task[];
    teamMembers: TeamMember[];
    statistics: Statistics | null;
    knowledgeArticles: KnowledgeArticle[];
  };
  
  // Cross-references
  getClientTasks: (clientId: number) => Task[];
  getTeamMemberTasks: (memberId: number) => Task[];
  getClientTeamMembers: (clientId: number) => TeamMember[];
  getRelatedKnowledge: (searchTerm: string) => KnowledgeArticle[];
  
  // Analytics functions
  getClientMetrics: (clientId: number) => {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    assignedTeamMembers: number;
    lastActivity: Date | null;
  };
  
  getTeamMemberMetrics: (memberId: number) => {
    totalTasks: number;
    completedTasks: number;
    clientCount: number;
    workload: 'light' | 'moderate' | 'heavy';
  };
  
  // Real-time sync status
  isLoading: boolean;
  lastSync: Date | null;
}

const DataIntegrationContext = createContext<DataIntegrationContextType | undefined>(undefined);

export function DataIntegrationProvider({ children }: { children: React.ReactNode }) {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  // Fetch all data with real-time updates
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    staleTime: 10000,
    refetchInterval: 30000,
  });

  const { data: teamMembers = [], isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
    staleTime: 10000,
    refetchInterval: 30000,
  });

  const { data: statistics = null, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ['/api/statistics'],
    staleTime: 15000,
    refetchInterval: 60000,
  });

  const { data: knowledgeArticles = [], isLoading: knowledgeLoading } = useQuery<KnowledgeArticle[]>({
    queryKey: ['/api/knowledge/articles'],
    staleTime: 30000,
    refetchInterval: 120000,
  });

  const isLoading = clientsLoading || tasksLoading || teamLoading || statsLoading || knowledgeLoading;

  // Update sync timestamp when data changes
  useEffect(() => {
    if (!isLoading) {
      setLastSync(new Date());
    }
  }, [clients, tasks, teamMembers, statistics, knowledgeArticles, isLoading]);

  // Cross-reference functions
  const getClientTasks = (clientId: number): Task[] => {
    // Tasks don't have clientId in current schema, so we'll return tasks assigned to team members working with this client
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.assignedTeamMembers) return [];
    
    return tasks.filter(task => 
      client.assignedTeamMembers?.some(memberId => task.assignedTo?.toString() === memberId)
    );
  };

  const getTeamMemberTasks = (memberId: number): Task[] => {
    return tasks.filter(task => task.assignedTo?.toString() === memberId.toString());
  };

  const getClientTeamMembers = (clientId: number): TeamMember[] => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.assignedTeamMembers) return [];
    
    return teamMembers.filter(member => 
      client.assignedTeamMembers?.includes(member.id.toString())
    );
  };

  const getRelatedKnowledge = (searchTerm: string): KnowledgeArticle[] => {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase();
    return knowledgeArticles.filter(article =>
      article.title.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(term)))
    ).slice(0, 5);
  };

  const getClientMetrics = (clientId: number) => {
    const clientTasks = getClientTasks(clientId);
    const completedTasks = clientTasks.filter(task => task.status === 'completed');
    const overdueTasks = clientTasks.filter(task => 
      task.suggestedDueDate && new Date(task.suggestedDueDate) < new Date() && task.status !== 'completed'
    );
    const assignedTeamMembers = getClientTeamMembers(clientId).length;
    
    // Find last activity from tasks
    const lastActivity = clientTasks.length > 0 
      ? new Date(Math.max(...clientTasks.map(task => new Date(task.createdAt || 0).getTime())))
      : null;

    return {
      totalTasks: clientTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      assignedTeamMembers,
      lastActivity,
    };
  };

  const getTeamMemberMetrics = (memberId: number) => {
    const memberTasks = getTeamMemberTasks(memberId);
    const completedTasks = memberTasks.filter(task => task.status === 'completed');
    
    // Count unique clients this team member works with
    const clientsForMember = clients.filter(client => 
      client.assignedTeamMembers?.includes(memberId.toString())
    );
    const clientCount = clientsForMember.length;
    
    // Determine workload based on active tasks
    const activeTasks = memberTasks.filter(task => task.status !== 'completed').length;
    let workload: 'light' | 'moderate' | 'heavy' = 'light';
    if (activeTasks > 10) workload = 'heavy';
    else if (activeTasks > 5) workload = 'moderate';

    return {
      totalTasks: memberTasks.length,
      completedTasks: completedTasks.length,
      clientCount,
      workload,
    };
  };

  const consolidatedData = {
    clients,
    tasks,
    teamMembers,
    statistics,
    knowledgeArticles,
  };

  const value: DataIntegrationContextType = {
    consolidatedData,
    getClientTasks,
    getTeamMemberTasks,
    getClientTeamMembers,
    getRelatedKnowledge,
    getClientMetrics,
    getTeamMemberMetrics,
    isLoading,
    lastSync,
  };

  return (
    <DataIntegrationContext.Provider value={value}>
      {children}
    </DataIntegrationContext.Provider>
  );
}

export function useDataIntegration() {
  const context = useContext(DataIntegrationContext);
  if (context === undefined) {
    throw new Error('useDataIntegration must be used within a DataIntegrationProvider');
  }
  return context;
}