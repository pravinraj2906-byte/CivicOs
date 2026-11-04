import React, { useState, useEffect } from 'react';
import { Scheme } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getLocalizedCategory } from '../../i18n/formatters';
import {
  Award,
  ExternalLink,
  ShieldCheck,
  X,
  Building2,
  Square,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface SchemeDetailModalProps {
  scheme: Scheme;
  whyYouQualify?: string | null;
  onClose: () => void;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  whyYouQualify,
  onClose,
}) => {
  const { t, language } = useAuth();
  const isTa = language === 'ta';
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Language-aware fields
  const title = isTa && scheme.name_ta ? scheme.name_ta : scheme.name;
  const description = isTa && scheme.description_ta ? scheme.description_ta : scheme.description;
  const benefits = isTa && scheme.benefits_ta ? scheme.benefits_ta : scheme.benefits;
  const eligibility = isTa && scheme.eligibility_criteria_ta ? scheme.eligibility_criteria_ta : scheme.eligibility_criteria;
  const applicationSteps = isTa && scheme.application_steps_ta ? scheme.application_steps_ta : scheme.application_steps;
  const displayCategory = getLocalizedCategory(scheme.category, language);

  const docList = scheme.required_documents_list && scheme.required_documents_list.length > 0
    ? scheme.required_documents_list
    : (scheme.required_documents || '').split(',').map((d) => d.trim()).filter(Boolean);

  const portalUrl = scheme.official_portal || 'https://services.india.gov.in';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheme-modal-title"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-black border border-civic-200">
                <Building2 className="w-3.5 h-3.5 text-civic-700" />
                <span>{displayCategory}</span>
              </span>
              <span className="font-mono text-xs text-slate-600 font-bold bg-slate-200 px-2 py-0.5 rounded-md">
                {scheme.code}
              </span>
            </div>

            <h2 id="scheme-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>

            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <span>{scheme.source_name || (isTa ? 'அரசு அமைச்சகம் / துறை' : 'Government Ministry / Department')}</span>
              <span>•</span>
              <span>{scheme.state === 'All-India' ? t.centralScheme : `${t.stateSchemePrefix} (${scheme.state})`}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:ring-2 focus:ring-civic-700 focus:outline-none"
            aria-label={t.close || 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE CONTENT BODY */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-7 text-slate-800 text-sm leading-relaxed">
          {/* 1. What is this benefit? */}
          <section className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>{t.guideWhatIsIt || 'What is this benefit?'}</span>
            </h3>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
              {description || (isTa ? 'அரசு நலத்திட்ட விவரங்களை அதிகாரப்பூர்வ இணையதளத்தில் சரிபார்க்கவும்.' : 'Check official government portal for scheme details.')}
            </p>
            {benefits && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-semibold flex items-start space-x-2">
                <Award className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-emerald-900">{t.benefits || 'Potential Benefits'}:</span>
                  <span>{benefits}</span>
                </div>
              </div>
            )}
          </section>

          {/* 2. Who may qualify? */}
          <section className="space-y-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>{t.guideWhoCanApply || 'Who may qualify?'}</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                {eligibility || (isTa ? 'தகுதி அளவுகோல்களை அறிய அதிகாரப்பூர்வ இணையதளத்தை பார்க்கவும்.' : 'Check official source for detailed eligibility criteria.')}
              </p>
              <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-200">
                {t.youMayBeEligibleNotice || 'You may be eligible based on available criteria. Check the official portal for formal verification.'}
              </p>
            </div>
          </section>

          {/* 3. Why you're seeing this */}
          {whyYouQualify && (
            <section className="space-y-2.5">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <span>{t.whySeeingThis || "Why you're seeing this"}</span>
              </h3>
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-bold text-blue-950 leading-relaxed">
                  {whyYouQualify}
                </p>
              </div>
            </section>
          )}

          {/* 4. What you may need (Interactive Document Checklist) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                  {whyYouQualify ? '4' : '3'}
                </span>
                <span>{t.whatYouMayNeed || 'What you may need'}</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t.interactiveChecklist || 'Interactive Checklist'}
              </span>
            </div>

            {docList.length > 0 ? (
              <div className="space-y-2">
                {docList.map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleDoc(doc)}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-start space-x-3 cursor-pointer select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 text-slate-400">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold ${isChecked ? 'line-through opacity-80' : ''}`}>
                        {doc}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                {isTa ? 'தேவைப்படும் ஆவணங்களை அதிகாரப்பூர்வ இணையதளத்தில் சரிபார்க்கவும்.' : 'Check the official source for the latest document requirements.'}
              </div>
            )}
          </section>

          {/* 5. Step-by-step Application Process */}
          {applicationSteps && (
            <section className="space-y-2.5">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                  {whyYouQualify ? '5' : '4'}
                </span>
                <span>{t.guideHowToApply || 'Step-by-step application process'}</span>
              </h3>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {applicationSteps}
                </p>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* 6. OFFICIAL GOVERNMENT PORTAL (TRUST CARD) */}
          {/* ========================================================================= */}
          <section className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-[#123B6D] to-[#0A2540] text-white space-y-4 shadow-xl border border-[#123B6D]/40">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.officialGovSourceNotice || 'OFFICIAL GOVERNMENT PORTAL'}</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-black text-white">
                {scheme.source_name || (isTa ? 'அதிகாரப்பூர்வ அரசு இணையதளம்' : 'Official Government Portal')}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {t.guideOfficialNoticeDesc ||
                  'CivicOS provides verified guidance and document checklists. You will be redirected to the verified government portal to complete your official application.'}
              </p>
            </div>

            <div className="pt-1">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all min-h-[56px] w-full sm:w-auto"
              >
                <span>{t.openOfficialGovPortal || 'Open Official Portal'}</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm min-h-[48px] transition-all"
          >
            {t.done || 'Close'}
          </button>

          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-bold text-xs sm:text-sm min-h-[48px] shadow-sm transition-all flex items-center space-x-2 focus:ring-2 focus:ring-civic-600 focus:outline-none"
          >
            <span>{t.openOfficialGovPortal || 'Open Official Portal'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
