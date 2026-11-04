import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchemeAssistantResponse, Scheme } from '../../types/api';
import { apiService } from '../../services/api';
import { getLocalizedCategory } from '../../i18n/formatters';
import {
  Sparkles,
  Send,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

interface SchemeAssistantSectionProps {
  onSelectScheme: (scheme: Scheme, whyYouQualify?: string) => void;
  allSchemes: Scheme[];
}

export const SchemeAssistantSection: React.FC<SchemeAssistantSectionProps> = ({
  onSelectScheme,
  allSchemes,
}) => {
  const { t, language, user } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [assistantResponse, setAssistantResponse] = useState<SchemeAssistantResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickPrompts = [
    t.promptStudent,
    t.promptFarmer,
    t.promptWomen,
    t.promptSolar,
    t.promptSenior,
    t.promptHealth,
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = (textToAsk || query).trim();
    if (!q) return;

    setIsAsking(true);
    setErrorMessage(null);
    try {
      const res = await apiService.askSchemeAssistant({
        query: q,
        citizen_profile: user ? { name: user.name, state: user.state, district: user.district } : null,
        language,
      });
      setAssistantResponse(res);
      if (textToAsk) setQuery(textToAsk);
    } catch (err: any) {
      // Human-friendly error handling - never expose raw technical timeouts to citizen
      const friendlyMsg = language === 'ta'
        ? 'தகவல் பெறுவதில் சிறிது தாமதம் ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும் அல்லது கீழே உள்ள அரசு திட்டங்களை பார்வையிடவும்.'
        : 'CivicOS is taking a little longer than expected. You can try again or browse verified government schemes below.';
      setErrorMessage(friendlyMsg);
    } finally {
      setIsAsking(false);
    }
  };

  const handleOpenMatchedScheme = (match: any) => {
    const full = allSchemes.find((s) => s.id === match.scheme_id || s.code === match.scheme_code);
    if (full) {
      onSelectScheme(full, match.why_you_qualify);
    } else {
      const fallbackScheme: Scheme = {
        id: match.scheme_id,
        code: match.scheme_code,
        name: match.scheme_name,
        description: match.why_you_qualify,
        state: 'All-India',
        category: match.category,
        benefits: match.benefits_summary,
        required_documents: match.required_documents?.join(', '),
        official_portal: match.official_portal,
        application_steps: match.application_steps,
        source_name: match.source_name,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      onSelectScheme(fallbackScheme, match.why_you_qualify);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-civic-900 via-slate-900 to-slate-950 text-white shadow-elevated border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-civic-600 flex items-center justify-center text-white font-black shadow-touch">
            <Sparkles className="w-5 h-5 text-civic-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-base sm:text-lg text-white">
                {t.askAssistantTitle}
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-civic-500/30 text-civic-300 border border-civic-400/40">
                {language === 'ta' ? 'AI உதவி' : 'AI Powered'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {t.askAssistantSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {t.quickPromptsTitle}
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-civic-800 text-slate-200 hover:text-white text-xs font-semibold whitespace-nowrap transition-all border border-slate-700/80 shadow-xs flex items-center space-x-1.5 min-h-[36px]"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.askAssistantPlaceholder}
          className="w-full pl-4 pr-24 py-3.5 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-civic-500 min-h-[48px]"
        />
        <button
          type="submit"
          disabled={isAsking || !query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-civic-600 hover:bg-civic-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 min-h-[38px]"
        >
          <span>{isAsking ? '...' : t.askBtn}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Loading state */}
      {isAsking && (
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-200">
          <LoadingState message={t.aiAnalyzing} />
        </div>
      )}

      {/* Reassuring Friendly Error / Retry Card */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={() => handleAsk()}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all shadow-xs flex-shrink-0"
          >
            {language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Try again'}
          </button>
        </div>
      )}

      {/* AI Assistant Answer Card */}
      {assistantResponse && !isAsking && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300">{t.groundedAssessment}</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Source: {assistantResponse.source}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {assistantResponse.answer}
          </p>

          {/* Matched Scheme Cards */}
          {assistantResponse.matches && assistantResponse.matches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-700/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.matchingGovSchemes}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assistantResponse.matches.map((match) => {
                  const displayCategory = getLocalizedCategory(match.category, language);
                  return (
                    <div
                      key={match.scheme_id}
                      onClick={() => handleOpenMatchedScheme(match)}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/90 hover:border-civic-500 cursor-pointer transition-all space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{displayCategory}</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">{match.scheme_code}</span>
                      </div>

                      <h4 className="font-bold text-xs text-white group-hover:text-civic-300 transition-colors line-clamp-1">
                        {match.scheme_name}
                      </h4>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-civic-300 font-semibold flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>{t.viewDetailsAndApply}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
