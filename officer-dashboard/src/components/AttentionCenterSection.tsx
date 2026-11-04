import React from 'react';
import { Grievance } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { getLocalizedTitle, getLocalizedLocation } from '../i18n/formatters';
import { getPriorityBadge, getStatusBadge } from './GrievanceTable';
import { calculateSLA } from '../utils/slaCalculator';
import { Flame, Clock, Users, ArrowRight, ShieldAlert, MapPin } from 'lucide-react';

interface AttentionCenterSectionProps {
  grievances: Grievance[];
  onSelectGrievance: (g: Grievance) => void;
}

export const AttentionCenterSection: React.FC<AttentionCenterSectionProps> = ({
  grievances,
  onSelectGrievance,
}) => {
  const { t, language } = useAuth();

  // Extract top actionable attention items:
  // 1. Critical priority items (active)
  // 2. SLA at risk items (< 12h remaining)
  // 3. High community impact items (> 1 confirmations)
  const activeGrievances = grievances.filter(
    (g) => g.status !== 'RESOLVED' && g.status !== 'REJECTED'
  );

  const attentionItems: {
    type: 'critical' | 'sla' | 'community';
    grievance: Grievance;
    headline: string;
    subheadline: string;
    icon: React.ReactNode;
    tagBg: string;
  }[] = [];

  // Find Criticals
  const criticals = activeGrievances.filter((g) => g.priority === 'CRITICAL');
  criticals.forEach((g) => {
    attentionItems.push({
      type: 'critical',
      grievance: g,
      headline: language === 'ta' ? 'அவசர முன்னுரிமைப் புகார்' : 'Critical Priority Complaint',
      subheadline: g.ai_summary || g.description,
      icon: <Flame className="w-4 h-4 text-red-600" />,
      tagBg: 'bg-red-50 border-red-200 text-red-950',
    });
  });

  // Find SLA at risk
  const slaRisks = activeGrievances.filter((g) => {
    const sla = calculateSLA(g.created_at, g.priority, g.status);
    return sla.isAtRisk && !criticals.some((c) => c.id === g.id);
  });
  slaRisks.forEach((g) => {
    attentionItems.push({
      type: 'sla',
      grievance: g,
      headline: language === 'ta' ? 'SLA காலக்கெடு நெருங்குகிறது' : 'SLA Response Deadline Approaching',
      subheadline: g.ai_summary || g.description,
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      tagBg: 'bg-amber-50 border-amber-200 text-amber-950',
    });
  });

  // Find Community Impact
  const communityImpacts = activeGrievances.filter(
    (g) =>
      g.community_count &&
      g.community_count > 1 &&
      !criticals.some((c) => c.id === g.id) &&
      !slaRisks.some((s) => s.id === g.id)
  );
  communityImpacts.forEach((g) => {
    attentionItems.push({
      type: 'community',
      grievance: g,
      headline: language === 'ta' ? `${g.community_count} குடிமக்கள் உறுதிப்படுத்தியுள்ளனர்` : `${g.community_count} citizens confirmed this civic issue`,
      subheadline: g.ai_summary || g.description,
      icon: <Users className="w-4 h-4 text-blue-600" />,
      tagBg: 'bg-blue-50 border-blue-200 text-blue-950',
    });
  });

  // Take top 3 for clean executive display
  const displayItems = attentionItems.slice(0, 3);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 border border-amber-200/80 rounded-3xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-amber-100">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>{t.attentionNeeded || 'Needs Your Attention'}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                {displayItems.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              {language === 'ta' ? 'கள நடவடிக்கை அல்லது மறுஆய்வு தேவைப்படும் முதன்மைப் புகார்கள்' : 'Prioritized complaints requiring prompt review and field action'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayItems.map((item) => {
          const g = item.grievance;
          const prioBadge = getPriorityBadge(g.priority, t);
          const statusBadge = getStatusBadge(g.status, t);
          const sla = calculateSLA(g.created_at, g.priority, g.status);
          const localizedTitle = getLocalizedTitle(g.title, language);
          const localizedLoc = getLocalizedLocation(
            [g.location, g.landmark ? `Near ${g.landmark}` : null].filter(Boolean).join(' • '),
            language
          );

          return (
            <div
              key={`${item.type}-${g.id}`}
              className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-card hover:border-civic-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                {/* Alert Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${item.tagBg}`}>
                    {item.icon}
                    <span>{item.headline}</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    {g.tracking_id}
                  </span>
                </div>

                {/* Title & Category */}
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {localizedTitle}
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{localizedLoc || 'Location not specified'}</span>
                  </div>
                </div>

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-extrabold border ${prioBadge.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${prioBadge.dot}`} />
                    <span>{prioBadge.label}</span>
                  </span>

                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.bg}`}>
                    {statusBadge.icon}
                    <span>{statusBadge.label}</span>
                  </span>

                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${sla.badgeBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sla.dotColor}`} />
                    <span>{language === 'ta' ? sla.formattedText_ta : sla.formattedText}</span>
                  </span>
                </div>
              </div>

              {/* Review CTA */}
              <button
                onClick={() => onSelectGrievance(g)}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-civic-700 hover:bg-civic-800 text-white text-xs font-bold transition-all shadow-xs min-h-[40px]"
              >
                <span>{t.reviewBtn || 'Review'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
