import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/use-debounce";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { 
  BrainCircuit, 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  Timer,
  Target,
  TrendingUp,
  Users,
  AlertCircle
} from "lucide-react";
import { type Task, type InsertTask, insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { commonSectionClass, commonHeaderClass } from "@/lib/utils";
import { ActionButton } from "@/components/action-button";
import { EnhancedTaskItem } from "@/components/enhanced-task-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export function EnhancedTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  // Set page title
  useEffect(() => {
    document.title = "Tasks - ClientHub AI";
  }, []);

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      userId: "1",
      name: "",
      description: "",
      status: "pending",
      priority: "medium",
      category: "general",
      estimatedMinutes: 60,
      timeSpent: 0,
      assignedTo: "",
      tags: [],
      isAiGenerated: false
    },
  });

  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    staleTime: 30000,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      form.reset();
      setShowAddDialog(false);
      toast({
        title: "Task created",
        description: "Task has been successfully created.",
      });
    },
    onError: (error: any) => {
      console.error('Task creation error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTask) => {
    createTaskMutation.mutate(data);
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await apiRequest("PUT", `/api/tasks/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
    },
    onError: (error: any) => {
      console.error('Task update error:', error);
      toast({
        title: "Error", 
        description: error?.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Filter and search tasks with debounced search
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || task.status === filterStatus;
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || task.category === filterCategory;
      const matchesAssignee = filterAssignee === "all" || task.assignedTo === filterAssignee;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
    });
  }, [tasks, debouncedSearchTerm, filterStatus, filterPriority, filterCategory, filterAssignee]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
    ).length;
    
    const totalTimeSpent = tasks.reduce((sum, task) => sum + (task.timeSpent || 0), 0);
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const priorityBreakdown = {
      urgent: tasks.filter(t => t.priority === "urgent").length,
      high: tasks.filter(t => t.priority === "high").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      low: tasks.filter(t => t.priority === "low").length,
    };

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      totalTimeSpent,
      totalEstimatedTime,
      completionRate,
      priorityBreakdown,
    };
  }, [tasks]);

  // Group tasks by status
  const taskGroups = useMemo(() => {
    const groups = {
      pending: filteredTasks.filter(t => t.status === "pending"),
      in_progress: filteredTasks.filter(t => t.status === "in_progress"),
      completed: filteredTasks.filter(t => t.status === "completed"),
    };
    return groups;
  }, [filteredTasks]);

  // Get unique values for filters
  const uniqueAssignees = tasks.reduce((acc, task) => {
    if (task.assignedTo && !acc.includes(task.assignedTo)) acc.push(task.assignedTo);
    return acc;
  }, [] as string[]);
  const uniqueCategories = tasks.reduce((acc, task) => {
    if (task.category && !acc.includes(task.category)) acc.push(task.category);
    return acc;
  }, [] as string[]);

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

  const handleToggleTaskStatus = (taskId: number, newStatus: "pending" | "completed" | "in_progress") => {
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === "completed") {
      updates.completedAt = new Date();
    }
    updateTaskMutation.mutate({ id: taskId, updates });
  };

  const handleUpdateTime = async (taskId: number, timeSpent: number) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${taskId}/time`, { timeSpent });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      console.error("Failed to update task time:", error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={commonHeaderClass}>Enhanced Task Management</h2>
            <p className="text-slate-600">Track time, manage priorities, and boost productivity</p>
          </div>
          <div className="flex gap-2">
            <ActionButton
              onClick={handleGenerateTasks}
              loading={isGenerating}
              variant="success"
              icon={BrainCircuit}
            >
              Generate AI Tasks
            </ActionButton>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to track progress and manage your workload.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task name..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the task..."
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Development, Marketing" {...field} value={field.value || ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estimatedMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Time (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="60"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                            <FormControl>
                              <Input placeholder="Team member name" {...field} value={field.value || ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTasks}</div>
              <div className="text-xs text-slate-500 mt-1">
                {analytics.completedTasks} completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</div>
              <Progress value={analytics.completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Time Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</div>
              <div className="text-xs text-slate-500 mt-1">
                of {formatTime(analytics.totalEstimatedTime)} estimated
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</div>
                {analytics.overdueTasks > 0 && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="destructive" className="flex items-center gap-1">
                Urgent: {analytics.priorityBreakdown.urgent}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800">
                High: {analytics.priorityBreakdown.high}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
                Medium: {analytics.priorityBreakdown.medium}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                Low: {analytics.priorityBreakdown.low}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {uniqueAssignees.map(assignee => (
                    <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Lists */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList>
            <TabsTrigger value="kanban">Kanban View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Tasks */}
              <div className={commonSectionClass}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-yellow-500" />
                  Pending ({taskGroups.pending.length})
                </h3>
                <div className="space-y-4">
                  {taskGroups.pending.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No pending tasks</p>
                  ) : (
                    taskGroups.pending.map((task) => (
                      <EnhancedTaskItem
                        key={task.id}
                        task={task}
                        onToggleStatus={handleToggleTaskStatus}
                        onUpdateTime={handleUpdateTime}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* In Progress Tasks */}
              <div className={commonSectionClass}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  In Progress ({taskGroups.in_progress.length})
                </h3>
                <div className="space-y-4">
                  {taskGroups.in_progress.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No tasks in progress</p>
                  ) : (
                    taskGroups.in_progress.map((task) => (
                      <EnhancedTaskItem
                        key={task.id}
                        task={task}
                        onToggleStatus={handleToggleTaskStatus}
                        onUpdateTime={handleUpdateTime}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Completed Tasks */}
              <div className={commonSectionClass}>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Completed ({taskGroups.completed.length})
                </h3>
                <div className="space-y-4">
                  {taskGroups.completed.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No completed tasks</p>
                  ) : (
                    taskGroups.completed.map((task) => (
                      <EnhancedTaskItem
                        key={task.id}
                        task={task}
                        onToggleStatus={handleToggleTaskStatus}
                        onUpdateTime={handleUpdateTime}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className={commonSectionClass}>
              <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No tasks match your filters</p>
                ) : (
                  filteredTasks.map((task) => (
                    <EnhancedTaskItem
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleTaskStatus}
                      onUpdateTime={handleUpdateTime}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}