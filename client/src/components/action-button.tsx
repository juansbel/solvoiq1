import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  icon: Icon,
  children,
  className,
  size = "md"
}: ActionButtonProps) {
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "font-medium flex items-center justify-center space-x-2",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </Button>
  );
}
