import React, { useState } from 'react';
import { CivicFeedItem } from '../../types/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { UrgencyGauge } from '../common/UrgencyGauge';
import {
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Building,
  Check,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getLocalizedDepartment,
  getLocalizedTitle,
  getLocalizedDescription,
  formatLocationWithLandmark,
  formatFeedDate,
  formatFeedRemarks,
  formatFeedTimelineStage,
  getLocalizedLocation,
} from '../../i18n/formatters';

interface CivicFeedCardProps {
  item: CivicFeedItem;
  onConfirm: (item: CivicFeedItem) => Promise<void>;
  onClickDetail: (item: CivicFeedItem) => void;
}

export const CivicFeedCard: React.FC<CivicFeedCardProps> = ({
  item,
  onConfirm,
  onClickDetail,
}) => {
  const { t, language } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);

  const dateStr = formatFeedDate(item.created_at, language);
  const displayTitle = getLocalizedTitle(item.title, language);
  const displayDescription = getLocalizedDescription(item.description, language);
  const displayLocation = formatLocationWithLandmark(item.location, item.landmark, language);
  const displayDept = getLocalizedDepartment(item.department, language);

  const isResolved = item.status === 'RESOLVED';
  const isInProgress = item.status === 'IN_PROGRESS';

  // Author resident area
  const authorResidentArea = item.author.district
    ? getLocalizedLocation(item.author.district, language)
    : language === 'ta'
    ? 'பெங்களூரு நகர்ப்புறம்'
    : 'BENGALURU URBAN';

  // Latest timeline update
  const latestUpdate =
    item.timeline && item.timeline.length > 0
      ? item.timeline[item.timeline.length - 1]
      : null;

  const isCitizenConfirmed =
    isResolved &&
    item.timeline &&
    item.timeline.some(
      (ev) =>
        (ev.remarks && ev.remarks.toLowerCase().includes('citizen confirmed')) ||
        ev.status === 'RESOLVED'
    );

  const handleConfirmClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm(item);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <article
      onClick={() => onClickDetail(item)}
      className={`rounded-3xl bg-white border transition-all duration-200 shadow-card hover:shadow-card-hover cursor-pointer space-y-4 p-5 sm:p-6 group touch-active ${
        isResolved
          ? 'border-emerald-200 ring-1 ring-emerald-100'
          : isInProgress
          ? 'border-amber-200 ring-1 ring-amber-50'
          : 'border-slate-200'
      }`}
      aria-label={`Civic issue ${item.tracking_id}: ${displayTitle}`}
    >
      {/* 1. Author Header & Tracking ID */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src={
              item.author.avatar_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                item.author.display_name
              )}`
            }
            alt={item.author.display_name}
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 shrink-0 object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className={`font-bold text-slate-900 text-sm truncate ${language === 'en' ? 'uppercase' : ''}`}>
                {item.author.display_name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {t.civicResident}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {language === 'en' ? `${t.residentAreaLabel}: ${authorResidentArea.toUpperCase()}` : `${t.residentAreaLabel}: ${authorResidentArea}`} • {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {item.is_verified && (
            <span
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-civic-50 text-civic-800 border border-civic-200 text-xs font-bold"
              title={t.civicOSVerified}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-civic-600" />
              <span className="hidden sm:inline">{t.civicOSVerified}</span>
            </span>
          )}
          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            {item.tracking_id}
          </span>
        </div>
      </div>

      {/* 2. Badges Row: Status, Priority, Department */}
      <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-100">
        <StatusBadge status={item.status} size="sm" />
        <PriorityBadge priority={item.priority} size="sm" />
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'en' ? displayDept.toUpperCase() : displayDept}</span>
        </span>
        {item.urgency_score !== null && item.urgency_score !== undefined && (
          <UrgencyGauge score={item.urgency_score} showLabel={false} />
        )}
      </div>

      {/* 3. Issue Title & Description */}
      <div className="space-y-1.5">
        <h3 className={`text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-civic-700 transition-colors ${language === 'en' ? 'uppercase' : ''}`}>
          {displayTitle}
        </h3>
        <p className={`text-sm text-slate-600 line-clamp-3 leading-relaxed ${language === 'en' ? 'uppercase' : ''}`}>
          {displayDescription}
        </p>
      </div>

      {/* 4. Location Pin */}
      {displayLocation && (
        <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <MapPin className="w-4 h-4 text-civic-600 shrink-0" />
          <span className="truncate">
            <span className="font-bold text-slate-700">{t.issueLocationLabel}:</span>{' '}
            {displayLocation}
          </span>
        </div>
      )}

      {/* 5. Resolution Story Highlight OR Latest Officer Update */}
      {isResolved ? (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.resolutionStoryBanner}</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">
              {language === 'en' ? displayDept.toUpperCase() : displayDept}
            </span>
          </div>
          {latestUpdate?.remarks && (
            <p className={`text-xs text-emerald-800 leading-relaxed font-medium bg-white/80 p-2.5 rounded-xl border border-emerald-100 ${language === 'en' ? 'uppercase' : ''}`}>
              "{formatFeedRemarks(latestUpdate.remarks, language)}"
            </p>
          )}
          {isCitizenConfirmed && (
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-800 pt-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.citizenConfirmedResolution}</span>
            </div>
          )}
        </div>
      ) : latestUpdate && latestUpdate.remarks && latestUpdate.status !== 'SUBMITTED' ? (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                {formatFeedTimelineStage(
                  latestUpdate.stage,
                  latestUpdate.status,
                  latestUpdate.label,
                  latestUpdate.label_ta,
                  language
                )}
              </span>
            </span>
            <span className="text-[11px] font-semibold text-blue-700">
              {language === 'en' ? displayDept.toUpperCase() : displayDept}
            </span>
          </div>
          <p className={`text-xs text-blue-800 line-clamp-2 leading-relaxed ${language === 'en' ? 'uppercase' : ''}`}>
            {formatFeedRemarks(latestUpdate.remarks, language)}
          </p>
        </div>
      ) : null}

      {/* 6. Community Impact & Interactive CTA */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Counter */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-civic-700 flex items-center justify-center border border-slate-200 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900">
              {item.community_count}
            </span>{' '}
            <span className="text-slate-600 font-medium">
              {item.community_count === 1
                ? t.personAffectedCount
                : t.peopleAffectedCount}
            </span>
          </div>
        </div>

        {/* Primary Action Button: "I Have This Problem Too" */}
        <button
          onClick={handleConfirmClick}
          disabled={isConfirming}
          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all min-h-[48px] touch-manipulation ${
            item.confirmed_by_current_user
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-touch'
              : 'bg-civic-50 hover:bg-civic-100 text-civic-800 border border-civic-300 hover:border-civic-400'
          }`}
          aria-label={
            item.confirmed_by_current_user
              ? t.confirmedProblemBtn
              : t.confirmProblemBtn
          }
        >
          {isConfirming ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : item.confirmed_by_current_user ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>{t.youHaveThisProblem}</span>
            </>
          ) : (
            <>
              <Users className="w-4 h-4 text-civic-700" />
              <span>{t.iHaveThisProblemToo}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
