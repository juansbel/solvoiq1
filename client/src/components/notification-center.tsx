import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Clock, 
  Target,
  CheckCircle,
  X,
  Settings,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "alert" | "opportunity" | "task" | "client" | "revenue" | "system";
  title: string;
  message: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
  read: boolean;
  actionable: boolean;
  relatedPage?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  onNavigate?: (page: string) => void;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Client Churn Risk Detected",
    message: "TechCorp Industries shows 40% engagement drop in last 7 days",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    priority: "high",
    read: false,
    actionable: true,
    relatedPage: "clients",
    metadata: { clientId: 1 }
  },
  {
    id: "2",
    type: "opportunity",
    title: "Premium Upgrade Opportunity",
    message: "StartupXYZ shows 85% probability for premium upgrade",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    priority: "medium",
    read: false,
    actionable: true,
    relatedPage: "analytics",
    metadata: { opportunity: "premium_upgrade" }
  },
  {
    id: "3",
    type: "revenue",
    title: "Monthly Target Achievement",
    message: "97.5% of monthly revenue target achieved with 5 days remaining",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    priority: "medium",
    read: true,
    actionable: false,
    relatedPage: "commission"
  },
  {
    id: "4",
    type: "task",
    title: "High Priority Task Overdue",
    message: "Follow-up call with Global Solutions is 2 days overdue",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    priority: "high",
    read: false,
    actionable: true,
    relatedPage: "tasks",
    metadata: { taskId: 3 }
  },
  {
    id: "5",
    type: "client",
    title: "New Client Onboarded",
    message: "Innovation Labs successfully onboarded with premium package",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    priority: "low",
    read: true,
    actionable: false,
    relatedPage: "clients"
  },
  {
    id: "6",
    type: "system",
    title: "AI Automation Update",
    message: "12 new automation rules activated, saving 34h/week",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    priority: "low",
    read: true,
    actionable: false,
    relatedPage: "automation"
  }
];

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === "high" && !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "high":
        return notification.priority === "high";
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "opportunity":
        return <Target className="h-4 w-4 text-green-500" />;
      case "revenue":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "task":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "client":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "system":
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionable && notification.relatedPage && onNavigate) {
      onNavigate(notification.relatedPage);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 shadow-xl border-0 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {highPriorityCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {highPriorityCount} urgent
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mt-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("high")}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgent
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="mt-2 self-start"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="space-y-1 p-4 pt-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all cursor-pointer hover:bg-slate-50",
                        !notification.read ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200",
                        notification.actionable ? "hover:border-blue-300" : ""
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                              "text-sm font-medium truncate",
                              !notification.read ? "text-slate-900" : "text-slate-700"
                            )}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getPriorityColor(notification.priority))}
                              >
                                {notification.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-slate-200"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionable && (
                              <Badge variant="outline" className="text-xs">
                                Click to view
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}