import { useState, useEffect } from "react";
import { BrainCircuit, LayoutDashboard, Users, UserCheck, CheckSquare, Edit3, Send, Search, FileText, Bookmark, Settings, User, DollarSign, ExternalLink, Home, BarChart3, Brain, ChevronDown, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ activeTab, onTabChange, isOpen = false, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { isMobile } = useMobile();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Executive Intelligence": false,
    "Business Operations": false,
    "AI Communication Tools": false,
    "Integrations & Settings": false,
  });

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Quick access items that are always visible
  const quickAccessItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "clients", label: "Clients", icon: Users },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "knowledge", label: "Knowledge", icon: Bookmark },
  ];

  const navigationSections = [
    {
      title: "Executive Intelligence",
      items: [
        { id: "analytics", label: "Analytics Dashboard", icon: BarChart3 },
        { id: "advanced-analytics", label: "Advanced Analytics", icon: BarChart3 },
        { id: "automation", label: "AI Automation Hub", icon: Brain },
      ]
    },
    {
      title: "Business Operations",
      items: [
        { id: "team", label: "Team Management", icon: UserCheck },
        { id: "projects", label: "Project Management", icon: CheckSquare },
        { id: "workflows", label: "Workflow Automation", icon: Brain },
        { id: "commission", label: "Commission Tracking", icon: DollarSign },
        { id: "report", label: "Business Reports", icon: FileText },
      ]
    },
    {
      title: "AI Communication Tools",
      items: [
        { id: "rewrite", label: "Email Rewriter", icon: Edit3 },
        { id: "followup", label: "Follow-up Generator", icon: Send },
        { id: "analyze", label: "Email Analyzer", icon: Search },
        { id: "templates", label: "Email Templates", icon: Bookmark },
      ]
    },
    {
      title: "Integrations & Settings",
      items: [
        { id: "jira", label: "Jira Integration", icon: ExternalLink },
        { id: "settings", label: "AI Configuration", icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          w-64 bg-white border-r border-slate-200 h-screen flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out z-50
          ${isMobile ? 'inset-y-0 left-0' : ''}
        `}
      >
        {/* Mobile close button */}
        {isMobile && (
          <div className="flex justify-end p-4 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Brand Header */}
        <div className={`p-6 border-b border-slate-200 ${isMobile ? 'pt-2' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">SolvoIQ</h1>
            <p className="text-xs text-slate-500">Intelligence Operations Dashboard</p>
          </div>
        </div>
      </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
        {/* Quick Access Section */}
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
            Quick Access
          </h3>
          <div className="space-y-1">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "text-white bg-primary shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="p-4 space-y-4">
          {navigationSections.map((section) => {
            const isExpanded = expandedSections[section.title];
            
            return (
              <div key={section.title} className="space-y-2">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50"
                >
                  <span>{section.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="space-y-1 pl-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => onTabChange(item.id)}
                          className={cn(
                            "w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            isActive
                              ? "text-white bg-primary shadow-sm"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.email || "Sample User"}
            </p>
            <p className="text-xs text-slate-500">Authenticated User</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            © 2024 Juan Belalcazar - Operations Supervisor
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
