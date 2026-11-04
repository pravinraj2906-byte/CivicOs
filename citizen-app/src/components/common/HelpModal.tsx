import React from 'react';
import { X, ShieldAlert, Sparkles, Clock, Award, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const { t } = useAuth();

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-elevated overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-civic-500 flex items-center justify-center text-white font-bold">
              ?
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">{t.helpModalTitle}</h3>
              <p className="text-xs text-slate-300">{t.helpModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t.close}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800 text-sm leading-relaxed">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{t.helpStep1Title}</h4>
              <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                {t.helpStep1Desc}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{t.helpStep2Title}</h4>
              <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                {t.helpStep2Desc}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{t.helpStep3Title}</h4>
              <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                {t.helpStep3Desc}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{t.helpStep4Title}</h4>
              <p className="text-slate-700 text-xs mt-0.5 leading-relaxed">
                {t.helpStep4Desc}
              </p>
            </div>
          </div>

          {/* Support Helpline Note */}
          <div className="p-3.5 rounded-2xl bg-civic-50 border border-civic-200 flex items-center space-x-3">
            <Phone className="w-5 h-5 text-civic-700 shrink-0" />
            <div className="text-xs text-civic-900 leading-relaxed font-medium">
              {t.helpHelplineNote}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-sm shadow-md transition-all min-h-[48px]"
          >
            {t.helpGotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
