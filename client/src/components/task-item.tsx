import { Check } from "lucide-react";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleStatus: (taskId: number, newStatus: "pending" | "completed") => void;
}

export function TaskItem({ task, onToggleStatus }: TaskItemProps) {
  const isCompleted = task.status === "completed";

  const handleToggle = () => {
    onToggleStatus(task.id, isCompleted ? "pending" : "completed");
  };

  return (
    <div className={cn("border border-slate-200 rounded-lg p-4", isCompleted && "opacity-75")}>
      <div className="flex items-start space-x-3">
        <button
          onClick={handleToggle}
          className={cn(
            "w-5 h-5 border-2 rounded mt-0.5 flex items-center justify-center transition-colors",
            isCompleted
              ? "bg-green-500 border-green-500"
              : "border-slate-300 hover:border-primary"
          )}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </button>
        <div className="flex-1">
          <h4 className={cn("font-medium text-slate-900 mb-1", isCompleted && "line-through")}>
            {task.name}
          </h4>
          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
          <p className="text-xs text-slate-500">
            {isCompleted ? "Completed" : "Due"}: {task.suggestedDueDate}
          </p>
        </div>
      </div>
    </div>
  );
}
