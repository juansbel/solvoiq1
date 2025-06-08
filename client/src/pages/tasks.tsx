import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit } from "lucide-react";
import { type Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { ActionButton } from "@/components/action-button";
import { TaskItem } from "@/components/task-item";

export function Tasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "pending" | "completed" }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Success",
        description: "Task status updated!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-tasks", {
        suggestions: "Generate tasks based on the general business context and recent client communications",
      });
      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      toast({
        title: "Success",
        description: `Generated ${data.tasks?.length || 0} new tasks from AI context!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskStatus = (taskId: number, newStatus: "pending" | "completed") => {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  const pendingTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status === "completed");

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={commonHeaderClass}>Tasks</h2>
              <p className="text-slate-600">Manage and track your tasks</p>
            </div>
            <ActionButton
              onClick={handleGenerateTasks}
              loading={isGenerating}
              variant="success"
              icon={BrainCircuit}
            >
              Generate Tasks from Context
            </ActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Pending Tasks ({pendingTasks.length})
            </h3>
            <div className="space-y-4">
              {pendingTasks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No pending tasks</p>
              ) : (
                pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTaskStatus}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className={commonSectionClass}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No completed tasks</p>
              ) : (
                completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleTaskStatus}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
