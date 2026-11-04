import React from 'react';
import { GrievancePriority } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: GrievancePriority | string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const { t } = useAuth();
  const norm = (priority || '').toUpperCase();

  let config = {
    bg: 'bg-slate-100 text-slate-900 border-slate-300 font-semibold',
    icon: <Info className="w-3.5 h-3.5 text-slate-700" />,
    label: t.priorityLow,
  };

  switch (norm) {
    case 'CRITICAL':
      config = {
        bg: 'bg-red-50 text-red-950 border-red-400 font-extrabold',
        icon: <AlertCircle className="w-4 h-4 text-red-700" />,
        label: t.priorityCritical,
      };
      break;
    case 'HIGH':
      config = {
        bg: 'bg-orange-50 text-orange-950 border-orange-400 font-bold',
        icon: <AlertTriangle className="w-4 h-4 text-orange-700" />,
        label: t.priorityHigh,
      };
      break;
    case 'MEDIUM':
      config = {
        bg: 'bg-amber-50 text-amber-950 border-amber-400 font-bold',
        icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
        label: t.priorityMedium,
      };
      break;
    case 'LOW':
    default:
      config = {
        bg: 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
        icon: <Info className="w-3.5 h-3.5 text-slate-600" />,
        label: t.priorityLow,
      };
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-sm px-2.5 py-1 space-x-1.5',
    lg: 'text-base px-3 py-1.5 space-x-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border ${config.bg} ${sizeClasses}`}
      aria-label={config.label}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
