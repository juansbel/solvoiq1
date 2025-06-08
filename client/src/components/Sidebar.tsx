import { BrainCircuit, LayoutDashboard, Users, UserCheck, CheckSquare, Edit3, Send, Search, FileText, Bookmark, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "team", label: "Team", icon: UserCheck },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "rewrite", label: "Rewrite Email", icon: Edit3 },
  { id: "followup", label: "Follow-up", icon: Send },
  { id: "analyze", label: "Analyze Email", icon: Search },
  { id: "report", label: "Report", icon: FileText },
  { id: "templates", label: "Templates", icon: Bookmark },
  { id: "settings", label: "AI Settings", icon: Settings },
];

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Client Hub AI</h1>
            <p className="text-xs text-slate-500">Communication Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start space-x-3",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-slate-700 hover:bg-slate-100"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Sample User</p>
            <p className="text-xs text-slate-500">Sample Data Mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
