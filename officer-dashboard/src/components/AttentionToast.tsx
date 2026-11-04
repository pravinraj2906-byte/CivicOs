import React from 'react';
import { AttentionItem } from '../utils/attentionRules';
import { useAuth } from '../context/AuthContext';
import { getLocalizedTitle } from '../i18n/formatters';
import { AlertOctagon, AlertTriangle, X, ArrowRight } from 'lucide-react';

interface AttentionToastProps {
  item: AttentionItem | null;
  onReview: (item: AttentionItem) => void;
  onDismiss: (id: string) => void;
}

export const AttentionToast: React.FC<AttentionToastProps> = ({
  item,
  onReview,
  onDismiss,
}) => {
  const { t, language } = useAuth();

  if (!item) return null;

  const isCritical = item.severity === 'CRITICAL';
  const displayTitle = getLocalizedTitle(item.title, language);

  return (
    <div
      role="alert"
      className="fixed bottom-5 right-5 z-40 max-w-md w-full sm:w-96 p-4 rounded-3xl bg-white border-2 shadow-elevated animate-slideUp space-y-3"
      style={{
        borderColor: isCritical ? '#fca5a5' : '#fed7aa',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {isCritical ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300">
              <AlertOctagon className="w-3.5 h-3.5 text-red-700" />
              <span>{t.newImportantProblem}</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-700" />
              <span>{t.categoryHigh}</span>
            </span>
          )}

          {item.urgencyPct !== null && item.urgencyPct !== undefined && (
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              {item.urgencyPct}% {t.aiUrgencyLabel}
            </span>
          )}
        </div>

        <button
          onClick={() => onDismiss(item.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={t.dismiss}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        {item.grievance && (
          <span className="font-mono text-[11px] font-bold text-civic-700 block mb-0.5">
            {item.grievance.tracking_id}
          </span>
        )}
        <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2">
          {displayTitle}
        </h4>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          {t.attentionRecommended}
        </p>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
        <button
          onClick={() => onDismiss(item.id)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          {t.dismiss}
        </button>
        <button
          onClick={() => onReview(item)}
          className={`flex items-center space-x-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
            isCritical
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          <span>{t.reviewNow}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
