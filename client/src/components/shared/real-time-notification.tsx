import React, { useEffect, useState } from 'react';
import { useDataIntegration } from '@/contexts/DataIntegrationContext';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Info, Users, Calendar } from 'lucide-react';

export function RealTimeNotifications() {
  const { consolidatedData } = useDataIntegration();
  const { toast } = useToast();
  const [previousCounts, setPreviousCounts] = useState({
    clients: 0,
    tasks: 0,
    teamMembers: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    const currentCounts = {
      clients: consolidatedData.clients.length,
      tasks: consolidatedData.tasks.length,
      teamMembers: consolidatedData.teamMembers.length,
      overdueTasks: consolidatedData.tasks.filter(task => 
        task.suggestedDueDate && 
        new Date(task.suggestedDueDate) < new Date() && 
        task.status !== 'completed'
      ).length
    };

    // Check for new clients
    if (currentCounts.clients > previousCounts.clients) {
      toast({
        title: "New Client Added",
        description: `${currentCounts.clients - previousCounts.clients} new client(s) have been added to your portfolio.`,
        action: (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            View Clients
          </div>
        ),
      });
    }

    // Check for new tasks
    if (currentCounts.tasks > previousCounts.tasks) {
      toast({
        title: "New Tasks Created",
        description: `${currentCounts.tasks - previousCounts.tasks} new task(s) have been assigned.`,
        action: (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            View Tasks
          </div>
        ),
      });
    }

    // Check for new team members
    if (currentCounts.teamMembers > previousCounts.teamMembers) {
      toast({
        title: "Team Expanded",
        description: `${currentCounts.teamMembers - previousCounts.teamMembers} new team member(s) have joined.`,
        action: (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            View Team
          </div>
        ),
      });
    }

    // Check for increased overdue tasks
    if (currentCounts.overdueTasks > previousCounts.overdueTasks) {
      toast({
        title: "Overdue Tasks Alert",
        description: `${currentCounts.overdueTasks} task(s) are now overdue and need immediate attention.`,
        variant: "destructive",
        action: (
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Review Tasks
          </div>
        ),
      });
    }

    setPreviousCounts(currentCounts);
  }, [consolidatedData, toast, previousCounts]);

  // Check for upcoming deadlines
  useEffect(() => {
    const checkUpcomingDeadlines = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const upcomingTasks = consolidatedData.tasks.filter(task => {
        if (!task.suggestedDueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.suggestedDueDate);
        return dueDate <= tomorrow && dueDate > new Date();
      });

      if (upcomingTasks.length > 0) {
        toast({
          title: "Upcoming Deadlines",
          description: `${upcomingTasks.length} task(s) due within 24 hours.`,
          action: (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </div>
          ),
        });
      }
    };

    // Check every 30 minutes
    const interval = setInterval(checkUpcomingDeadlines, 30 * 60 * 1000);
    checkUpcomingDeadlines(); // Check immediately

    return () => clearInterval(interval);
  }, [consolidatedData.tasks, toast]);

  return null; // This component only handles notifications
}