import React from 'react';
import { Grievance, GrievancePriority, GrievanceStatus } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { TranslationDict } from '../i18n/translations';
import { calculateSLA } from '../utils/slaCalculator';
import {
  getLocalizedDepartment,
  getLocalizedTitle,
  getLocalizedLocation,
} from '../i18n/formatters';
import {
  Sparkles,
  MapPin,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface GrievanceTableProps {
  grievances: Grievance[];
  isLoading: boolean;
  onSelectGrievance: (g: Grievance) => void;
}

export const getPriorityBadge = (priority: GrievancePriority | string, t?: TranslationDict) => {
  switch (priority?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50 border-red-300 text-red-950 font-extrabold',
        dot: 'bg-red-600',
        icon: <Flame className="w-3.5 h-3.5 text-red-600 shrink-0" />,
        label: t ? t.prioCritical.toUpperCase() : 'CRITICAL',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 border-orange-300 text-orange-950 font-bold',
        dot: 'bg-orange-600',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />,
        label: t ? t.prioHigh.toUpperCase() : 'HIGH',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50 border-amber-300 text-amber-950 font-bold',
        dot: 'bg-amber-600',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
        label: t ? t.prioMedium.toUpperCase() : 'MEDIUM',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-slate-100 border-slate-300 text-slate-800 font-medium',
        dot: 'bg-slate-500',
        icon: <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
        label: t ? t.prioLow.toUpperCase() : 'LOW',
      };
  }
};

export const getStatusBadge = (status: GrievanceStatus | string, t?: TranslationDict) => {
  switch (status?.toUpperCase()) {
    case 'RESOLVED':
      return {
        bg: 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />,
        label: t ? t.statusResolved.toUpperCase() : 'RESOLVED',
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-amber-50 border-amber-300 text-amber-950 font-bold',
        icon: <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />,
        label: t ? t.statusInProgress.toUpperCase() : 'IN PROGRESS',
      };
    case 'TRIAGED':
      return {
        bg: 'bg-blue-50 border-blue-300 text-blue-950 font-bold',
        icon: <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />,
        label: t ? t.statusTriaged.toUpperCase() : 'AI TRIAGED',
      };
    case 'REJECTED':
      return {
        bg: 'bg-red-50 border-red-300 text-red-950 font-bold',
        icon: <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0" />,
        label: t ? t.statusRejected.toUpperCase() : 'REJECTED',
      };
    case 'SUBMITTED':
    default:
      return {
        bg: 'bg-slate-100 border-slate-300 text-slate-800 font-bold',
        icon: <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />,
        label: t ? t.statusSubmitted.toUpperCase() : 'SUBMITTED',
      };
  }
};

