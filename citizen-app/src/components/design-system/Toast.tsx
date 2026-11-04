import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const config = {
    success: {
      bg: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#168447] flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-[#FEF7EE] border-[#FBD6B1] text-[#9A3412]',
      icon: <AlertCircle className="w-5 h-5 text-[#F28C28] flex-shrink-0" />,
    },
    error: {
      bg: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />,
    },
    info: {
      bg: 'bg-[#F0F5FA] border-[#C3D5E9] text-[#123B6D]',
      icon: <Info className="w-5 h-5 text-[#123B6D] flex-shrink-0" />,
    },
  }[type];

  return (
    <div
      className={`flex items-start justify-between gap-3 p-4 rounded-button border shadow-card animate-fadeIn ${config.bg} ${className}`}
      role="status"
    >
      <div className="flex items-start space-x-3">
        {config.icon}
        <div>
          <h5 className="text-sm font-bold">{title}</h5>
          {message && <p className="text-xs mt-0.5 opacity-90">{message}</p>}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="p-1 rounded-md hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
