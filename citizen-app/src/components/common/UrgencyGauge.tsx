import React from 'react';
import { Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UrgencyGaugeProps {
  score: number | null | undefined;
  showLabel?: boolean;
}

export const UrgencyGauge: React.FC<UrgencyGaugeProps> = ({ score, showLabel = true }) => {
  const { t } = useAuth();
  if (score === null || score === undefined) return null;

  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);

  let barColor = 'bg-blue-600';
  let badgeBg = 'bg-blue-50 text-blue-900 border-blue-200';
  let levelText = t.standardUrgency;

  if (pct >= 80) {
    barColor = 'bg-red-600';
    badgeBg = 'bg-red-50 text-red-950 border-red-300 font-bold';
    levelText = t.urgentFastTrack;
  } else if (pct >= 50) {
    barColor = 'bg-amber-600';
    badgeBg = 'bg-amber-50 text-amber-950 border-amber-300 font-bold';
    levelText = t.moderateUrgency;
  }

  return (
    <div className="space-y-1.5" aria-label={`${t.aiUrgency}: ${pct}%`}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded-md border ${badgeBg}`}>
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{pct}% {t.aiUrgency}</span>
        </span>
        {showLabel && <span className="text-xs text-slate-700 font-medium">{levelText}</span>}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
