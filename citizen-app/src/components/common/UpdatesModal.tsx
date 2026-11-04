import React, { useState, useEffect } from 'react';
import { Grievance } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, X, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { getLocalizedTitle } from '../../i18n/formatters';

interface UpdatesModalProps {
  onClose: () => void;
  onSelectGrievance?: (g: Grievance) => void;
}

export const UpdatesModal: React.FC<UpdatesModalProps> = ({ onClose, onSelectGrievance }) => {
  const { t, language } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiService.getMyGrievances();
        if (mounted) setGrievances(data);
      } catch {
        // Fallback gracefully
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter grievances that have updates or are in progress/resolved
  const activeUpdates = grievances.filter(
    (g) => g.status === 'IN_PROGRESS' || g.status === 'RESOLVED' || g.status === 'TRIAGED'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-civic-50 border border-civic-200 flex items-center justify-center text-civic-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {t.inAppUpdatesTitle || 'CivicOS Updates'}
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {language === 'ta' ? 'உங்கள் புகார்களின் நேரலை நிலை' : 'Live updates on your reports'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={t.close || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
              <Activity className="w-4 h-4 animate-spin text-civic-600" />
              <span>{t.loading || 'Loading updates...'}</span>
            </div>
          ) : activeUpdates.length > 0 ? (
            activeUpdates.map((g) => {
              const isResolved = g.status === 'RESOLVED';
              const isInProgress = g.status === 'IN_PROGRESS';
              const localizedTitle = getLocalizedTitle(g.title, language);

              return (
                <div
                  key={g.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isResolved
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isInProgress
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-bold text-civic-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {g.tracking_id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isResolved
                        ? language === 'ta'
                          ? 'தீர்க்கப்பட்டது'
                          : 'Resolved'
                        : isInProgress
                        ? language === 'ta'
                          ? 'நடவடிக்கையில்'
                          : 'In Progress'
                        : language === 'ta'
                        ? 'ஒதுக்கப்பட்டது'
                        : 'Triaged'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {localizedTitle}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {isResolved
                      ? language === 'ta'
                        ? 'உங்கள் புகார் மீது கள நடவடிக்கை எடுக்கப்பட்டு தீர்வு பதிவு செய்யப்பட்டுள்ளது.'
                        : 'Field repair and resolution completed. View resolution details.'
                      : isInProgress
                      ? language === 'ta'
                        ? 'உங்கள் புகாரை சரிபார்க்க துறை அலுவலர் களப் பணிகளை தொடங்கியுள்ளார்.'
                        : 'Department officer has started field operations on your issue.'
                      : language === 'ta'
                      ? 'புகார் பெறப்பட்டு உரிய துறைக்கு அனுப்பப்பட்டுள்ளது.'
                      : 'Report analyzed and assigned to department.'}
                  </p>

                  {onSelectGrievance && (
                    <button
                      onClick={() => {
                        onSelectGrievance(g);
                        onClose();
                      }}
                      className="w-full flex items-center justify-center space-x-1 py-1.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all min-h-[36px]"
                    >
                      <span>{language === 'ta' ? 'விவரங்களை காண்க' : 'View Timeline'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                {t.noUpdatesYet || 'No recent updates on your reports.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition-all min-h-[40px]"
          >
            {t.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