export const GrievanceTable: React.FC<GrievanceTableProps> = ({
  grievances,
  isLoading,
  onSelectGrievance,
}) => {
  const { t, language } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-card p-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-100/70 rounded-2xl animate-pulse flex items-center justify-between px-6" />
        ))}
      </div>
    );
  }

  if (grievances.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-card space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">
          {t.noGrievancesTitle || 'No grievances found'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          {t.noGrievancesDesc || 'No complaints match the current filter criteria.'}
        </p>
      </div>
    );
  }

  const formatRelativeTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Recently';
      const now = new Date();
      const diffHrs = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
      if (diffHrs < 1) return language === 'ta' ? 'சமீபத்தில்' : 'Just now';
      if (diffHrs < 24) return language === 'ta' ? `${diffHrs} மணி நேரம் முன்` : `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return language === 'ta' ? `${diffDays} நாள் முன்` : `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* DESKTOP / TABLET OPERATIONAL TABLE (>= 768px)                             */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">{t.priorityLevelLabel || 'Priority'}</th>
                <th className="py-3.5 px-4">{t.colIssue || 'Issue & Reference'}</th>
                <th className="py-3.5 px-4">{t.colLocation || 'Location'}</th>
                <th className="py-3.5 px-4">{t.targetDepartmentLabel || 'Department'}</th>
                <th className="py-3.5 px-4">{t.colStatus || 'Status'}</th>
                <th className="py-3.5 px-4">{t.colSLA || 'SLA / Timeline'}</th>
                <th className="py-3.5 px-4">{t.colUpdated || 'Updated'}</th>
                <th className="py-3.5 px-4 text-right">{t.colAction || 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {grievances.map((g) => {
                const prio = getPriorityBadge(g.priority, t);
                const st = getStatusBadge(g.status, t);
                const sla = calculateSLA(g.created_at, g.priority, g.status);
                const localizedTitle = getLocalizedTitle(g.title, language);
                const localizedLoc = getLocalizedLocation(
                  [g.location, g.landmark ? `Nr. ${g.landmark}` : null].filter(Boolean).join(' • '),
                  language
                );
                const localizedDept = getLocalizedDepartment(g.department, t);
                const timeAgo = formatRelativeTime(g.updated_at || g.created_at);

                return (
                  <tr
                    key={g.id}
                    onClick={() => onSelectGrievance(g)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${prio.bg}`}>
                        {prio.icon}
                        <span>{prio.label}</span>
                      </span>
                    </td>

                    {/* Issue & Reference */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-mono text-[11px] font-bold text-civic-700">
                        {g.tracking_id}
                      </div>
                      <div className="font-extrabold text-slate-900 text-xs line-clamp-1 group-hover:text-civic-700 transition-colors">
                        {localizedTitle}
                      </div>
                      {g.community_count && g.community_count > 1 ? (
                        <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 border border-blue-200">
                          <Users className="w-2.5 h-2.5" />
                          <span>{g.community_count} confirmed</span>
                        </div>
                      ) : null}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-[160px]">
                      <div className="flex items-center space-x-1 truncate text-xs">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{localizedLoc || 'Not specified'}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-semibold">
                      <div className="flex items-center space-x-1 text-xs">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{localizedDept}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${st.bg}`}>
                        {st.icon}
                        <span>{st.label}</span>
                      </span>
                    </td>

                    {/* SLA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${sla.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sla.dotColor}`} />
                        <span>{language === 'ta' ? sla.formattedText_ta : sla.formattedText}</span>
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {timeAgo}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectGrievance(g);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition-all shadow-xs min-h-[36px]"
                      >
                        <span>{t.reviewBtn || 'Review'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STACKED OPERATIONAL CARDS (< 768px)                                */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3">
        {grievances.map((g) => {
          const prio = getPriorityBadge(g.priority, t);
          const st = getStatusBadge(g.status, t);
          const sla = calculateSLA(g.created_at, g.priority, g.status);
          const localizedTitle = getLocalizedTitle(g.title, language);
          const localizedLoc = getLocalizedLocation(
            [g.location, g.landmark ? `Nr. ${g.landmark}` : null].filter(Boolean).join(' • '),
            language
          );
          const localizedDept = getLocalizedDepartment(g.department, t);
          const timeAgo = formatRelativeTime(g.updated_at || g.created_at);

          return (
            <div
              key={g.id}
              onClick={() => onSelectGrievance(g)}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-civic-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] ${prio.bg}`}>
                  {prio.icon}
                  <span>{prio.label}</span>
                </span>
                <span className="font-mono text-xs font-bold text-civic-700">
                  {g.tracking_id}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {localizedTitle}
                </h4>
                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{localizedLoc || 'Location not specified'} • {localizedDept}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] ${st.bg}`}>
                  {st.icon}
                  <span>{st.label}</span>
                </span>
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] ${sla.badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sla.dotColor}`} />
                  <span>{language === 'ta' ? sla.formattedText_ta : sla.formattedText}</span>
                </span>
                <span className="text-[10px] text-slate-500 ml-auto font-medium">
                  {timeAgo}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGrievance(g);
                }}
                className="w-full flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition-all shadow-xs min-h-[44px]"
              >
                <span>{t.reviewBtn || 'Review Grievance'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
