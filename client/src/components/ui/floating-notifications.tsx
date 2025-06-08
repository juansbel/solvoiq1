import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, DollarSign, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloatingNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'revenue' | 'client';
  title: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  persistent?: boolean;
}

interface FloatingNotificationsProps {
  notifications: FloatingNotification[];
  onDismiss: (id: string) => void;
  maxVisible?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
  revenue: DollarSign,
  client: Users
};

const styleMap = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
    icon: 'text-green-600 dark:text-green-400'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
    icon: 'text-yellow-600 dark:text-yellow-400'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    icon: 'text-red-600 dark:text-red-400'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400'
  },
  revenue: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-100',
    icon: 'text-emerald-600 dark:text-emerald-400'
  },
  client: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-100',
    icon: 'text-purple-600 dark:text-purple-400'
  }
};

const positionMap = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4'
};

export function FloatingNotifications({
  notifications,
  onDismiss,
  maxVisible = 5,
  position = 'top-right'
}: FloatingNotificationsProps) {
  const visibleNotifications = notifications.slice(0, maxVisible);

  const handleDismiss = useCallback((id: string) => {
    onDismiss(id);
  }, [onDismiss]);

  return (
    <div className={cn('fixed z-50 space-y-2 pointer-events-none', positionMap[position])}>
      <AnimatePresence>
        {visibleNotifications.map((notification) => {
          const Icon = iconMap[notification.type];
          const styles = styleMap[notification.type];

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'w-80 max-w-sm pointer-events-auto',
                'border rounded-lg shadow-lg backdrop-blur-sm',
                styles.bg,
                styles.border
              )}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icon className={cn('h-5 w-5', styles.icon)} />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className={cn('text-sm font-medium', styles.text)}>
                      {notification.title}
                    </h3>
                    <p className={cn('mt-1 text-sm opacity-80', styles.text)}>
                      {notification.message}
                    </p>
                    {notification.actionLabel && notification.onAction && (
                      <div className="mt-3">
                        <button
                          onClick={notification.onAction}
                          className={cn(
                            'text-sm font-medium underline hover:no-underline',
                            styles.icon
                          )}
                        >
                          {notification.actionLabel}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className={cn(
                        'rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
                        styles.text,
                        'hover:opacity-75'
                      )}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useFloatingNotifications() {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  const addNotification = useCallback((notification: Omit<FloatingNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: FloatingNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    setNotifications(prev => [newNotification, ...prev]);

    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, newNotification.duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, options?: Partial<FloatingNotification>) => {
    addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<FloatingNotification>) => {
    addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<FloatingNotification>) => {
    addNotification({ type: 'error', title, message, ...options });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<FloatingNotification>) => {
    addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  const showRevenue = useCallback((title: string, message: string, options?: Partial<FloatingNotification>) => {
    addNotification({ type: 'revenue', title, message, ...options });
  }, [addNotification]);

  const showClient = useCallback((title: string, message: string, options?: Partial<FloatingNotification>) => {
    addNotification({ type: 'client', title, message, ...options });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    showRevenue,
    showClient
  };
}