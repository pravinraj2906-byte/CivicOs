import React from 'react';
import { Grievance } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { getLocalizedTitle } from '../i18n/formatters';
import { getStatusBadge } from './GrievanceTable';
import { Activity, ArrowRight } from 'lucide-react';

interface RecentActivitySectionProps {
  grievances: Grievance[];
  onSelectGrievance: (g: Grievance) => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  grievances,
  onSelectGrievance,
}) => {
  const { t, language } = useAuth();

  // Take the most recently updated 4 grievances
  const recentGrievances = [...grievances]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 4);

  if (recentGrievances.length === 0) {
    return null;
  }

  const formatTimeAgo = (isoString: string) => {
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
    <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-civic-50 border border-civic-200 flex items-center justify-center text-civic-700">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {t.recentActivityTitle || 'Recent Operational Activity'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'ta' ? 'சமீபத்தில் பதிவான மற்றும் நிலை புதுப்பிக்கப்பட்ட புகார்கள்' : 'Latest updates and actions across the department queue'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recentGrievances.map((g) => {
          const st = getStatusBadge(g.status, t);
          const localizedTitle = getLocalizedTitle(g.title, language);
          const timeAgo = formatTimeAgo(g.updated_at || g.created_at);

          return (
            <div
              key={g.id}
              onClick={() => onSelectGrievance(g)}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] font-bold text-civic-700">
                    {g.tracking_id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {timeAgo}
                  </span>
                </div>

                <div className="text-xs font-extrabold text-slate-900 line-clamp-2 group-hover:text-civic-700 transition-colors">
                  {localizedTitle}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] ${st.bg}`}>
                  {st.icon}
                  <span>{st.label}</span>
                </span>

                <span className="text-xs font-bold text-civic-700 group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                  <span className="text-[11px]">{t.viewBtn || 'View'}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
