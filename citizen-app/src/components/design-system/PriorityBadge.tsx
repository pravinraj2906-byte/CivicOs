import React from 'react';
import { ArrowDown, ArrowUp, ChevronsUp, Minus } from 'lucide-react';

export interface PriorityBadgeProps {
  priority: string;
  size?: 'sm' | 'md' | 'lg';
  customLabel?: string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  customLabel,
  className = '',
}) => {
  const norm = (priority || '').toUpperCase();

  let config = {
    bg: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
    symbol: '↓',
    icon: <ArrowDown className="w-3.5 h-3.5 text-[#168447] flex-shrink-0" />,
    label: 'Low',
  };

  switch (norm) {
    case 'CRITICAL':
      config = {
        bg: 'bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5] font-extrabold',
        symbol: '↑↑',
        icon: <ChevronsUp className="w-4 h-4 text-[#DC2626] flex-shrink-0" />,
        label: 'Critical',
      };
      break;
    case 'HIGH':
      config = {
        bg: 'bg-[#FFF7ED] text-[#9A3412] border-[#FDBA74] font-bold',
        symbol: '↑',
        icon: <ArrowUp className="w-3.5 h-3.5 text-[#EA580C] flex-shrink-0" />,
        label: 'High',
      };
      break;
    case 'MEDIUM':
      config = {
        bg: 'bg-[#FEFCE8] text-[#854D0E] border-[#FDE047] font-semibold',
        symbol: '=',
        icon: <Minus className="w-3.5 h-3.5 text-[#CA8A04] flex-shrink-0" />,
        label: 'Medium',
      };
      break;
    case 'LOW':
    default:
      config = {
        bg: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] font-medium',
        symbol: '↓',
        icon: <ArrowDown className="w-3.5 h-3.5 text-[#168447] flex-shrink-0" />,
        label: 'Low',
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
      aria-label={`Priority: ${displayLabel}`}
    >
      <span className="font-mono font-bold select-none text-[11px] opacity-80" aria-hidden="true">
        {config.symbol}
      </span>
      <span>{displayLabel}</span>
    </span>
  );
};
