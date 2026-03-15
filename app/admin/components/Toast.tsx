'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, InfoCircle, AlertTriangle, X } from '@untitledui/icons';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-success-primary',
    bg: 'bg-success-secondary',
    border: 'border-success-primary/20',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-error-primary',
    bg: 'bg-error-secondary',
    border: 'border-error-primary/20',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warning-primary',
    bg: 'bg-warning-secondary',
    border: 'border-warning-primary/20',
  },
  info: {
    icon: InfoCircle,
    iconColor: 'text-primary',
    bg: 'bg-primary-secondary',
    border: 'border-primary/20',
  },
};

export default function Toast({
  id,
  variant,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
