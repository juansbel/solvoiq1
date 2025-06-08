import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function ActionButton({
  variant = "primary",
  icon: Icon,
  children,
  isLoading = false,
  disabled = false,
  className,
  onClick,
  type = "button"
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  
  return (
    <Button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "font-medium flex items-center space-x-2",
        isPrimary 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        className
      )}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </Button>
  );
}
