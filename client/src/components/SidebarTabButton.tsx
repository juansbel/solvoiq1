import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarTabButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SidebarTabButton({ icon: Icon, label, isActive, onClick }: SidebarTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "text-white bg-primary-600"
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
