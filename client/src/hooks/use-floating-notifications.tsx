import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationAction {
  actionLabel: string;
  onAction: () => void;
  duration?: number;
}

interface FloatingNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  action?: NotificationAction;
  timestamp: Date;
}

export function useFloatingNotifications() {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const { toast } = useToast();

  const showNotification = useCallback((
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    action?: NotificationAction
  ) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: FloatingNotification = {
      id,
      title,
      message,
      type,
      action,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Show toast notification
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
      action: action ? action.actionLabel : undefined
    });

    // Auto-remove notification after duration
    const duration = action?.duration || 5000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);

    return id;
  }, [toast]);

  const showClient = useCallback((
    title: string,
    message: string,
    action?: NotificationAction
  ) => {
    return showNotification(title, message, 'info', action);
  }, [showNotification]);

  const showTask = useCallback((
    title: string,
    message: string,
    action?: NotificationAction
  ) => {
    return showNotification(title, message, 'warning', action);
  }, [showNotification]);

  const showTeam = useCallback((
    title: string,
    message: string,
    action?: NotificationAction
  ) => {
    return showNotification(title, message, 'info', action);
  }, [showNotification]);

  const showError = useCallback((
    title: string,
    message: string,
    action?: NotificationAction
  ) => {
    return showNotification(title, message, 'error', action);
  }, [showNotification]);

  const showSuccess = useCallback((
    title: string,
    message: string,
    action?: NotificationAction
  ) => {
    return showNotification(title, message, 'success', action);
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    showClient,
    showTask,
    showTeam,
    showError,
    showSuccess,
    dismissNotification,
    clearAll
  };
}