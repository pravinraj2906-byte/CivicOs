import React, { useState, useEffect } from 'react';
import { Grievance, GrievanceDetail } from '../../types/api';
import { apiService } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AITriageCard } from '../../components/cards/AITriageCard';
import { TimelineStepper } from '../../components/cards/TimelineStepper';
import { ResolutionSummaryCard } from '../../components/cards/ResolutionSummaryCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ArrowLeft, RotateCw, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getLocalizedTitle,
  getLocalizedDescription,
  getLocalizedLocation,
} from '../../i18n/formatters';

interface GrievanceDetailViewProps {
  grievanceSummary: Grievance;
  onBack: () => void;
}

export const GrievanceDetailView: React.FC<GrievanceDetailViewProps> = ({
  grievanceSummary,
  onBack,
}) => {
  const { t, language } = useAuth();
  const [detail, setDetail] = useState<GrievanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiService.getGrievanceDetail(grievanceSummary.id);
      setDetail(data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail ||
        err.message ||
        (language === 'ta'
          ? 'புகார் விவரங்களை ஏற்றுவதில் தோல்வி ஏற்பட்டது. இணைய இணைப்பை சரிபார்க்கவும்.'
          : 'Unable to load grievance details. Please check your network connection.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [grievanceSummary.id]);

  const activeData = detail || (grievanceSummary as unknown as GrievanceDetail);

  const dateStr = new Date(activeData.created_at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Dynamic presentation localization for title, description, and location
  const displayTitle = getLocalizedTitle(activeData.title, language);
  const displayDescription = getLocalizedDescription(activeData.description, language);
  const rawLocation = [
    activeData.location,
    activeData.landmark ? `${t.landmarkPrefix} ${activeData.landmark}` : null,
  ]
    .filter(Boolean)
    .join(' • ');
  const displayLocation = getLocalizedLocation(rawLocation, language);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToMyGrievances}</span>
        </button>

        <button
          onClick={fetchDetail}
          title={t.refresh}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t.refresh}
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {errorMessage && (
        <ErrorBanner
          title={t.failedToRefresh}
          message={errorMessage}
          onRetry={fetchDetail}
        />
      )}

      {isLoading && !detail ? (
        <LoadingState message={t.fetchingTimeline} />
      ) : (
        <>
          {/* Main Title & Status Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-extrabold text-civic-700 bg-civic-50 px-3 py-1 rounded-lg border border-civic-200">
                  {activeData.tracking_id}
                </span>
                <StatusBadge status={activeData.status} size="md" />
              </div>

              <div className="flex items-center text-xs text-slate-500 font-medium space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.lodgedOn} {dateStr}</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {displayTitle}
              </h1>
            </div>

            {/* Location & Landmark */}
            {displayLocation && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-2 text-xs text-slate-800">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{t.reportedLocation}</span>
                  <span>{displayLocation}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.problemDescription}
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-medium">
                {displayDescription}
              </p>
            </div>
          </div>

          {/* Dedicated Resolution Outcome & Feedback Card (Phase 2C Closed Loop) */}
          {detail && detail.status === 'RESOLVED' && (
            <ResolutionSummaryCard
              grievance={detail}
              onGrievanceUpdated={(updated) => setDetail(updated)}
            />
          )}

          {/* AI Triage Card */}
          {detail && <AITriageCard grievance={detail} />}

          {/* Resolution Timeline */}
          {detail && detail.updates && detail.updates.length > 0 && (
            <TimelineStepper updates={detail.updates} />
          )}
        </>
      )}
    </div>
  );
};
