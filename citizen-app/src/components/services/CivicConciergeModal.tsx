import React from 'react';
import { ConciergeResult } from '../../services/conciergeEngine';
import { GovernmentService } from '../../services/serviceTypes';
import { GOVERNMENT_SERVICES } from '../../services/serviceCatalog';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  X,
  FileText,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Gift,
  CheckCircle2,
  Info,
  Calendar,
} from 'lucide-react';

interface CivicConciergeModalProps {
  result: ConciergeResult;
  onClose: () => void;
  onOpenServiceGuide: (service: GovernmentService) => void;
  onOpenReportModal: () => void;
  onNavigateToTab: (tab: 'home' | 'feed' | 'grievances' | 'schemes' | 'profile') => void;
}

export const CivicConciergeModal: React.FC<CivicConciergeModalProps> = ({
  result,
  onClose,
  onOpenServiceGuide,
  onOpenReportModal,
  onNavigateToTab,
}) => {
  const { t, language } = useAuth();
  const isTa = language === 'ta';

  const getIntentBadge = () => {
    switch (result.intent) {
      case 'SERVICE':
      case 'DOCUMENT':
        return {
          label: isTa ? 'அரசு சேவை' : 'Government Service',
          icon: <FileText className="w-3.5 h-3.5 text-civic-600" />,
          bg: 'bg-civic-50 border-civic-200 text-civic-900',
        };
      case 'GRIEVANCE':
        return {
          label: isTa ? 'பொதுப் புகார்' : 'Civic Grievance',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
        };
      case 'WELFARE':
        return {
          label: isTa ? 'நலத்திட்டம்' : 'Welfare Benefit',
          icon: <Gift className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
        };
      case 'LIFE_EVENT':
        return {
          label: isTa ? 'வாழ்க்கை நிகழ்வு வழிகாட்டி' : 'Life Event Checklist',
          icon: <Calendar className="w-3.5 h-3.5 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200 text-purple-950',
        };
      default:
        return {
          label: isTa ? 'வழிகாட்டுதல்' : 'General Guidance',
          icon: <Sparkles className="w-3.5 h-3.5 text-slate-600" />,
          bg: 'bg-slate-100 border-slate-200 text-slate-800',
        };
    }
  };

  const badge = getIntentBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${badge.bg}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label={t.close || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Query & Headline */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isTa ? 'உங்கள் கேள்வி' : 'Your Query'}: "{result.query}"
            </div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {isTa ? result.headline_ta : result.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {isTa ? result.summary_ta : result.summary}
            </p>
          </div>

          {/* 1. SERVICE OR DOCUMENT INTENT DETAILS */}
          {(result.intent === 'SERVICE' || result.intent === 'DOCUMENT') && result.service && (
            <div className="space-y-3 pt-2">
              {/* Grounded Documents Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isTa ? 'தேவையான முக்கிய ஆவணங்கள்' : 'Key Documents Required'}</span>
                </span>
                <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc font-medium">
                  {(isTa ? result.service.documents_required_ta : result.service.documents_required).slice(0, 3).map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              {/* Official Source Disclaimer */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950 text-xs flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {isTa ? 'அதிகாரப்பூர்வ அரசு தளம்:' : 'Official Government Portal:'}
                  </span>{' '}
                  <span className="font-semibold">{result.service.official_portal_name}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  onOpenServiceGuide(result.service!);
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-civic-700 hover:bg-civic-800 text-white text-sm font-bold transition-all shadow-card min-h-[48px]"
              >
                <span>{isTa ? 'முழு சேவை வழிகாட்டியை திறக்கவும்' : 'Open Complete Service Guide'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. GRIEVANCE INTENT DETAILS */}
          {result.intent === 'GRIEVANCE' && (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>
                    {isTa ? 'ஒதுக்கப்படும் துறை:' : 'Department to Handle:'} {result.grievanceCategory}
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {isTa
                    ? 'CivicOS உங்கள் புகாரை AI மூலம் வகைப்படுத்தி, உரிய துறைக்கு அனுப்பி நேரலை முன்னேற்றத்தை காட்டும்.'
                    : 'CivicOS triages civic issues, dispatches them directly to municipal officers, and tracks resolution under strict SLAs.'}
                </p>
              </div>

              <button
                onClick={() => {
                  onOpenReportModal();
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-all shadow-card min-h-[48px]"
              >
                <span>{isTa ? 'இப்போது புகார் பதிவு செய்க' : 'Report This Problem Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 3. WELFARE INTENT DETAILS */}
          {result.intent === 'WELFARE' && (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="text-xs font-extrabold text-emerald-950 flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span>{isTa ? 'தனிப்பயனாக்கப்பட்ட நலத்திட்டங்கள்' : 'Personalized Benefits Center'}</span>
                </div>
                <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                  {isTa
                    ? 'உங்கள் Citizen Twin விவரங்களின் அடிப்படையில் தகுதியான அரசு உதவித்தொகைகள் மற்றும் மானியங்களை கண்டறியுங்கள்.'
                    : 'Explore state and central government subsidies, scholarships, and social welfare schemes tailored to your profile.'}
                </p>
              </div>

              <button
                onClick={() => {
                  onNavigateToTab('schemes');
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-card min-h-[48px]"
              >
                <span>{isTa ? 'நலத்திட்டங்களை காண்க' : 'Explore Welfare Schemes'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 4. LIFE EVENT CHECKLIST INTENT */}
          {result.intent === 'LIFE_EVENT' && result.lifeEventSteps && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                {isTa ? 'அரசு ஆவணங்கள் மற்றும் படிகள்' : 'Government Actions Checklist'}
              </span>

              <div className="space-y-2.5">
                {result.lifeEventSteps.map((step, idx) => {
                  const matchedService = step.serviceSlug
                    ? GOVERNMENT_SERVICES.find((s) => s.slug === step.serviceSlug)
                    : null;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">
                          {idx + 1}. {isTa ? step.title_ta : step.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {isTa ? step.desc_ta : step.desc}
                        </div>
                      </div>

                      {matchedService && (
                        <button
                          onClick={() => {
                            onOpenServiceGuide(matchedService);
                            onClose();
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-civic-700 hover:bg-civic-50 shrink-0 min-h-[36px]"
                        >
                          <span>{isTa ? 'வழிகாட்டி' : 'Guide'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. UNKNOWN / AMBIGUOUS INTENT GUIDANCE */}
          {result.intent === 'UNKNOWN' && (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-civic-600" />
                  <span>{isTa ? 'நீங்கள் இவ்வாறு கேட்கலாம்:' : 'Try asking questions like:'}</span>
                </span>
                <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
                  <li>• "{isTa ? 'எனக்கு பான் கார்டு வேண்டும்' : 'I need a PAN card'}"</li>
                  <li>• "{isTa ? 'பாஸ்போர்ட்டிற்கு எப்படி விண்ணப்பிப்பது?' : 'How can I apply for a passport?'}"</li>
                  <li>• "{isTa ? 'வருமானச் சான்றிதழ் பெறுவது எப்படி?' : 'I need an income certificate'}"</li>
                  <li>• "{isTa ? 'தெருவிளக்கு எரியவில்லை' : 'The streetlight outside is broken'}"</li>
                  <li>• "{isTa ? 'குடும்பத்திற்கான அரசு நலத்திட்டங்கள் என்ன?' : 'What government benefits can my family get?'}"</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[40px]"
          >
            {t.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
