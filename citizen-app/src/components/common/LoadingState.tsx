import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  submessage,
}) => {
  const { language } = useAuth();

  const defaultMsg = language === 'ta' ? 'தகவல்கள் ஏற்றப்படுகின்றன...' : 'Loading your civic information...';
  const defaultSubMsg = language === 'ta' ? 'CivicOS சேவையகத்துடன் இணைகிறது...' : 'Please wait while we connect to CivicOS servers.';

  return (
    <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 animate-fadeIn">
      <div className="w-12 h-12 rounded-2xl bg-civic-50 border border-civic-200 flex items-center justify-center text-civic-600 shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{message || defaultMsg}</h3>
      <p className="text-xs text-slate-600 max-w-xs">{submessage || defaultSubMsg}</p>
    </div>
  );
};
