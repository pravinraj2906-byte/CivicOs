import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading details...',
  submessage = 'Connecting with CivicOS intelligence...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-12 rounded-card bg-white border border-[#E4E7EC] shadow-card ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FEF7EE] border border-[#FBD6B1] flex items-center justify-center text-[#F28C28] mb-4 shadow-xs animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <h4 className="text-base font-bold text-[#123B6D] mb-1">
        {message}
      </h4>
      {submessage && (
        <p className="text-xs text-[#667085] font-medium">{submessage}</p>
      )}
    </div>
  );
};
