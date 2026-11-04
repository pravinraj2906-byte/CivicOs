import React from 'react';
import { CheckCircle2, Clock, Sparkles, User, ShieldCheck } from 'lucide-react';

export interface TimelineEventItem {
  id: number;
  status: string;
  remarks?: string;
  timestamp: string;
  officer_name?: string;
}

export interface TimelineProps {
  events: TimelineEventItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, className = '' }) => {
  if (!events || events.length === 0) {
    return (
      <p className="text-xs text-[#667085] italic py-2">No timeline updates recorded yet.</p>
    );
  }

  const getStatusNode = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'RESOLVED') {
      return {
        bg: 'bg-[#168447] text-white',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      };
    }
    if (s === 'IN_PROGRESS') {
      return {
        bg: 'bg-[#F28C28] text-white',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
    }
    if (s === 'TRIAGED' || s === 'UNDER_REVIEW') {
      return {
        bg: 'bg-[#123B6D] text-white',
        icon: <Sparkles className="w-3.5 h-3.5" />,
      };
    }
    return {
      bg: 'bg-[#667085] text-white',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    };
  };

  return (
    <div className={`space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#E4E7EC] ${className}`}>
      {events.map((evt, idx) => {
        const node = getStatusNode(evt.status);
        return (
          <div key={evt.id || idx} className="relative flex items-start space-x-3 pl-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-xs ${node.bg}`}
              aria-hidden="true"
            >
              {node.icon}
            </div>
            <div className="flex-1 bg-[#F7F9FC] rounded-button p-3 border border-[#E4E7EC]">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-[#123B6D] uppercase tracking-wide">
                  {evt.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-[#667085] font-medium">
                  {evt.timestamp}
                </span>
              </div>
              {evt.remarks && (
                <p className="text-xs text-[#172033] mt-1 font-medium leading-relaxed">
                  {evt.remarks}
                </p>
              )}
              {evt.officer_name && (
                <div className="flex items-center space-x-1 mt-1.5 text-[11px] text-[#667085] font-medium">
                  <User className="w-3 h-3" />
                  <span>By Officer {evt.officer_name}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
