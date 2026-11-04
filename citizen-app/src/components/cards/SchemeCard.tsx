import React from 'react';
import { SchemeRecommendationItem } from '../../types/api';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLocalizedCategory } from '../../i18n/formatters';

interface SchemeCardProps {
  recommendation: SchemeRecommendationItem;
  onClick?: () => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ recommendation, onClick }) => {
  const { t, language } = useAuth();
  const isTa = language === 'ta';
  const matchPct = Math.round(recommendation.match_confidence * 100);
  const displayCategory = getLocalizedCategory(recommendation.category, language);

  return (
    <div
      onClick={onClick}
      className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-civic-600 shadow-card hover:shadow-card-hover transition-all cursor-pointer space-y-4 group touch-active text-left flex flex-col justify-between"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Welfare Scheme: ${recommendation.scheme_name}, ${matchPct}% match confidence`}
    >
      <div className="space-y-3.5">
        {/* Top row: Match Score pill & Category */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-black text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{import.meta.env.VITE_DEMO_MODE === 'true' ? 'Illustrative suggestion' : `${matchPct}% ${isTa ? 'பொருத்தம்' : 'Match For You'}`}</span>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {displayCategory}
          </span>
        </div>

        {/* Scheme Title & Code */}
        <div>
          <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-civic-800 transition-colors leading-tight">
            {recommendation.scheme_name}
          </h3>
          <span className="font-mono text-[11px] text-slate-500 font-bold block mt-0.5">
            {recommendation.scheme_code}
          </span>
        </div>

        {/* Potential Benefits */}
        {recommendation.potential_benefits && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
            {recommendation.potential_benefits}
          </p>
        )}

        {/* "Why you're seeing this" Section */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-black text-blue-950">
            <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
            <span>{t.whySeeingThis || "Why you're seeing this"}</span>
          </div>
          <p className="text-xs text-blue-900 leading-relaxed font-semibold pl-5">
            {recommendation.why_you_qualify}
          </p>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <span className="text-xs text-slate-500 font-semibold">
          {isTa ? 'அரசு வழிகாட்டி தயார்' : 'Official Guide Ready'}
        </span>
        <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-civic-50 group-hover:bg-civic-700 text-civic-800 group-hover:text-white font-black text-xs transition-all shadow-2xs">
          <span>{t.learnMoreAndGuide || 'Application Guide'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
