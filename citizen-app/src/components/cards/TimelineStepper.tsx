import React from 'react';
import { GrievanceUpdate } from '../../types/api';
import { StatusBadge } from '../common/StatusBadge';
import { History, CheckCircle2, User, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getLocalizedDepartment, getLocalizedRemarks } from '../../i18n/formatters';

interface TimelineStepperProps {
  updates: GrievanceUpdate[];
}

export const TimelineStepper: React.FC<TimelineStepperProps> = ({ updates }) => {
  const { t, language } = useAuth();

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-civic-700" />
          <h3 className="font-bold text-base text-slate-900">{t.timelineTitle}</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {updates.length} {updates.length === 1 ? t.eventCount : t.eventsCount}
        </span>
      </div>

      {/* Stepper timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {updates.map((update, index) => {
          const isLatest = index === updates.length - 1;
          const isResolved = update.status === 'RESOLVED';
          const updateTime = new Date(update.created_at).toLocaleString(language === 'ta' ? 'ta-IN' : 'en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          // Dynamic presentation localization for officer remarks
          const displayRemarks = getLocalizedRemarks(update.remarks, language);
          const displayDept = update.officer ? getLocalizedDepartment(update.officer.department, language) : '';

          return (
            <div key={update.id || index} className="relative space-y-2 group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                  isResolved
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                    : isLatest
                    ? 'border-civic-600 bg-civic-50 text-civic-600 ring-4 ring-civic-100'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                {isResolved ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-civic-600' : 'bg-slate-400'}`} />
                )}
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={update.status} size="sm" />
                    <span className="text-xs font-bold text-slate-800">
                      {update.status === 'SUBMITTED'
                        ? t.timelineStepSubmitted || 'Report submitted'
                        : update.status === 'TRIAGED'
                        ? t.timelineStepUnderstood || 'CivicOS understood the issue'
                        : update.status === 'IN_PROGRESS'
                        ? t.timelineStepOfficerStarted || 'Officer action started'
                        : update.status === 'RESOLVED'
                        ? t.timelineStepResolved || 'Resolution recorded'
                        : update.status}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 font-medium space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{updateTime}</span>
                  </div>
                </div>

                {/* Remarks */}
                {displayRemarks ? (
                  <div className="text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 flex items-start space-x-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">{displayRemarks}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">{t.stateTransitionRecorded}</p>
                )}

                {/* Officer attribution */}
                {update.officer && (
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>
                      {t.officerLabel} <strong>{update.officer.name}</strong> ({displayDept || (language === 'ta' ? 'அலுவலர்' : 'Officer')})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
