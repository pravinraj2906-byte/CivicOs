import React, { useState } from 'react';
import { CivicFeedItem } from '../../types/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { UrgencyGauge } from '../../components/common/UrgencyGauge';
import {
  X,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Building,
  Check,
  Clock,
  Sparkles,
  Tag,
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
  getLocalizedCategory,
  getLocalizedPriority,
  getLocalizedLocation,
} from '../../i18n/formatters';

interface FeedDetailModalProps {
  item: CivicFeedItem;
  onClose: () => void;
  onConfirm: (item: CivicFeedItem) => Promise<void>;
}

export const FeedDetailModal: React.FC<FeedDetailModalProps> = ({
  item,
  onClose,
  onConfirm,
}) => {
  const { t, language } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);

  const dateStr = formatFeedDate(item.created_at, language);
  const displayTitle = getLocalizedTitle(item.title, language);
  const displayDescription = getLocalizedDescription(item.description, language);
  const displayLocation = formatLocationWithLandmark(item.location, item.landmark, language);
  const displayDept = getLocalizedDepartment(item.department, language);
  const displayCategory = getLocalizedCategory(item.category, language);
  const displayPriority = getLocalizedPriority(item.priority, language);

  const authorResidentArea = item.author.district
    ? getLocalizedLocation(item.author.district, language)
    : language === 'ta'
    ? 'பெங்களூரு நகர்ப்புறம்'
    : 'BENGALURU URBAN';

  const handleConfirmClick = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm(item);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feed-detail-title"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-civic-700 bg-civic-50 px-2.5 py-1 rounded-md border border-civic-200">
              {item.tracking_id}
            </span>
            {item.is_verified && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-civic-600" />
                <span>{t.civicOSVerified}</span>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Author Card */}
          <div className="flex items-center space-x-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <img
              src={
                item.author.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  item.author.display_name
                )}`
              }
              alt={item.author.display_name}
              className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 object-cover shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className={`font-bold text-slate-900 text-base ${language === 'en' ? 'uppercase' : ''}`}>
                  {item.author.display_name}
                </h4>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                  {t.civicResident}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'en' ? `${t.residentAreaLabel}: ${authorResidentArea.toUpperCase()}` : `${t.residentAreaLabel}: ${authorResidentArea}`} • {dateStr}
              </p>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex items-center flex-wrap gap-2">
            <StatusBadge status={item.status} size="md" />
            <PriorityBadge priority={item.priority} size="md" />
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
              <Building className="w-4 h-4 text-slate-500" />
              <span>{language === 'en' ? displayDept.toUpperCase() : displayDept}</span>
            </span>
            {item.urgency_score !== null && item.urgency_score !== undefined && (
              <UrgencyGauge score={item.urgency_score} />
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 id="feed-detail-title" className={`text-xl sm:text-2xl font-black text-slate-900 leading-tight ${language === 'en' ? 'uppercase' : ''}`}>
              {displayTitle}
            </h2>
            <p className={`text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-white ${language === 'en' ? 'uppercase' : ''}`}>
              {displayDescription}
            </p>
          </div>

          {/* Location */}
          {displayLocation && (
            <div className="flex items-start space-x-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <MapPin className="w-4 h-4 text-civic-600 shrink-0 mt-0.5" />
              <span>
                <span className="font-bold text-slate-900">{t.issueLocationLabel}:</span>{' '}
                {displayLocation}
              </span>
            </div>
          )}

          {/* AI-Assisted Classification Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-civic-800 border-b border-slate-200 pb-2">
              <Sparkles className="w-4 h-4 text-civic-600" />
              <span>{t.aiClassificationLabel}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  {t.categoryKeyLabel}
                </span>
                <span className={`font-extrabold text-slate-900 ${language === 'en' ? 'uppercase' : ''}`}>
                  {displayCategory}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  {t.priorityKeyLabel}
                </span>
                <span className={`font-extrabold text-slate-900 ${language === 'en' ? 'uppercase' : ''}`}>
                  {displayPriority}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">
                  {t.departmentKeyLabel}
                </span>
                <span className={`font-extrabold text-slate-900 ${language === 'en' ? 'uppercase' : ''}`}>
                  {displayDept}
                </span>
              </div>
            </div>

            {item.ai_summary && !item.ai_summary.includes('(FALLBACK)') && (
              <p className={`text-xs text-slate-600 leading-relaxed pt-1 ${language === 'en' ? 'uppercase' : ''}`}>
                {item.ai_summary}
              </p>
            )}

            {item.key_entities && item.key_entities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3 h-3 text-slate-400 mr-0.5" />
                {item.key_entities.map((entity, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                  >
                    #{entity}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Living Timeline / Official Resolution Journey */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-civic-600" />
              <span>{t.livingTimeline}</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {item.timeline && item.timeline.length > 0 ? (
                item.timeline.map((event, idx) => {
                  const isEventResolved = event.status === 'RESOLVED';
                  const isEventInProgress = event.status === 'IN_PROGRESS';
                  const eventDate = formatFeedDate(event.created_at, language);

                  return (
                    <div key={event.id || idx} className="relative group">
                      {/* Step Marker */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                          isEventResolved
                            ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                            : isEventInProgress
                            ? 'border-amber-500 text-amber-500 bg-amber-50'
                            : 'border-civic-600 text-civic-600 bg-civic-50'
                        }`}
                      >
                        {isEventResolved ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className={`p-3.5 rounded-2xl border ${
                          isEventResolved
                            ? 'bg-emerald-50/90 border-emerald-200'
                            : isEventInProgress
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span
                            className={
                              isEventResolved
                                ? 'text-emerald-900'
                                : isEventInProgress
                                ? 'text-amber-900'
                                : 'text-slate-900'
                            }
                          >
                            {formatFeedTimelineStage(
                              event.stage,
                              event.status,
                              event.label,
                              event.label_ta,
                              language
                            )}
                          </span>
                          <span className="text-[11px] font-normal text-slate-500">
                            {eventDate}
                          </span>
                        </div>
                        {event.remarks && (
                          <p
                            className={`text-xs leading-relaxed font-medium ${
                              isEventResolved
                                ? 'text-emerald-800'
                                : isEventInProgress
                                ? 'text-amber-800'
                                : 'text-slate-600'
                            } ${language === 'en' ? 'uppercase' : ''}`}
                          >
                            {formatFeedRemarks(event.remarks, language)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {language === 'ta' ? 'காலவரிசை நிகழ்வுகள் எதுவும் இல்லை.' : 'No timeline events recorded.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer with Community Impact Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-civic-100 text-civic-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base">
                {item.community_count}
              </span>{' '}
              <span className="text-xs text-slate-600 font-medium">
                {item.community_count === 1
                  ? t.personAffectedCount
                  : t.peopleAffectedCount}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmClick}
            disabled={isConfirming}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-touch min-h-[48px] touch-manipulation ${
              item.confirmed_by_current_user
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-civic-600 hover:bg-civic-700 text-white'
            }`}
          >
            {isConfirming ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : item.confirmed_by_current_user ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>{t.youHaveThisProblem}</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-white" />
                <span>{t.iHaveThisProblemToo}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

