import React, { useState } from 'react';
import { GrievanceStatus, GrievanceDetail } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getStatusBadge } from './GrievanceTable';
import { Send, CheckCircle2, Clock, XCircle, Sparkles, Check, Info, AlertCircle } from 'lucide-react';

interface StatusUpdateFormProps {
  grievance: GrievanceDetail;
  onUpdateSuccess: (updated: GrievanceDetail) => void;
}

export const StatusUpdateForm: React.FC<StatusUpdateFormProps> = ({
  grievance,
  onUpdateSuccess,
}) => {
  const { t, language } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<GrievanceStatus>(
    grievance.status === 'TRIAGED' ? 'IN_PROGRESS' : grievance.status
  );
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quickRemarks = [
    t.quickRemark1 || 'Inspection team dispatched to location.',
    t.quickRemark2 || 'Work order issued to maintenance contractor.',
    t.quickRemark3 || 'Issue resolved and verified on-site.',
    t.quickRemark4 || 'Required materials/parts procured for field repair.',
    t.quickRemark5 || 'Field verification completed successfully.',
    t.quickRemark6 || 'Referred to municipal engineering wing.',
  ];

  const statusOptions: { value: GrievanceStatus; label: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'IN_PROGRESS',
      label: t.markInProgress || 'In Progress',
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      color: 'hover:border-amber-400 hover:bg-amber-50/80 peer-checked:border-amber-600 peer-checked:bg-amber-100 peer-checked:text-amber-950 font-bold',
    },
    {
      value: 'RESOLVED',
      label: t.markResolved || 'Mark Resolved',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      color: 'hover:border-emerald-400 hover:bg-emerald-50/80 peer-checked:border-emerald-600 peer-checked:bg-emerald-100 peer-checked:text-emerald-950 font-bold',
    },
    {
      value: 'REJECTED',
      label: t.markRejected || 'Mark Rejected',
      icon: <XCircle className="w-4 h-4 text-red-600" />,
      color: 'hover:border-red-400 hover:bg-red-50/80 peer-checked:border-red-600 peer-checked:bg-red-100 peer-checked:text-red-950 font-bold',
    },
    {
      value: 'TRIAGED',
      label: t.markTriaged || 'Keep Triaged',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />,
      color: 'hover:border-blue-400 hover:bg-blue-50/80 peer-checked:border-blue-600 peer-checked:bg-blue-100 peer-checked:text-blue-950 font-bold',
    },
  ];

  const currentStatusBadge = getStatusBadge(grievance.status, t);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = remarks.trim();
    if (selectedStatus === 'RESOLVED') {
      if (trimmed.length < 10 || ['done', 'ok', 'resolved', 'fine', 'closed', 'fixed', 'all ok', 'completed'].includes(trimmed.toLowerCase())) {
        setErrorMsg(t.meaningfulNoteRequired || 'Please enter a descriptive resolution note explaining the action taken (minimum 10 characters).');
        return;
      }
    } else if (selectedStatus === 'IN_PROGRESS' || selectedStatus === 'REJECTED') {
      if (trimmed.length < 8) {
        setErrorMsg(language === 'ta' ? 'தயவுசெய்து விரிவான நடவடிக்கை அல்லது காரணக் குறிப்பை உள்ளிடவும்.' : 'Please provide an actionable field note (minimum 8 characters).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updated = await apiService.updateGrievanceStatus(grievance.id, {
        status: selectedStatus,
        remarks: trimmed || undefined,
      });

      setSuccessMsg(t.statusUpdateSuccess || 'Status updated successfully.');
      setRemarks('');
      onUpdateSuccess(updated);

      setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Failed to update grievance status';
      setErrorMsg(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
          <Send className="w-4 h-4 text-civic-600" />
          <span>{t.officerActionTitle || 'Take Action / Update Status'}</span>
        </h4>
        <span className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
          <span>{t.currentStatusLabel || 'Current:'}</span>
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold border ${currentStatusBadge.bg}`}>
            {currentStatusBadge.icon}
            <span>{currentStatusBadge.label}</span>
          </span>
        </span>
      </div>

      {/* Citizen Communication Notice */}
      <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <span className="font-medium leading-relaxed">
          {t.citizenTrackingNotice || 'Updating the status will allow the citizen to track progress in real-time.'}
        </span>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center space-x-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selection Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {t.selectNextActionLabel || 'Set New Lifecycle Status'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((opt) => (
              <label
                key={opt.value}
                className="relative flex items-center p-3 rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer transition-all hover:bg-slate-100 min-h-[48px]"
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={selectedStatus === opt.value}
                  onChange={() => setSelectedStatus(opt.value)}
                  className="peer sr-only"
                />
                <div className={`w-full flex items-center space-x-2 rounded-xl text-xs transition-all ${opt.color}`}>
                  {opt.icon}
                  <span className="font-bold truncate">{opt.label}</span>
                  {selectedStatus === opt.value && (
                    <Check className="w-3.5 h-3.5 ml-auto text-civic-700 shrink-0" />
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Remarks / Action Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.officerRemarksLabel || 'Action Notes / Official Remarks'}
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'ta' ? 'குடிமகனுக்கு தெரியும்' : 'Visible to citizen in timeline'}
            </span>
          </div>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'கள நடவடிக்கை அல்லது ஆய்வு குறிப்புகளை உள்ளிடவும்...'
                : 'Enter field dispatch notes, inspection findings, or resolution summary...'
            }
            className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-civic-600 focus:border-civic-600 transition-all placeholder:text-slate-400 resize-none"
          />

          {/* Quick Preset Remarks */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
              Presets:
            </span>
            {quickRemarks.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRemarks(qr)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all text-left truncate max-w-[260px]"
                title={qr}
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-civic-700 hover:bg-civic-800 active:bg-civic-900 text-white text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-md transition-all disabled:opacity-50 min-h-[48px]"
        >
          <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
          <span>
            {isSubmitting
              ? (t.recordingAction || 'Submitting Update...')
              : (t.submitStatusBtn || 'Update Status')}
          </span>
        </button>
      </form>
    </div>
  );
};
