import React from 'react';
import { CheckCircle2, Clock, Sparkles, XCircle, FileText } from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  customLabel,
  className = '',
}) => {
  const norm = (status || '').toUpperCase();

  let config = {
    bg: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
    icon: <FileText className="w-3.5 h-3.5 text-[#475569] flex-shrink-0" />,
    label: 'Submitted',
  };

  switch (norm) {
    case 'RESOLVED':
      config = {
        bg: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] font-bold',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#168447] flex-shrink-0" />,
        label: 'Resolved',
      };
      break;
    case 'IN_PROGRESS':
      config = {
        bg: 'bg-[#FEF7EE] text-[#9A3412] border-[#FBD6B1] font-bold',
        icon: <Clock className="w-3.5 h-3.5 text-[#F28C28] flex-shrink-0" />,
        label: 'In Progress',
      };
      break;
    case 'TRIAGED':
    case 'UNDER_REVIEW':
      config = {
        bg: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] font-bold',
        icon: <Sparkles className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />,
        label: 'Under Review',
      };
      break;
    case 'REJECTED':
    case 'CLOSED':
      config = {
        bg: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] font-bold',
        icon: <XCircle className="w-3.5 h-3.5 text-[#DC2626] flex-shrink-0" />,
        label: 'Closed',
      };
      break;
    case 'SUBMITTED':
    default:
      config = {
        bg: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1] font-semibold',
        icon: <FileText className="w-3.5 h-3.5 text-[#475569] flex-shrink-0" />,
        label: 'Submitted',
      };
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1',
    md: 'text-sm px-2.5 py-1 space-x-1.5',
    lg: 'text-base px-3.5 py-1.5 space-x-2',
  }[size];

  const displayLabel = customLabel || config.label;

  return (
    <span
      className={`inline-flex items-center rounded-control border shadow-xs ${config.bg} ${sizeClasses} ${className}`}
      aria-label={`Status: ${displayLabel}`}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
};
