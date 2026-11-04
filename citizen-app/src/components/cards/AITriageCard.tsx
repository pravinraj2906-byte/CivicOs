import React from 'react';
import { GrievanceDetail } from '../../types/api';
import { PriorityBadge } from '../common/PriorityBadge';
import { UrgencyGauge } from '../common/UrgencyGauge';
import { Sparkles, Building, Bot, Lightbulb, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getLocalizedDepartment,
  getLocalizedCategory,
  getLocalizedSummary,
  getLocalizedAction,
  getLocalizedLocation,
} from '../../i18n/formatters';

interface AITriageCardProps {
  grievance: GrievanceDetail;
}

export const AITriageCard: React.FC<AITriageCardProps> = ({ grievance }) => {
  const { t, language } = useAuth();
  const isFallback = grievance.ai_source?.toUpperCase() === 'FALLBACK';
  const sourceLabel = isFallback ? t.automatedCivicTriage : t.geminiAIIntelligence;

  // Backend values formatted for presentation
  const displayDept = getLocalizedDepartment(grievance.department, language);
  const displayCategory = getLocalizedCategory(grievance.category, language);

  // Gemini / AI-generated content localized in Tamil mode
  const displaySummary = getLocalizedSummary(grievance.ai_summary, language);
  const displayAction = getLocalizedAction(grievance.suggested_initial_action, language);

  return (
    <div className="p-6 rounded-3xl bg-linear-to-br from-blue-50/70 via-white to-slate-50 border-2 border-blue-200 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-civic-600 flex items-center justify-center text-white shadow-touch">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-slate-900">{t.aiTriageTitle}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                {sourceLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{t.automatedTriageSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Grid of Key Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Category */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {t.categoryLabel}
          </span>
          <span className="text-sm font-extrabold text-slate-900">{displayCategory}</span>
        </div>

        {/* Assigned Department */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center space-x-1">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{t.assignedDeptLabel}</span>
          </span>
          <span className="text-sm font-extrabold text-civic-700">{displayDept}</span>
        </div>

        {/* Priority */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            {t.assessedPriorityLabel}
          </span>
          <PriorityBadge priority={grievance.priority} size="sm" />
        </div>
      </div>

      {/* Urgency Gauge */}
      {grievance.urgency_score !== null && grievance.urgency_score !== undefined && (
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <UrgencyGauge score={grievance.urgency_score} />
        </div>
      )}

      {/* AI Summary */}
      {displaySummary && (
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
            <Bot className="w-4 h-4 text-blue-700" />
            <span>{t.aiSummaryLabel}</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            "{displaySummary}"
          </p>
        </div>
      )}

      {/* Suggested Initial Action */}
      {displayAction && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-950">
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <span>{t.recommendedActionLabel}</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {displayAction}
          </p>
        </div>
      )}

      {/* Key Entities */}
      {grievance.key_entities && grievance.key_entities.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center space-x-1">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{t.identifiedEntitiesLabel}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {grievance.key_entities.map((entity, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono font-medium shadow-2xs"
              >
                #{getLocalizedLocation(entity, language)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
