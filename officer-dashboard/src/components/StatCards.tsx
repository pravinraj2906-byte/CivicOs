import React from 'react';
import { Grievance } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { calculateSLA } from '../utils/slaCalculator';
import { Clock, CheckCircle2, Inbox, Flame, Users } from 'lucide-react';

interface StatCardsProps {
  grievances: Grievance[];
  activeStatusFilter?: string;
  activePriorityFilter?: string;
  onFilterChange: (type: 'status' | 'priority' | 'special', value: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  grievances,
  activeStatusFilter,
  activePriorityFilter,
  onFilterChange,
}) => {
  const { t } = useAuth();
  
  // Real data calculations
  const total = grievances.length;
  
  // 1. Needs Attention (Active & not yet in progress or resolved)
  const needsAttention = grievances.filter(
    (g) => (g.priority === 'CRITICAL' || g.priority === 'HIGH' || g.status === 'SUBMITTED' || g.status === 'TRIAGED') &&
           g.status !== 'RESOLVED' && g.status !== 'REJECTED'
  ).length;

  // 2. Critical Issues
  const criticalCount = grievances.filter(
    (g) => g.priority === 'CRITICAL' && g.status !== 'RESOLVED' && g.status !== 'REJECTED'
  ).length;

  // 3. SLA At Risk (Calculated via SLA engine)
  const slaAtRiskCount = grievances.filter((g) => {
    const sla = calculateSLA(g.created_at, g.priority, g.status);
    return sla.isAtRisk && g.status !== 'RESOLVED' && g.status !== 'REJECTED';
  }).length;

  // 4. Community Impact (Confirmed by > 1 citizens)
  const communityImpactCount = grievances.filter(
    (g) => (g.community_count && g.community_count > 1) || false
  ).length;

  // 5. Resolved
  const resolved = grievances.filter((g) => g.status === 'RESOLVED').length;

  const cards = [
    {
      id: 'needs_attention',
      title: t.needsAttentionTitle || 'Needs Attention',
      count: needsAttention,
      subtext: t.needsAttentionSubtext || 'Actionable open complaints',
      icon: <Inbox className="w-5 h-5 text-civic-700" />,
      iconBg: 'bg-civic-50 border-civic-200 text-civic-700',
      countColor: 'text-civic-900',
      activeRing: 'ring-2 ring-civic-600 bg-civic-50/50 border-civic-300',
      onClick: () => onFilterChange('status', 'TRIAGED'),
      isActive: activeStatusFilter === 'TRIAGED' || activeStatusFilter === 'SUBMITTED',
    },
    {
      id: 'critical',
      title: t.prioCritical || 'Critical',
      count: criticalCount,
      subtext: 'Immediate field priority',
      icon: <Flame className="w-5 h-5 text-red-700" />,
      iconBg: 'bg-red-50 border-red-200 text-red-700',
      countColor: 'text-red-700',
      activeRing: 'ring-2 ring-red-600 bg-red-50/50 border-red-300',
      onClick: () => onFilterChange('priority', 'CRITICAL'),
      isActive: activePriorityFilter === 'CRITICAL',
    },
    {
      id: 'sla_at_risk',
      title: t.slaAtRiskTitle || 'SLA At Risk',
      count: slaAtRiskCount,
      subtext: t.slaAtRiskSubtext || 'Approaching deadline (<12h)',
      icon: <Clock className="w-5 h-5 text-amber-700" />,
      iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
      countColor: 'text-amber-800',
      activeRing: 'ring-2 ring-amber-600 bg-amber-50/50 border-amber-300',
      onClick: () => onFilterChange('priority', 'HIGH'),
      isActive: activePriorityFilter === 'HIGH',
    },
    {
      id: 'community_impact',
      title: t.communityImpactStatTitle || 'Community Impact',
      count: communityImpactCount,
      subtext: t.communityImpactStatSubtext || 'Confirmed by multiple citizens',
      icon: <Users className="w-5 h-5 text-blue-700" />,
      iconBg: 'bg-blue-50 border-blue-200 text-blue-700',
      countColor: 'text-blue-900',
      activeRing: 'ring-2 ring-blue-600 bg-blue-50/50 border-blue-300',
      onClick: () => onFilterChange('special', 'COMMUNITY'),
      isActive: false,
    },
    {
      id: 'resolved',
      title: t.resolvedTickets || 'Resolved',
      count: resolved,
      subtext: `${total > 0 ? Math.round((resolved / total) * 100) : 0}% resolution rate`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />,
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      countColor: 'text-emerald-700',
      activeRing: 'ring-2 ring-emerald-600 bg-emerald-50/50 border-emerald-300',
      onClick: () => onFilterChange('status', 'RESOLVED'),
      isActive: activeStatusFilter === 'RESOLVED',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={card.onClick}
          className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-card transition-all cursor-pointer space-y-2 group min-h-[110px] flex flex-col justify-between ${
            card.isActive ? card.activeRing : 'hover:border-slate-300'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              card.onClick();
            }
          }}
          aria-label={`${card.title}: ${card.count} items`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 leading-tight">
              {card.title}
            </span>
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.iconBg}`}
            >
              {card.icon}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className={`text-2xl font-black tracking-tight ${card.countColor}`}>
              {card.count}
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
