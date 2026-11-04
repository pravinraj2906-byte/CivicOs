import React, { useState } from 'react';
import { AttentionItem, AttentionSeverity } from '../utils/attentionRules';
import { Grievance } from '../types/api';
import { useAuth } from '../context/AuthContext';
import {
  getLocalizedTitle,
  getLocalizedSummary,
  getLocalizedAction,
  getLocalizedLocation,
} from '../i18n/formatters';
import {
  X,
  Bell,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Lightbulb,
} from 'lucide-react';

interface AttentionCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: AttentionItem[];
  onSelectGrievance: (g: Grievance) => void;
  onFilterStatus: (status: string) => void;
  onSearchLocation: (loc: string) => void;
  dismissedIds: string[];
  onDismissItem: (id: string) => void;
}

export const AttentionCenterDrawer: React.FC<AttentionCenterDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectGrievance,
  onFilterStatus,
  onSearchLocation,
  dismissedIds,
  onDismissItem,
}) => {
  const { t, language } = useAuth();
  const [activeTab, setActiveTab] = useState<'ALL' | AttentionSeverity>('ALL');

  if (!isOpen) return null;

  // Filter out dismissed items
  const activeItems = items.filter((item) => !dismissedIds.includes(item.id));

  const criticalCount = activeItems.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = activeItems.filter((i) => i.severity === 'HIGH').length;
  const followUpCount = activeItems.filter((i) => i.severity === 'FOLLOW_UP').length;
  const insightCount = activeItems.filter((i) => i.severity === 'SMART_INSIGHT').length;

  const filteredItems = activeItems.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.severity === activeTab;
  });

  const handleAction = (item: AttentionItem) => {
    if (item.actionType === 'REVIEW_GRIEVANCE' && item.grievance) {
      onSelectGrievance(item.grievance);
      onClose();
    } else if (item.actionType === 'FILTER_STATUS' && item.actionPayload) {
      onFilterStatus(item.actionPayload);
      onClose();
    } else if (item.actionType === 'SEARCH_LOCATION' && item.actionPayload) {
      onSearchLocation(item.actionPayload);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-50 border-l border-slate-200 h-full min-h-screen shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-civic-600 flex items-center justify-center text-white shadow-touch relative">
              <Bell className="w-5 h-5" />
              {activeItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                  {activeItems.length}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {t.attentionCenterTitle}
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700">
                  {activeItems.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t.attentionCenterSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title={t.closeTooltip}
            className="p-2.5 rounded-2xl bg-white hover:bg-red-50 hover:text-red-700 border border-slate-200 transition-all text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-xs"
            aria-label={t.closeTooltip}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Category Pills */}
        <div className="bg-white px-5 sm:px-6 py-3 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === 'ALL'
                ? 'bg-civic-600 text-white border-civic-600 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {t.categoryAll} ({activeItems.length})
          </button>

          {criticalCount > 0 && (
            <button
              onClick={() => setActiveTab('CRITICAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                activeTab === 'CRITICAL'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{t.categoryCritical} ({criticalCount})</span>
            </button>
          )}

          {highCount > 0 && (
            <button
              onClick={() => setActiveTab('HIGH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                activeTab === 'HIGH'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border-orange-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>{t.categoryHigh} ({highCount})</span>
            </button>
          )}

          {followUpCount > 0 && (
            <button
              onClick={() => setActiveTab('FOLLOW_UP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                activeTab === 'FOLLOW_UP'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{t.categoryFollowUp} ({followUpCount})</span>
            </button>
          )}

          {insightCount > 0 && (
            <button
              onClick={() => setActiveTab('SMART_INSIGHT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center space-x-1.5 ${
                activeTab === 'SMART_INSIGHT'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{t.categoryInsight} ({insightCount})</span>
            </button>
          )}
        </div>

        {/* Attention Items List */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-card space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t.allCaughtUp}</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {t.allCaughtUpDesc}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isCritical = item.severity === 'CRITICAL';
              const isHigh = item.severity === 'HIGH';
              const isFollowUp = item.severity === 'FOLLOW_UP';
              const isInsight = item.severity === 'SMART_INSIGHT';

              // Dynamic presentation localization for attention cards
              let displayTitle = getLocalizedTitle(item.title, language);
              let displaySubtitle = getLocalizedSummary(item.subtitle, language);
              let displayAction = getLocalizedAction(item.recommendedAction, language);
              const displayLocation = getLocalizedLocation(item.location, language);

              if (isFollowUp) {
                if (item.id === 'followup-inprogress') {
                  displayTitle = t.inProgressCasesTitle.replace('{count}', String(item.count || 1));
                  displaySubtitle = t.inProgressCasesDesc.replace('{count}', String(item.count || 1));
                } else if (item.id === 'followup-submitted') {
                  displayTitle = t.submittedCasesTitle.replace('{count}', String(item.count || 1));
                  displaySubtitle = t.submittedCasesDesc.replace('{count}', String(item.count || 1));
                }
              } else if (isInsight) {
                displayTitle = `${t.possiblePatternDetected}: ${displayLocation}`;
                displaySubtitle = `${item.count || 2} ${language === 'ta' ? 'புகார்கள் பதிவாகியுள்ளன' : 'active complaints reported'}. ${t.patternSubtitle}`;
              }

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border-2 shadow-card space-y-3.5 transition-all bg-white ${
                    isCritical
                      ? 'border-red-200 hover:border-red-300'
                      : isHigh
                      ? 'border-orange-200 hover:border-orange-300'
                      : isFollowUp
                      ? 'border-amber-200 hover:border-amber-300'
                      : 'border-blue-200 hover:border-blue-300'
                  }`}
                >
                  {/* Top Bar: Severity Badge & Dismiss */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      {isCritical && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300">
                          <AlertOctagon className="w-3 h-3 text-red-700" />
                          <span>{t.immediateAttentionNeeded}</span>
                        </span>
                      )}
                      {isHigh && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300">
                          <AlertTriangle className="w-3 h-3 text-orange-700" />
                          <span>{t.highPriorityActionRecommended}</span>
                        </span>
                      )}
                      {isFollowUp && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>{t.followUpRecommended}</span>
                        </span>
                      )}
                      {isInsight && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
                          <Sparkles className="w-3 h-3 text-blue-700" />
                          <span>{t.smartInsightBadge}</span>
                        </span>
                      )}

                      {item.urgencyPct !== null && item.urgencyPct !== undefined && (
                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          {item.urgencyPct}% {t.aiUrgencyLabel}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onDismissItem(item.id)}
                      className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                      title={t.dismiss}
                    >
                      {t.dismiss}
                    </button>
                  </div>

                  {/* Grievance / Item Details */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {item.grievance && (
                        <span className="font-mono text-xs font-bold text-civic-700 bg-civic-50 px-2 py-0.5 rounded border border-civic-200">
                          {item.grievance.tracking_id}
                        </span>
                      )}
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {displayTitle}
                      </h4>
                    </div>

                    {displayLocation && (
                      <div className="flex items-center text-xs text-slate-500 font-medium pt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500 shrink-0" />
                        <span>{displayLocation}</span>
                      </div>
                    )}

                    {displaySubtitle && (
                      <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1 line-clamp-2">
                        "{displaySubtitle}"
                      </p>
                    )}
                  </div>

                  {/* Recommended Action Box */}
                  {displayAction && (
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block text-amber-900">
                          {t.recommendedActionLabelShort}
                        </strong>
                        <span>{displayAction}</span>
                      </div>
                    </div>
                  )}

                  {/* CTA Action Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAction(item)}
                      className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs min-h-[40px] ${
                        isCritical
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : isHigh
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-civic-600 hover:bg-civic-700 text-white'
                      }`}
                    >
                      <span>
                        {item.actionLabelKey === 'reviewGrievance'
                          ? t.reviewGrievance
                          : item.actionLabelKey === 'reviewPendingCases'
                          ? t.reviewPendingCases
                          : t.viewRelatedComplaints}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
