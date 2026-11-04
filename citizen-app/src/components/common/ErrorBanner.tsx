import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { language } = useAuth();
  const defaultTitle = language === 'ta' ? 'தகவல்களை ஏற்றுவதில் சிக்கல்' : 'Unable to Load Information';
  const retryLabel = language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Try Again';

  return (
    <div
      role="alert"
      className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 shadow-sm space-y-3 animate-fadeIn my-4"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-sm text-red-950">{title || defaultTitle}</h4>
          <p className="text-xs text-red-800 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onRetry}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-sm min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{retryLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
