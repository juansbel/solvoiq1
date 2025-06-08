import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import { useToast, ToastMessage } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastMessage['type'], React.ElementType> = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
};

const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const Icon = ICONS[toast.type];

    useEffect(() => {
        if (toast.duration) {
            const timer = setTimeout(() => {
                onDismiss(toast.id);
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5",
                {
                    'bg-green-50 text-green-800': toast.type === 'success',
                    'bg-red-50 text-red-800': toast.type === 'error',
                    'bg-yellow-50 text-yellow-800': toast.type === 'warning',
                    'bg-blue-50 text-blue-800': toast.type === 'info',
                }
            )}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{toast.title}</p>
                        <p className="mt-1 text-sm">{toast.message}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const ToastNotifications: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
        >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};