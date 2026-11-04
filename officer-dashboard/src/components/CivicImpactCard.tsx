import React from 'react';
import { Grievance } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { getPriorityBadge, getStatusBadge } from './GrievanceTable';
import {
  getLocalizedDepartment,
  getLocalizedCategory,
  getLocalizedTitle,
  getLocalizedDescription,
  getLocalizedLocation,
} from '../i18n/formatters';
import {
  MapPin,
  Users,
  ShieldCheck,
  Building,
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface CivicImpactCardProps {
  grievance: Grievance;
  onSelectGrievance: (g: Grievance) => void;
}

export const CivicImpactCard: React.FC<CivicImpactCardProps> = ({
  grievance,
  onSelectGrievance,
}) => {
  const { t, language } = useAuth();

  const priorityBadge = getPriorityBadge(grievance.priority, t);
  const statusBadge = getStatusBadge(grievance.status, t);

  const isResolved = grievance.status === 'RESOLVED';
  const isInProgress = grievance.status === 'IN_PROGRESS';
  const isCritical = grievance.priority === 'CRITICAL';
  const isHigh = grievance.priority === 'HIGH';

  const dateStr = new Date(grievance.created_at).toLocaleDateString(
    language === 'ta' ? 'ta-IN' : 'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const displayTitle = getLocalizedTitle(grievance.title, language);
  const displayDescription = getLocalizedDescription(grievance.description, language);
  const rawLocation = [
    grievance.location,
    grievance.landmark ? `${t.landmarkPrefix} ${grievance.landmark}` : null,
  ]
    .filter(Boolean)
    .join(' • ');
  const displayLocation = getLocalizedLocation(rawLocation, language);
  const displayDept = getLocalizedDepartment(grievance.department, t);
  const displayCategory = getLocalizedCategory(grievance.category, language);

  const urgencyScore = grievance.urgency_score;
  const urgencyPct =
    urgencyScore !== null && urgencyScore !== undefined
      ? Math.round(urgencyScore * 100)
      : null;

  const communityCount = grievance.community_count || 0;

  // Safe author name placeholder based on tracking ID or citizen ID
  const safeAuthorName = `Citizen #${grievance.citizen_id || grievance.tracking_id.slice(-4)}`;

  return (
    <div
      onClick={() => onSelectGrievance(grievance)}
      className={`rounded-3xl bg-white border transition-all duration-200 shadow-card hover:shadow-card-hover cursor-pointer p-5 sm:p-6 space-y-4 text-left group touch-active ${
        isResolved
          ? 'border-emerald-200 ring-1 ring-emerald-100'
          : isCritical
          ? 'border-red-200 ring-1 ring-red-100 bg-red-50/10'
          : isHigh
          ? 'border-orange-200 ring-1 ring-orange-100'
          : isInProgress
          ? 'border-amber-200 ring-1 ring-amber-50'
          : 'border-slate-200'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${grievance.tracking_id} - ${displayTitle}`}
    >
      {/* 1. Header & Tracking ID */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              grievance.tracking_id
            )}`}
            alt="Citizen Profile"
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 shrink-0 object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 text-sm truncate">
                {safeAuthorName}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {t.civicResident}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-civic-50 text-civic-800 border border-civic-200 text-xs font-bold"
            title={t.civicOSVerified}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-civic-600" />
            <span className="hidden sm:inline">{t.civicOSVerified}</span>
          </span>
          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            {grievance.tracking_id}
          </span>
        </div>
      </div>

      {/* 2. Badges Row: Status, Priority, Department, Urgency */}
      <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-100">
        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs border ${statusBadge.bg}`}>
          {statusBadge.icon}
          <span>{statusBadge.label}</span>
        </span>

        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs border ${priorityBadge.bg}`}>
          <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`} />
          <span>{priorityBadge.label}</span>
        </span>

        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>{displayDept}</span>
        </span>

        {displayCategory && (
          <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-medium">
            {displayCategory}
          </span>
        )}

        {urgencyPct !== null && (
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs border font-bold ${
              urgencyPct >= 80
                ? 'bg-red-50 text-red-900 border-red-200'
                : urgencyPct >= 50
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{urgencyPct}% {t.aiUrgencyScore}</span>
          </span>
        )}
      </div>

      {/* 3. Issue Title & Description */}
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-civic-700 transition-colors">
          {displayTitle}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {/* 4. Location Pin */}
      {displayLocation && (
        <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <MapPin className="w-4 h-4 text-civic-600 shrink-0" />
          <span className="truncate">{displayLocation}</span>
        </div>
      )}

      {/* 5. Resolution Story Highlight OR Latest AI Suggestion */}
      {isResolved ? (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.resolutionStoryBanner}</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">
              {displayDept}
            </span>
          </div>
          <p className="text-xs text-emerald-800 font-medium">
            {language === 'ta'
              ? 'இந்த முறைப்பாடு வெற்றிகரமாக தீர்க்கப்பட்டு பொது தணிக்கைப் பதிவேட்டில் உறுதி செய்யப்பட்டுள்ளது.'
              : 'This civic issue was successfully resolved and verified in the public audit record.'}
          </p>
        </div>
      ) : grievance.suggested_initial_action ? (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 space-y-1">
          <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t.recommendedActionLabel}</span>
          </div>
          <p className="text-xs text-blue-800 line-clamp-2 leading-relaxed">
            {grievance.suggested_initial_action}
          </p>
        </div>
      ) : null}

      {/* 6. Community Impact Bar & Operational Action CTA */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Real Community Impact Count */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
              communityCount > 0
                ? 'bg-civic-50 text-civic-700 border-civic-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>
          <div>
            {communityCount > 0 ? (
              <span>
                <strong className="font-extrabold text-sm text-slate-900">
                  {communityCount}
                </strong>{' '}
                <span className="text-slate-700 font-semibold">
                  {communityCount === 1
                    ? t.singleCitizenAffected
                    : t.communityCountLabel.replace('{count}', communityCount.toString())}
                </span>
              </span>
            ) : (
              <span className="text-slate-500 font-medium">
                {t.noCommunityConfirmations}
              </span>
            )}
          </div>
        </div>

        {/* View & Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectGrievance(grievance);
          }}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-2xl bg-civic-600 hover:bg-civic-700 text-white text-xs font-bold transition-all shadow-touch min-h-[40px] shrink-0"
        >
          <span>{t.viewAndActionBtn}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
