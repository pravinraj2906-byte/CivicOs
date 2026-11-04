import React, { useState, useMemo } from 'react';
import { Grievance } from '../types/api';
import { useAuth } from '../context/AuthContext';
import {
  generateIntelligenceReport,
  DateFilterRange,
} from '../utils/intelligenceEngine';
import { getLocalizedCategory, getLocalizedDepartment, getLocalizedTitle, getLocalizedLocation } from '../i18n/formatters';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Flame,
  Users,
  AlertTriangle,
  Layers,
  ArrowRight,
  Building2,
  Clock,
  Info,
  Activity,
  CheckCircle2,
  GitCompare,
} from 'lucide-react';

interface CivicIntelligenceViewProps {
  grievances: Grievance[];
  onSelectGrievance: (g: Grievance) => void;
  onFilterQueueByGrievances?: (subset: Grievance[], filterLabel?: string) => void;
}

export const CivicIntelligenceView: React.FC<CivicIntelligenceViewProps> = ({
  grievances,
  onSelectGrievance,
  onFilterQueueByGrievances,
}) => {
  const { t, language } = useAuth();
  const [dateRange, setDateRange] = useState<DateFilterRange>('7d');

  // Compute intelligence report deterministically from real data
  const report = useMemo(() => {
    return generateIntelligenceReport(grievances, dateRange);
  }, [grievances, dateRange]);

  const dateFilterOptions: { value: DateFilterRange; label: string }[] = [
    { value: '24h', label: t.dateFilter24h || 'Last 24 hours' },
    { value: '7d', label: t.dateFilter7d || 'Last 7 days' },
    { value: '30d', label: t.dateFilter30d || 'Last 30 days' },
    { value: 'all', label: t.dateFilterAll || 'All available' },
  ];

  if (grievances.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-card space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-civic-50 border border-civic-200 flex items-center justify-center mx-auto text-civic-700">
          <Activity className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900">
            {t.emptyIntelligenceTitle || 'Not enough data yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t.emptyIntelligenceDesc || 'More citizen reports will help CivicOS identify patterns and recurring hotspots.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE INTELLIGENCE HEADER & TIME FILTER                           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-50 border border-civic-200 text-civic-800 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-civic-600" />
            <span>CivicOS Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.intelHeaderTitle || 'Civic Intelligence'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl">
            {t.intelHeaderSubtitle || 'Understand where citizen issues are increasing and where attention may be needed.'}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 self-start md:self-center">
          {dateFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                dateRange === opt.value
                  ? 'bg-civic-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE METRICS STRIP                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Issues */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.intelTotalActive || 'Total Active'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-civic-50 border border-civic-200 flex items-center justify-center text-civic-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {report.totalActive}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {language === 'ta' ? 'நடவடிக்கை தேவைப்படும் புகார்கள்' : 'Unresolved department complaints'}
          </p>
        </div>

        {/* Critical / High Priority */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              {t.intelCriticalHigh || 'High / Critical'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-700">
            {report.criticalHighCount}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {language === 'ta' ? 'அவசர முன்னுரிமைப் புகார்கள்' : 'Requiring immediate field attention'}
          </p>
        </div>

        {/* Community Confirmations */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {t.intelCommunityConfirmations || 'Confirmations'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900">
            {report.totalCommunityConfirmations}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {language === 'ta' ? 'குடிமக்கள் கூட்டு உறுதிப்படுத்தல்கள்' : 'Citizen neighborhood upvotes'}
          </p>
        </div>

        {/* Top Issue Category */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.intelTopCategory || 'Top Category'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 truncate">
            {report.topCategory ? getLocalizedCategory(report.topCategory.category, language) : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {report.topCategory ? `${report.topCategory.count} complaints (${report.topCategory.percentage}%)` : 'No category data'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REAL CIVIC ACTION & RESOLUTION OUTCOMES (PHASE 2C CLOSED LOOP)         */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.outcomeMetricsTitle || 'Civic Action & Resolution Outcomes'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'ta'
                ? 'நிறுவனத்தால் சரிபார்க்கப்பட்ட உண்மையான கள நடவடிக்கைகள் மற்றும் தீர்வு விகிதங்கள்'
                : 'Real persisted operational resolutions and verified community outcomes'}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            {report.outcomes.resolutionRate}% {t.resolutionRateLabel || 'Resolution Rate'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Resolved Count */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
              {t.resolvedComplaintsCount || 'Total Resolved'}
            </span>
            <span className="text-xl font-black text-emerald-950">
              {report.outcomes.totalResolved}
            </span>
          </div>

          {/* High Priority Resolved */}
          <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-900 block">
              {t.highPriorityResolvedLabel || 'High/Critical Resolved'}
            </span>
            <span className="text-xl font-black text-red-950">
              {report.outcomes.criticalHighResolved}
            </span>
          </div>

          {/* Community Resolved */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 block">
              {t.communityResolvedLabel || 'Community Verified'}
            </span>
            <span className="text-xl font-black text-blue-950">
              {report.outcomes.communityResolved}
            </span>
          </div>

          {/* Follow-up Reopened */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block">
              {t.reopenedFollowupsLabel || 'Active Follow-ups'}
            </span>
            <span className="text-xl font-black text-amber-950">
              {report.outcomes.followupCount}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BEFORE vs AFTER CIVICOS WORKFLOW TRANSFORMATION                         */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <GitCompare className="w-4 h-4 text-civic-600" />
            <span>{t.beforeAfterTitle || 'Workflow Transformation: Traditional vs. CivicOS'}</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t.beforeAfterSubtitle || 'How CivicOS eliminates operational silos and closes the civic action loop'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traditional Process */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {t.beforeLabel || 'Traditional Process (Siloed)'}
            </span>
            <ul className="text-xs text-slate-600 space-y-2 font-medium">
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>{t.beforeStep1 || 'Separate department portals & confusion'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>{t.beforeStep2 || 'Manual, slow routing between offices'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>{t.beforeStep3 || 'Black box for citizen with zero real-time visibility'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <span>{t.beforeStep4 || 'Disconnected resolution with no community verification'}</span>
              </li>
            </ul>
          </div>

          {/* With CivicOS */}
          <div className="p-4 rounded-2xl bg-civic-50/50 border border-civic-200 space-y-2.5">
            <span className="text-xs font-black text-civic-900 uppercase tracking-wider block">
              {t.afterLabel || 'With CivicOS (Intelligent Closed-Loop)'}
            </span>
            <ul className="text-xs text-civic-900 space-y-2 font-semibold">
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-civic-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>{t.afterStep1 || 'One Unified Service-First Portal for all needs'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-civic-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>{t.afterStep2 || 'Instant AI-assisted triage & automated n8n routing'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-civic-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>{t.afterStep3 || 'Actionable officer operations with SLA countdowns'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-civic-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <span>{t.afterStep4 || 'Real-time citizen updates & verified community feedback'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PREDICTIVE SIGNALS & PATTERN ENGINE                                    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-civic-600" />
              <span>{t.predictiveSignalsTitle || 'Predictive Signals & Pattern Engine'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.predictiveSignalsSubtitle || 'Transparent deterministic signals flagging emerging civic patterns'}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {report.signals.length} {language === 'ta' ? 'அறிகுறிகள் கண்டறியப்பட்டன' : 'active signals detected'}
          </span>
        </div>

        {report.signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.signals.map((sig) => {
              const localizedTitle = t[sig.titleKey] || 'Civic Signal';
              return (
                <div
                  key={sig.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card flex flex-col justify-between space-y-4 hover:border-civic-300 transition-all"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-extrabold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{localizedTitle}</span>
                      </span>

                      {sig.location && (
                        <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sig.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Detected Statement */}
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {language === 'ta' ? sig.whatDetected_ta : sig.whatDetected}
                      </h3>
                      <div className="text-xs text-slate-600 font-medium mt-1 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-700">Evidence: </span>
                        {language === 'ta' ? sig.evidence_ta : sig.evidence}
                      </div>
                    </div>

                    {/* Why Flagged */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                        Why Flagged:
                      </span>
                      <p className="font-medium">
                        {language === 'ta' ? sig.whyFlagged_ta : sig.whyFlagged}
                      </p>
                    </div>

                    {/* Why this matters callout */}
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950 text-xs flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold mr-1">
                          {t.whyThisMattersLabel || 'Why this matters'}:
                        </span>
                        <span className="font-medium">
                          {language === 'ta' ? sig.whyThisMatters_ta : sig.whyThisMatters}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                      {language === 'ta' ? sig.suggestedAction_ta : sig.suggestedAction}
                    </span>
                    <button
                      onClick={() => {
                        if (sig.relatedGrievances.length === 1) {
                          onSelectGrievance(sig.relatedGrievances[0]);
                        } else if (onFilterQueueByGrievances) {
                          onFilterQueueByGrievances(sig.relatedGrievances, sig.location || sig.category);
                        } else if (sig.relatedGrievances.length > 0) {
                          onSelectGrievance(sig.relatedGrievances[0]);
                        }
                      }}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition-all shadow-xs min-h-[38px] shrink-0"
                    >
                      <span>{t.reviewIssuesBtn || 'Review Issues'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-medium">
            {t.notEnoughTrendData || 'No anomalous signals detected in this date window.'}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. PROBLEM HOTSPOTS & REPEATED PROBLEMS (TWO COLUMN GRID)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspots Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-civic-600" />
                <span>{t.problemHotspotsTitle || 'Problem Hotspots'}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t.problemHotspotsSubtitle || 'Geographical clusters with recurring complaints'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {report.hotspots.length} {language === 'ta' ? 'பகுதிகள்' : 'locations'}
            </span>
          </div>

          {report.hotspots.length > 0 ? (
            <div className="space-y-3">
              {report.hotspots.map((hotspot, idx) => (
                <div
                  key={hotspot.location}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-civic-100 text-civic-800 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {hotspot.location}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium pl-7">
                      <span className="font-bold text-slate-700">
                        {hotspot.activeCount} active ({hotspot.totalCount} total)
                      </span>
                      <span>•</span>
                      <span>{getLocalizedCategory(hotspot.topCategory, language)}</span>
                      {hotspot.communityConfirmations > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-blue-700 font-bold">
                            {hotspot.communityConfirmations} confirmations
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onFilterQueueByGrievances) {
                        onFilterQueueByGrievances(hotspot.grievances, hotspot.location);
                      } else if (hotspot.grievances.length > 0) {
                        onSelectGrievance(hotspot.grievances[0]);
                      }
                    }}
                    className="self-end sm:self-center flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-200/60 text-slate-800 text-xs font-bold transition-all min-h-[36px]"
                  >
                    <span>{t.reviewIssuesBtn || 'Review'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic text-center py-4">
              {t.notEnoughLocationData || 'Not enough location data to identify hotspots yet.'}
            </p>
          )}
        </div>

        {/* Repeated Problems */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-civic-600" />
                <span>{t.repeatedProblemsTitle || 'Repeated Problems'}</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t.repeatedProblemsSubtitle || 'Detected clusters sharing similar categories and locations'}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {report.repeatedProblems.length} {language === 'ta' ? 'தொகுப்புகள்' : 'clusters'}
            </span>
          </div>

          {report.repeatedProblems.length > 0 ? (
            <div className="space-y-3">
              {report.repeatedProblems.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-extrabold border border-amber-200">
                        {t.possibleRecurringIssue || 'Possible recurring issue'}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-900">
                      {getLocalizedCategory(cluster.category, language)} in {cluster.location}
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      {cluster.count} reports • over {cluster.dateSpanDays} days
                      {cluster.communityCount > 0 && ` • ${cluster.communityCount} confirmations`}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onFilterQueueByGrievances) {
                        onFilterQueueByGrievances(cluster.grievances, `${cluster.category} - ${cluster.location}`);
                      } else if (cluster.grievances.length > 0) {
                        onSelectGrievance(cluster.grievances[0]);
                      }
                    }}
                    className="self-end sm:self-center flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-200/60 text-slate-800 text-xs font-bold transition-all min-h-[36px]"
                  >
                    <span>{t.reviewIssuesBtn || 'Review'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic text-center py-4">
              {language === 'ta'
                ? 'தொடர் புகார்களின் மாதிரி எதுவும் கண்டறியப்படவில்லை.'
                : 'No recurring category clusters detected in the selected period.'}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. COMMUNITY IMPACT INTELLIGENCE                                          */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{t.communityImpactSectionTitle || 'Community Impact Intelligence'}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.communityImpactSectionSubtitle || 'Issues verified and reinforced by multiple citizens'}
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
            {report.communityImpactList.length} verified issues
          </span>
        </div>

        {report.communityImpactList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {report.communityImpactList.slice(0, 3).map((impact) => {
              const g = impact.grievance;
              const localizedTitle = getLocalizedTitle(g.title, language);
              const localizedLoc = getLocalizedLocation(g.location || g.landmark || '', language);
              const label = t[impact.impactLabelKey] || 'High impact';

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/80 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-civic-700">
                        {g.tracking_id}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-black">
                        {impact.communityCount} citizens confirmed
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {localizedTitle}
                    </h4>

                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      {localizedLoc || 'Location not specified'}
                    </div>

                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                      {label}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectGrievance(g)}
                    className="w-full flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition-all shadow-xs min-h-[38px]"
                  >
                    <span>{t.viewBtn || 'View Issue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium italic text-center py-4">
            {language === 'ta'
              ? 'பல குடிமக்களால் உறுதிப்படுத்தப்பட்ட புகார்கள் எதுவும் இல்லை.'
              : 'No multi-citizen confirmed complaints in the selected window.'}
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. CATEGORY & DEPARTMENT LOAD ANALYTICS                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-civic-600" />
            <span>{t.categoryDistTitle || 'Category Distribution'}</span>
          </h3>

          <div className="space-y-3">
            {report.categoryDistribution.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{getLocalizedCategory(item.category, language)}</span>
                  <span className="text-slate-500 font-mono font-medium">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-civic-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Workload */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-civic-600" />
            <span>{t.departmentLoadTitle || 'Department Workload'}</span>
          </h3>

          <div className="space-y-3">
            {report.departmentLoad.map((item) => (
              <div
                key={item.department}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {getLocalizedDepartment(item.department, t)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {item.critical} critical • {item.high} high
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-civic-800">
                    {item.active} active
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    {item.resolved} resolved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
