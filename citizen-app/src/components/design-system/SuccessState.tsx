import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export interface SuccessStateProps {
  title: string;
  message: string;
  trackingId?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  message,
  trackingId,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-card bg-white border border-[#E4E7EC] shadow-card ${className}`}>
      <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#168447] mb-4 shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-[#123B6D] mb-2">
        {title}
      </h3>
      {trackingId && (
        <div className="inline-block px-3 py-1 mb-3 rounded-control bg-[#F0F5FA] border border-[#C3D5E9] font-mono font-bold text-sm text-[#123B6D]">
          {trackingId}
        </div>
      )}
      <p className="text-sm text-[#667085] max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
