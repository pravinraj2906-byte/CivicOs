import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-card space-y-4 my-4 animate-fadeIn">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-civic-50 border border-civic-100 flex items-center justify-center text-civic-600 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="px-6 py-3 rounded-2xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-sm shadow-touch transition-all min-h-[48px] touch-active"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};
