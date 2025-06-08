import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  id: number;
  name: string;
  description: string;
  suggestedDueDate?: string;
  status: "pending" | "completed";
  onToggleStatus: (id: number) => void;
}

export function TaskItem({ 
  id, 
  name, 
  description, 
  suggestedDueDate, 
  status, 
  onToggleStatus 
}: TaskItemProps) {
  const isCompleted = status === "completed";

  return (
    <div className={cn(
      "border border-slate-200 rounded-lg p-4",
      isCompleted && "opacity-75"
    )}>
      <div className="flex items-start space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-5 h-5 p-0 border-2 rounded mt-0.5",
            isCompleted 
              ? "bg-green-500 border-green-500" 
              : "border-slate-300 hover:border-primary"
          )}
          onClick={() => onToggleStatus(id)}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </Button>
        <div className="flex-1">
          <h4 className={cn(
            "font-medium text-slate-900 mb-1",
            isCompleted && "line-through"
          )}>
            {name}
          </h4>
          <p className="text-sm text-slate-600 mb-2">{description}</p>
          {suggestedDueDate && (
            <p className="text-xs text-slate-500">
              {isCompleted ? "Completed:" : "Due:"} {suggestedDueDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
