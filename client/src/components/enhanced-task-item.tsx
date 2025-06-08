import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  Check, 
  Clock, 
  User, 
  Tag, 
  Calendar,
  AlertCircle,
  Flag
} from "lucide-react";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EnhancedTaskItemProps {
  task: Task;
  onToggleStatus: (taskId: number, newStatus: "pending" | "completed" | "in_progress") => void;
  onUpdateTime: (taskId: number, timeSpent: number) => void;
}

export function EnhancedTaskItem({ task, onToggleStatus, onUpdateTime }: EnhancedTaskItemProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimeSpent, setCurrentTimeSpent] = useState(task.timeSpent || 0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";
  const estimatedMinutes = task.estimatedMinutes || 30;
  const progressPercentage = Math.min((currentTimeSpent / estimatedMinutes) * 100, 100);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && sessionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionTime = Math.floor((now - sessionStartTime) / (1000 * 60)); // Convert to minutes
        setCurrentTimeSpent((task.timeSpent || 0) + sessionTime);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, sessionStartTime, task.timeSpent]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setSessionStartTime(Date.now());
    if (task.status === "pending") {
      onToggleStatus(task.id, "in_progress");
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    if (sessionStartTime) {
      const sessionTime = Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
      const newTimeSpent = (task.timeSpent || 0) + sessionTime;
      onUpdateTime(task.id, newTimeSpent);
      setSessionStartTime(null);
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    if (sessionStartTime) {
      const sessionTime = Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
      const newTimeSpent = (task.timeSpent || 0) + sessionTime;
      onUpdateTime(task.id, newTimeSpent);
      setSessionStartTime(null);
    }
  };

  const handleToggleComplete = () => {
    if (isTimerRunning) {
      handleStopTimer();
    }
    onToggleStatus(task.id, isCompleted ? "pending" : "completed");
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "client": return "bg-blue-100 text-blue-800";
      case "admin": return "bg-purple-100 text-purple-800";
      case "marketing": return "bg-pink-100 text-pink-800";
      case "development": return "bg-indigo-100 text-indigo-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className={cn(
      "border border-slate-200 rounded-lg p-4 transition-all duration-200",
      isCompleted && "opacity-75 bg-slate-50",
      isInProgress && "border-blue-300 bg-blue-50",
      isOverdue && "border-red-300 bg-red-50"
    )}>
      {/* Header with priority and status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleComplete}
            className={cn(
              "w-5 h-5 border-2 rounded mt-0.5 flex items-center justify-center transition-colors",
              isCompleted
                ? "bg-green-500 border-green-500"
                : "border-slate-300 hover:border-primary"
            )}
          >
            {isCompleted && <Check className="w-3 h-3 text-white" />}
          </button>
          
          <div className="flex items-center gap-1">
            <Badge className={cn("text-xs", getPriorityColor(task.priority || "medium"))}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority || "medium"}
            </Badge>
            
            {task.category && (
              <Badge variant="outline" className={cn("text-xs", getCategoryColor(task.category))}>
                {task.category}
              </Badge>
            )}
            
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-1">
          {!isCompleted && (
            <>
              {!isTimerRunning ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartTimer}
                  className="h-8 px-2"
                >
                  <Play className="w-3 h-3" />
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePauseTimer}
                    className="h-8 px-2"
                  >
                    <Pause className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleStopTimer}
                    className="h-8 px-2"
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="space-y-3">
        <div>
          <h4 className={cn(
            "font-medium text-slate-900 mb-1",
            isCompleted && "line-through"
          )}>
            {task.name}
          </h4>
          <p className="text-sm text-slate-600">{task.description}</p>
        </div>

        {/* Time Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3 h-3" />
                {formatTime(currentTimeSpent)} / {formatTime(estimatedMinutes)}
              </span>
              {isTimerRunning && (
                <span className="flex items-center gap-1 text-blue-600 animate-pulse">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  Running
                </span>
              )}
            </div>
            <span className="text-slate-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            {task.assignedTo && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assignedTo}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{task.tags.slice(0, 2).join(", ")}</span>
              {task.tags.length > 2 && <span>+{task.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}