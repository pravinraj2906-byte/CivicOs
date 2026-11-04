import React, { useState, useEffect } from 'react';
import { Grievance, GrievanceDetail } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusUpdateForm } from './StatusUpdateForm';
import { getPriorityBadge, getStatusBadge } from './GrievanceTable';
import { calculateSLA } from '../utils/slaCalculator';
import {
  getLocalizedDepartment,
  getLocalizedCategory,
  getLocalizedTitle,
  getLocalizedDescription,
  getLocalizedSummary,
  getLocalizedLocation,
} from '../i18n/formatters';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  User,
  History,
  Tag,
  AlertCircle,
  Building2,
  RotateCw,
  FileText,
} from 'lucide-react';

interface GrievanceDetailModalProps {
  grievanceSummary: Grievance;
  onClose: () => void;
  onGrievanceUpdated: (updated: GrievanceDetail) => void;
}

export const GrievanceDetailModal: React.FC<GrievanceDetailModalProps> = ({
  grievanceSummary,
  onClose,
  onGrievanceUpdated,
}) => {
  const { t, language } = useAuth();
  const [detail, setDetail] = useState<GrievanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getOfficerGrievanceDetail(grievanceSummary.id);
      setDetail(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || t.failedDetailTitle);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [grievanceSummary.id]);

  const handleUpdateSuccess = (updated: GrievanceDetail) => {
    setDetail(updated);
    onGrievanceUpdated(updated);
  };

  const currentGrievance = detail || grievanceSummary;
  const priorityBadge = getPriorityBadge(currentGrievance.priority, t);
  const statusBadge = getStatusBadge(currentGrievance.status, t);
  const sla = calculateSLA(currentGrievance.created_at, currentGrievance.priority, currentGrievance.status);

  const displayTitle = getLocalizedTitle(currentGrievance.title, language);
  const displayDescription = getLocalizedDescription(currentGrievance.description, language);
  const displaySummary = getLocalizedSummary(currentGrievance.ai_summary, language);

  const rawLocation = [
    currentGrievance.location,
    currentGrievance.landmark ? `${t.landmarkPrefix || 'Near'} ${currentGrievance.landmark}` : null,
  ]
    .filter(Boolean)
    .join(' • ') || (language === 'ta' ? 'இடம் குறிப்பிடப்படவில்லை' : 'Location not specified');
  const displayLocation = getLocalizedLocation(rawLocation, language);

  const displayDept = getLocalizedDepartment(currentGrievance.department, t);
  const displayCategory = getLocalizedCategory(currentGrievance.category, language);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div className="relative w-full max-w-4xl bg-slate-50 border-l border-slate-200 h-full min-h-screen shadow-2xl flex flex-col z-10">
        {/* ================================================================= */}
        {/* MODAL HEADER                                                      */}
        {/* ================================================================= */}
        <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-black text-civic-800 bg-civic-50 border border-civic-200 px-3 py-1 rounded-xl">
              {currentGrievance.tracking_id}
            </span>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${priorityBadge.bg}`}>
              {priorityBadge.icon}
              <span>{priorityBadge.label}</span>
            </span>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${statusBadge.bg}`}>
              {statusBadge.icon}
              <span>{statusBadge.label}</span>
            </span>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${sla.badgeBg}`}>
              <span className={`w-2 h-2 rounded-full ${sla.dotColor}`} />
              <span>{language === 'ta' ? sla.formattedText_ta : sla.formattedText}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchDetail}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reload details"
              aria-label="Reload details"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-civic-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close drawer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MODAL BODY                                                        */}
        {/* ================================================================= */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. ISSUE: WHAT HAPPENED? */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-civic-600" />
                <span>{t.whatHappenedQuestion || 'What happened?'}</span>
              </h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {displayCategory}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {displayTitle}
            </h2>
            <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {displayDescription}
            </p>
          </div>

          {/* 2. LOCATION & CITIZEN INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-card space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-civic-600" />
                <span>{t.whereHappenedQuestion || 'Where did it happen?'}</span>
              </h3>
              <div className="text-sm font-bold text-slate-900 leading-snug">
                {displayLocation}
              </div>
              <div className="text-xs text-slate-500 font-medium flex items-center space-x-1 pt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayDept}</span>
              </div>
            </div>

            {/* Citizen Info (Authorized scope only) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-card space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-civic-600" />
                <span>{t.citizenDetailsTitle || 'Citizen Information'}</span>
              </h3>
              <div className="text-sm font-bold text-slate-900">
                {detail?.citizen?.name || 'Registered Citizen'}
              </div>
              <div className="text-xs text-slate-500 font-medium flex items-center space-x-3 pt-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(currentGrievance.created_at).toLocaleDateString()}</span>
                </span>
                <span>•</span>
                <span>{detail?.citizen?.district || 'Bengaluru Urban'}</span>
              </div>
            </div>
          </div>

          {/* 3. COMMUNITY IMPACT (If confirmed by multiple citizens) */}
          {currentGrievance.community_count && currentGrievance.community_count > 1 ? (
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  {currentGrievance.community_count}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black">
                    {language === 'ta'
                      ? `${currentGrievance.community_count} குடிமக்கள் இந்த புகாரை உறுதிப்படுத்தியுள்ளனர்`
                      : `High Community Impact • ${currentGrievance.community_count} Citizens Confirmed`}
                  </div>
                  <div className="text-[11px] text-blue-800 font-medium">
                    {language === 'ta'
                      ? 'இப்பகுதியில் பல குடிமக்கள் இதே பிரச்சனையை தெரிவித்துள்ளனர்.'
                      : 'Multiple neighborhood residents confirmed facing the same civic problem.'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* 4. AI-ASSISTED ASSESSMENT */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-civic-50 border border-civic-200 flex items-center justify-center text-civic-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    {t.aiAssistedAssessment || 'AI-Assisted Assessment'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t.aiAssistedDisclaimer || 'AI assists with categorization and priority triage. Final decisions remain with the officer.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t.assignedCategoryLabel || 'Assessed Category'}
                </span>
                <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                  {displayCategory}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t.priorityLevelLabel || 'Assessed Priority'}
                </span>
                <div className="text-xs font-extrabold text-slate-900 mt-0.5 flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`} />
                  <span>{priorityBadge.label}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {t.targetDepartmentLabel || 'Department Routing'}
                </span>
                <div className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">
                  {displayDept}
                </div>
              </div>
            </div>

            {/* AI Executive Summary */}
            {displaySummary && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t.executiveSummaryLabel || 'Summary of Citizen Report'}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {displaySummary}
                </p>
              </div>
            )}

            {/* Extracted Entities */}
            {currentGrievance.key_entities && currentGrievance.key_entities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Entities:
                </span>
                {currentGrievance.key_entities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    <span>{ent}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5. OFFICER ACTION PANEL */}
          {detail ? (
            <StatusUpdateForm grievance={detail} onUpdateSuccess={handleUpdateSuccess} />
          ) : (
            <div className="h-32 bg-white border border-slate-200 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 text-xs">
              Loading action controls...
            </div>
          )}

          {/* 6. TIMELINE & UPDATE HISTORY */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <History className="w-4 h-4 text-civic-600" />
              <span>{t.recentActivityTitle || 'Activity History & Remarks'}</span>
            </h3>

            {detail?.updates && detail.updates.length > 0 ? (
              <div className="space-y-4 pl-2 border-l-2 border-slate-200">
                {detail.updates.map((upd, idx) => {
                  const upBadge = getStatusBadge(upd.status, t);
                  return (
                    <div key={idx} className="relative pl-6 space-y-1">
                      <div className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-civic-600" />
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${upBadge.bg}`}>
                          {upBadge.icon}
                          <span>{upBadge.label}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(upd.created_at).toLocaleString()}
                        </span>
                      </div>
                      {upd.remarks && (
                        <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {upd.remarks}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {upd.officer?.name ? `Action by: ${upd.officer.name}` : 'System logged update'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">
                {language === 'ta' ? 'கூடுதல் நடவடிக்கைகள் எதுவும் இல்லை' : 'No previous status updates recorded yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
