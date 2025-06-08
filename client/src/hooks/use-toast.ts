import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

const toasts: Toast[] = [];
const listeners: Array<(toasts: Toast[]) => void> = [];

let toastId = 0;

function dispatch(toast: Toast) {
  toasts.push(toast);
  listeners.forEach((listener) => listener([...toasts]));
}

function dismiss(id: string) {
  const index = toasts.findIndex((toast) => toast.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach((listener) => listener([...toasts]));
  }
}

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = useCallback(
    ({ ...props }: Omit<Toast, "id">) => {
      const id = (++toastId).toString();
      dispatch({ id, ...props });
      
      // Auto dismiss after 5 seconds
      setTimeout(() => dismiss(id), 5000);
      
      return { id, dismiss: () => dismiss(id) };
    },
    []
  );

  return { toast, toasts: toastList, subscribe };
}
