import React from 'react';
import { Grievance } from '../../types/api';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { UrgencyGauge } from '../common/UrgencyGauge';
import { MapPin, Calendar, ChevronRight, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getLocalizedDepartment,
  getLocalizedTitle,
  getLocalizedDescription,
  getLocalizedLocation,
} from '../../i18n/formatters';

interface GrievanceCardProps {
  grievance: Grievance;
  onClick: () => void;
}

export const GrievanceCard: React.FC<GrievanceCardProps> = ({ grievance, onClick }) => {
  const { t, language } = useAuth();

  const dateStr = new Date(grievance.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Dynamic presentation localization for title, description, and location
  const displayTitle = getLocalizedTitle(grievance.title, language);
  const displayDescription = getLocalizedDescription(grievance.description, language);
  const rawLocation = [grievance.location, grievance.landmark ? `${t.landmarkPrefix} ${grievance.landmark}` : null]
    .filter(Boolean)
    .join(' • ');
  const displayLocation = getLocalizedLocation(rawLocation, language);

  // Backend values formatted for presentation
  const displayDept = getLocalizedDepartment(grievance.department, language);

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all cursor-pointer space-y-3.5 group touch-active"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Grievance ${grievance.tracking_id}: ${displayTitle}, Status: ${grievance.status}`}
    >
      {/* Top row: Tracking ID, Date, and Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-civic-700 bg-civic-50 px-2.5 py-1 rounded-md border border-civic-200">
            {grievance.tracking_id}
          </span>
          <StatusBadge status={grievance.status} size="sm" />
        </div>
        <div className="flex items-center text-xs text-slate-500 font-medium space-x-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateStr}</span>
        </div>
      </div>

      {/* Title & Description preview */}
      <div>
        <h3 className="font-bold text-base text-slate-900 group-hover:text-civic-700 transition-colors line-clamp-1">
          {displayTitle}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {/* Location / Landmark */}
      {displayLocation && (
        <div className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1.5 shrink-0" />
          <span className="truncate">{displayLocation}</span>
        </div>
      )}

      {/* Department, Priority & Urgency */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <div className="flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <Building className="w-3 h-3 text-slate-500 mr-1" />
            <span>{displayDept}</span>
          </div>
          <PriorityBadge priority={grievance.priority} size="sm" />
        </div>

        <div className="flex items-center space-x-1 text-xs font-bold text-civic-700 group-hover:translate-x-0.5 transition-transform">
          <span>{t.track}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Urgency Gauge if present */}
      {grievance.urgency_score !== null && grievance.urgency_score !== undefined && (
        <div className="pt-1">
          <UrgencyGauge score={grievance.urgency_score} showLabel={false} />
        </div>
      )}
    </div>
  );
};
