import React from 'react';
import { GrievanceStatus } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, Sparkles, XCircle, FileText } from 'lucide-react';

interface StatusBadgeProps {
  status: GrievanceStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useAuth();
  const norm = (status || '').toUpperCase();

  let config = {
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: <FileText className="w-4 h-4 text-slate-700" />,
    label: t.statusSubmitted,
  };

  switch (norm) {
    case 'RESOLVED':
      config = {
        bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold',
        icon: <CheckCircle className="w-4 h-4 text-emerald-700" />,
        label: t.statusResolved,
      };
      break;
    case 'IN_PROGRESS':
      config = {
        bg: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
        icon: <Clock className="w-4 h-4 text-amber-700" />,
        label: t.statusInProgress,
      };
      break;
    case 'TRIAGED':
      config = {
        bg: 'bg-blue-50 text-blue-900 border-blue-300 font-bold',
        icon: <Sparkles className="w-4 h-4 text-blue-700" />,
        label: t.statusTriaged,
      };
      break;
    case 'REJECTED':
      config = {
        bg: 'bg-red-50 text-red-900 border-red-300 font-bold',
        icon: <XCircle className="w-4 h-4 text-red-700" />,
        label: t.statusRejected,
      };
      break;
    case 'SUBMITTED':
    default:
      config = {
        bg: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
        icon: <FileText className="w-4 h-4 text-slate-700" />,
        label: t.statusSubmitted,
      };
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-sm px-3 py-1 space-x-1.5',
    lg: 'text-base px-3.5 py-1.5 space-x-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border shadow-sm ${config.bg} ${sizeClasses}`}
      aria-label={`Status: ${config.label}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
