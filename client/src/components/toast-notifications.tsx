import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  DollarSign,
  Users,
  Clock,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastNotification {
  id: string;
  type: "success" | "warning" | "error" | "info" | "revenue" | "client";
  title: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastNotificationsProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

const TOAST_DURATION = 5000; // 5 seconds

export function ToastNotifications({ notifications, onDismiss }: ToastNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);

    // Auto-dismiss notifications after duration
    notifications.forEach(notification => {
      const duration = notification.duration || TOAST_DURATION;
      setTimeout(() => {
        onDismiss(notification.id);
      }, duration);
    });
  }, [notifications, onDismiss]);

  const getToastIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "revenue":
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case "client":
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-orange-200 bg-orange-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "revenue":
        return "border-blue-200 bg-blue-50";
      case "client":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            "p-4 shadow-lg animate-in slide-in-from-right-5 duration-300",
            getToastStyles(notification.type)
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getToastIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-slate-700 mb-3">
                {notification.message}
              </p>
              {notification.actionLabel && notification.onAction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={notification.onAction}
                  className="mr-2"
                >
                  {notification.actionLabel}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-6 w-6 p-0 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Hook for managing toast notifications
export function useToastNotifications() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  // Predefined notification types for common business events
  const showSuccess = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addNotification({ type: "success", title, message, ...options });
  };

  const showWarning = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addNotification({ type: "warning", title, message, ...options });
  };

  const showError = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addNotification({ type: "error", title, message, ...options });
  };

  const showRevenue = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addNotification({ type: "revenue", title, message, ...options });
  };

  const showClient = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addNotification({ type: "client", title, message, ...options });
  };

  const showChurnAlert = (clientName: string, onNavigate?: () => void) => {
    return addNotification({
      type: "warning",
      title: "Client Churn Risk",
      message: `${clientName} shows decreased engagement patterns`,
      actionLabel: "View Details",
      onAction: onNavigate,
      duration: 8000 // Longer duration for important alerts
    });
  };

  const showOpportunity = (clientName: string, opportunity: string, onNavigate?: () => void) => {
    return addNotification({
      type: "success",
      title: "New Opportunity",
      message: `${clientName}: ${opportunity}`,
      actionLabel: "View Analytics",
      onAction: onNavigate,
      duration: 10000
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    showSuccess,
    showWarning,
    showError,
    showRevenue,
    showClient,
    showChurnAlert,
    showOpportunity
  };
}