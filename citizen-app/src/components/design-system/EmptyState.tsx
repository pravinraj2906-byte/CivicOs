import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-card bg-white border border-[#E4E7EC] shadow-card ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-[#F0F5FA] border border-[#C3D5E9] flex items-center justify-center text-[#123B6D] mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#123B6D] mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-[#667085] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
