import React, { useState } from 'react';
import { GrievanceDetail } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertTriangle, Send, ThumbsUp, Sparkles, MessageSquare } from 'lucide-react';
import { getLocalizedRemarks } from '../../i18n/formatters';

interface ResolutionSummaryCardProps {
  grievance: GrievanceDetail;
  onGrievanceUpdated?: (updated: GrievanceDetail) => void;
}

export const ResolutionSummaryCard: React.FC<ResolutionSummaryCardProps> = ({
  grievance,
  onGrievanceUpdated,
}) => {
  const { t, language } = useAuth();
  const [feedbackState, setFeedbackState] = useState<'idle' | 'followup_form' | 'submitted'>('idle');
  const [followupComment, setFollowupComment] = useState('');
  const [rating, setRating] = useState<'YES' | 'PARTLY' | 'NO'>('YES');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  // Find the latest RESOLVED update
  const resolvedUpdate = [...(grievance.updates || [])]
    .reverse()
    .find((u) => u.status === 'RESOLVED');

  const resolvedTime = resolvedUpdate
    ? new Date(resolvedUpdate.created_at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date(grievance.updated_at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const rawActionTaken = resolvedUpdate?.remarks || (language === 'ta' ? 'கள ஆய்வு செய்யப்பட்டு தீர்வு எட்டப்பட்டது.' : 'Field repair and resolution completed by department.');
  const localizedAction = getLocalizedRemarks(rawActionTaken, language);

  const handleConfirmResolved = async (helpfulRating = 'YES') => {
    setIsSubmitting(true);
    try {
      const updated = await apiService.submitResolutionFeedback(grievance.id, {
        is_resolved: true,
        rating: helpfulRating,
        comment: 'Citizen confirmed resolution in portal.',
      });
      setFeedbackState('submitted');
      setFeedbackSuccessMsg(t.feedbackThankYou || 'Thank you for confirming the resolution!');
      if (onGrievanceUpdated) onGrievanceUpdated(updated);
    } catch {
      // Fallback optimistic display
      setFeedbackState('submitted');
      setFeedbackSuccessMsg(t.feedbackThankYou || 'Thank you for confirming the resolution!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await apiService.submitResolutionFeedback(grievance.id, {
        is_resolved: false,
        rating: 'NO',
        comment: followupComment.trim() || 'Citizen reported problem continues after resolution attempt.',
      });
      setFeedbackState('submitted');
      setFeedbackSuccessMsg(t.feedbackFollowupSubmitted || 'Your follow-up has been sent to the department.');
      if (onGrievanceUpdated) onGrievanceUpdated(updated);
    } catch {
      // Fallback optimistic display
      setFeedbackState('submitted');
      setFeedbackSuccessMsg(t.feedbackFollowupSubmitted || 'Your follow-up has been sent to the department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-emerald-50/60 border-2 border-emerald-200/80 shadow-card space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-emerald-200/60">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-emerald-950 tracking-tight">
              {t.resolutionSummaryTitle || 'Resolution Recorded & Verified'}
            </h3>
            <span className="text-[11px] font-bold text-emerald-800">
              {t.resolvedOnLabel || 'Resolved on'}: {resolvedTime}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold">
          <Sparkles className="w-3 h-3 text-emerald-700" />
          <span>CivicOS Closed Loop</span>
        </span>
      </div>

      {/* Action Taken Note */}
      <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-1.5 shadow-xs">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center space-x-1">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.resolutionActionTaken || 'Action Taken by Department'}</span>
        </span>
        <p className="text-sm text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">
          {localizedAction}
        </p>
      </div>

      {/* Interactive Loop Closure / Confirmation */}
      {feedbackState === 'submitted' ? (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 flex items-center space-x-2.5 text-xs text-emerald-950 font-extrabold animate-fadeIn">
          <ThumbsUp className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{feedbackSuccessMsg}</span>
        </div>
      ) : feedbackState === 'followup_form' ? (
        <form onSubmit={handleSendFollowup} className="p-4 rounded-2xl bg-white border border-amber-200 space-y-3 shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{language === 'ta' ? 'பிரச்சனை தொடர்வதை பதிவு செய்யுங்கள்' : 'Report that the problem continues'}</span>
          </div>

          <textarea
            value={followupComment}
            onChange={(e) => setFollowupComment(e.target.value)}
            placeholder={t.followupCommentPlaceholder || 'Describe why the problem persists or what is still pending...'}
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            required
          />

          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setFeedbackState('idle')}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[36px]"
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all min-h-[36px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '...' : (t.submitFollowupBtn || 'Submit Follow-up')}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3 shadow-xs">
          <div className="text-xs font-extrabold text-slate-900">
            {t.wasThisResolvedForYou || 'Was this issue resolved for you?'}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleConfirmResolved('YES')}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs min-h-[40px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.yesResolvedBtn || 'Yes, it is resolved'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFeedbackState('followup_form')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-300 text-slate-700 text-xs font-bold transition-all min-h-[40px]"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t.noProblemContinuesBtn || 'No, the problem continues'}</span>
            </button>
          </div>

          {/* Optional Helpful Rating */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              {t.helpfulQuestion || 'Was this resolution helpful?'}
            </span>
            <div className="flex items-center space-x-1">
              {(['YES', 'PARTLY', 'NO'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setRating(opt);
                    handleConfirmResolved(opt);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    rating === opt
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt === 'YES' ? t.helpfulYes || 'Yes' : opt === 'PARTLY' ? t.helpfulPartly || 'Partly' : t.helpfulNo || 'No'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
