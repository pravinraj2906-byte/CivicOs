import React, { useEffect, useState } from 'react';
import { GovernmentService } from '../../services/serviceTypes';
import { ServiceResolver } from '../../services/serviceResolver';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  IndianRupee,
  ShieldCheck,
  Building,
  Sparkles,
  Send,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';

interface ServiceGuideModalProps {
  service: GovernmentService;
  onClose: () => void;
}

interface AssistantMsg {
  sender: 'citizen' | 'assistant';
  text: string;
}

export const ServiceGuideModal: React.FC<ServiceGuideModalProps> = ({ service, onClose }) => {
  const { language, t } = useAuth();
  const isTa = language === 'ta';

  const title = isTa ? service.title_ta : service.title;
  const category = isTa ? service.category_ta : service.category;
  const whatIsIt = isTa ? service.what_is_it_ta : service.what_is_it;
  const whoCanApply = isTa ? service.who_can_apply_ta : service.who_can_apply;
  const documentsRequired = isTa ? service.documents_required_ta : service.documents_required;
  const applicationSteps = isTa ? service.application_steps_ta : service.application_steps;
  const fieldsToFill = isTa ? service.fields_to_fill_ta : service.fields_to_fill;
  const fees = isTa ? service.fees_ta : service.fees;
  const processingTime = isTa ? service.processing_time_ta : service.processing_time;
  const checklistWarnings = isTa ? service.checklist_warnings_ta : service.checklist_warnings;

  // Interactive Document Checklist State
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  const toggleDoc = (index: number) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // AI Service Assistant State
  const [assistantInput, setAssistantInput] = useState('');
  const [chatHistory, setChatHistory] = useState<AssistantMsg[]>([
    {
      sender: 'assistant',
      text: isTa
        ? `வணக்கம்! '${title}' சேவை பற்றி உங்களுக்கு ஏதேனும் சந்தேகம் உள்ளதா? கீழே உள்ள கேள்விகளை கிளிக் செய்யலாம் அல்லது நேரடியாக தட்டச்சு செய்யலாம்.`
        : `Hello! Do you have any questions about '${title}'? Click a common prompt below or type your question.`,
    },
  ]);

  const handleAskAssistant = (questionText?: string) => {
    const query = (questionText || assistantInput).trim();
    if (!query) return;

    const userMsg: AssistantMsg = { sender: 'citizen', text: query };
    const answerText = ServiceResolver.answerAssistantQuestion(service, query, language);
    const botMsg: AssistantMsg = { sender: 'assistant', text: answerText };

    setChatHistory((prev) => [...prev, userMsg, botMsg]);
    if (!questionText) setAssistantInput('');
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-guide-title"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-bold border border-civic-200">
              <Building className="w-3.5 h-3.5 text-civic-700" />
              <span>{category}</span>
            </div>
            <h2 id="service-guide-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t.serviceGuideSubtitle || 'Official Government Service Information & Application Guide'}
            </p>
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
          {/* 1. What is this service? */}
          <section className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>{t.guideWhatIsIt || 'What is this service?'}</span>
            </h3>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
              {whatIsIt}
            </p>
          </section>

          {/* 2. Who can apply? */}
          <section className="space-y-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>{t.guideWhoCanApply || 'Who can apply?'}</span>
            </h3>
            <ul className="space-y-2 pl-2">
              {whoCanApply.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Documents you may need (Interactive Checklist) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <span>{t.guideDocumentsNeeded || 'Documents you may need'}</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isTa ? 'ஆவண சரிபார்ப்பு பட்டியல்' : 'Interactive Checklist'}
              </span>
            </div>
            <div className="space-y-2">
              {documentsRequired.map((doc, idx) => {
                const isChecked = !!checkedDocs[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(idx)}
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
          </section>

          {/* 4. Information you may need to fill (Fields to fill) */}
          <section className="space-y-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>{t.guideFieldsToFill || 'Information you may need to fill'}</span>
            </h3>
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-900 flex items-center space-x-1.5 mb-1">
                <Info className="w-4 h-4 text-amber-700" />
                <span>{isTa ? 'படிவத்தில் கேட்கப்படும் முக்கிய தகவல்கள்:' : 'Details requested in official online form:'}</span>
              </div>
              <ul className="space-y-1.5 pl-2">
                {fieldsToFill.map((field, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm font-semibold text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 5. Step-by-step Application Process */}
          <section className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                5
              </span>
              <span>{t.guideHowToApply || 'Step-by-step application process'}</span>
            </h3>
            <div className="space-y-2.5">
              {applicationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start space-x-3.5"
                >
                  <div className="w-7 h-7 rounded-xl bg-civic-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Fees & Processing Time */}
          <section className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                6
              </span>
              <span>{t.guideFees || 'Fees & Processing Time'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-800 mt-0.5 shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {t.guideFees || 'Statutory Fee'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{fees}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {t.guideProcessingTime || 'Expected Processing Time'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {processingTime}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Important checklist before submitting */}
          <section className="space-y-2.5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-civic-100 text-civic-800 flex items-center justify-center text-xs font-black">
                7
              </span>
              <span>{t.guideBeforeYouSubmit || 'Important checklist before submitting'}</span>
            </h3>
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
              {checklistWarnings.map((warning, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm font-semibold text-rose-950">
                  <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 8. OFFICIAL GOVERNMENT PORTAL (PROMINENT TRUST CARD) */}
          {/* ========================================================================= */}
          <section className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-[#123B6D] to-[#0A2540] text-white space-y-4 shadow-xl border border-[#123B6D]/40">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.guideOfficialNoticeTitle || 'OFFICIAL GOVERNMENT PORTAL'}</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-black text-white">{service.official_portal_name}</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {t.guideOfficialNoticeDesc ||
                  'CivicOS provides simplified guidance and document checklists. All formal submissions, verifications, and statutory fee payments take place directly on the verified official government portal.'}
              </p>
            </div>

            <div className="pt-1">
              <a
                href={service.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2.5 px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all min-h-[56px] w-full sm:w-auto"
              >
                <span>{t.openOfficialPortalBtn || 'Open Official Website'}</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 9. AI SERVICE ASSISTANT ("Need help? Ask CivicOS") */}
          {/* ========================================================================= */}
          <section className="p-5 sm:p-6 rounded-3xl bg-slate-50 border-2 border-civic-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-civic-700 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    {t.askCivicOSAssistantTitle || 'Need help? Ask CivicOS Assistant'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.askCivicOSAssistantSubtitle ||
                      'Get instant answers about documents, form fields, fees, or application steps.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isTa ? 'பொதுவான கேள்விகள் (கிளிக் செய்க):' : 'Common questions (click to ask):'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAskAssistant(t.quickPromptDocs || 'What documents do I need?')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-civic-100 border border-slate-200 text-xs font-bold text-slate-700 text-left transition-all"
                >
                  {t.quickPromptDocs || 'What documents do I need?'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAssistant(t.quickPromptFields || 'What information do I fill?')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-civic-100 border border-slate-200 text-xs font-bold text-slate-700 text-left transition-all"
                >
                  {t.quickPromptFields || 'What information do I fill?'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAssistant(t.quickPromptSteps || 'How to apply?')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-civic-100 border border-slate-200 text-xs font-bold text-slate-700 text-left transition-all"
                >
                  {t.quickPromptSteps || 'How to apply?'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAskAssistant(t.quickPromptFees || 'What are the fees & SLA?')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-civic-100 border border-slate-200 text-xs font-bold text-slate-700 text-left transition-all"
                >
                  {t.quickPromptFees || 'What are the fees & SLA?'}
                </button>
              </div>
            </div>

            {/* Chat History Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 max-h-56 overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'citizen' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[88%] ${
                      msg.sender === 'citizen'
                        ? 'bg-civic-800 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-900 rounded-bl-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Assistant Question Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAssistant();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder={t.askPlaceholder || 'Ask a question about this service...'}
                className="flex-1 px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-civic-800 hover:bg-civic-900 text-white font-bold text-xs sm:text-sm min-h-[48px] flex items-center space-x-1.5 transition-all focus:ring-2 focus:ring-civic-600 focus:outline-none"
              >
                <span>{t.askBtn || 'Ask'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
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
            href={service.official_portal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-bold text-xs sm:text-sm min-h-[48px] shadow-sm transition-all flex items-center space-x-2 focus:ring-2 focus:ring-civic-600 focus:outline-none"
          >
            <span>{t.openOfficialPortalBtn || 'Open Official Website'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
