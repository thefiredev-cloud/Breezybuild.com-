'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastIcons: Record<ToastType, typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-500',
    border: 'border-green-200',
  },
  error: {
    bg: 'bg-red-50',
    icon: 'text-red-500',
    border: 'border-red-200',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    border: 'border-amber-200',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    border: 'border-blue-200',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-4 shadow-lg max-w-sm w-full animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-zinc-600 mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message, duration: 8000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Standalone toast function for use outside React components
let globalToast: ToastContextValue | null = null;

export function setGlobalToast(toast: ToastContextValue) {
  globalToast = toast;
}

export const toast = {
  success: (title: string, message?: string) => globalToast?.success(title, message),
  error: (title: string, message?: string) => globalToast?.error(title, message),
  warning: (title: string, message?: string) => globalToast?.warning(title, message),
  info: (title: string, message?: string) => globalToast?.info(title, message),
};
