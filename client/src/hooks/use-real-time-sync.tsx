import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface RealTimeSyncOptions {
  enableNotifications?: boolean;
  syncInterval?: number;
  endpoints?: string[];
}

export function useRealTimeSync({
  enableNotifications = true,
  syncInterval = 30000, // 30 seconds
  endpoints = [
    '/api/clients',
    '/api/tasks', 
    '/api/team-members',
    '/api/statistics',
    '/api/knowledge/articles'
  ]
}: RealTimeSyncOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncData = useCallback(async () => {
    const promises = endpoints.map(endpoint => 
      queryClient.invalidateQueries({ queryKey: [endpoint] })
    );
    
    try {
      await Promise.all(promises);
      
      if (enableNotifications) {
        // Check for important updates
        const clientsData = queryClient.getQueryData(['/api/clients']) as any[];
        const tasksData = queryClient.getQueryData(['/api/tasks']) as any[];
        
        if (tasksData) {
          const overdueTasks = tasksData.filter((task: any) => 
            task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
          );
          
          if (overdueTasks.length > 0) {
            toast({
              title: "Overdue Tasks Alert",
              description: `You have ${overdueTasks.length} overdue task(s) that need attention.`,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [queryClient, endpoints, enableNotifications, toast]);

  // Auto-sync at intervals
  useEffect(() => {
    const interval = setInterval(syncData, syncInterval);
    return () => clearInterval(interval);
  }, [syncData, syncInterval]);

  // Manual sync function
  const forcSync = useCallback(() => {
    syncData();
    if (enableNotifications) {
      toast({
        title: "Data Synced",
        description: "All data has been synchronized with the server.",
      });
    }
  }, [syncData, enableNotifications, toast]);

  return { syncData, forcSync };
}