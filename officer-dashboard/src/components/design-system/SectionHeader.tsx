import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { IconButton } from './IconButton';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  onBack,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E4E7EC] ${className}`}>
      <div className="flex items-center space-x-3">
        {onBack && (
          <IconButton
            aria-label="Go back"
            icon={<ArrowLeft className="w-5 h-5 text-[#123B6D]" />}
            onClick={onBack}
            variant="secondary"
            size="sm"
          />
        )}
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#123B6D] tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#667085] font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
