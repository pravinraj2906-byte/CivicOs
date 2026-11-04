import { GrievancePriority, GrievanceStatus } from '../types/api';

export interface SLAInfo {
  slaHoursTotal: number;
  remainingHours: number;
  isOverdue: boolean;
  isAtRisk: boolean;
  formattedText: string;
  formattedText_ta: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

/**
 * Calculates real-time SLA metrics grounded in creation timestamp and priority level.
 */
export function calculateSLA(
  createdAt: string,
  priority: GrievancePriority | string,
  status: GrievanceStatus | string
): SLAInfo {
  // If already resolved or rejected, SLA clock stops
  if (status === 'RESOLVED' || status === 'REJECTED') {
    return {
      slaHoursTotal: 48,
      remainingHours: 0,
      isOverdue: false,
      isAtRisk: false,
      formattedText: status === 'RESOLVED' ? 'Resolved within SLA' : 'Closed',
      formattedText_ta: status === 'RESOLVED' ? 'தீர்க்கப்பட்டது' : 'முடிவுற்றது',
      badgeBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badgeText: 'text-emerald-900 font-bold',
      dotColor: 'bg-emerald-600',
    };
  }

  // Target SLA by Priority
  let slaHoursTotal = 48;
  switch (priority?.toUpperCase()) {
    case 'CRITICAL':
      slaHoursTotal = 24;
      break;
    case 'HIGH':
      slaHoursTotal = 48;
      break;
    case 'MEDIUM':
      slaHoursTotal = 72;
      break;
    case 'LOW':
    default:
      slaHoursTotal = 96;
      break;
  }

  const createdDate = new Date(createdAt);
  if (isNaN(createdDate.getTime())) {
    return {
      slaHoursTotal,
      remainingHours: slaHoursTotal,
      isOverdue: false,
      isAtRisk: false,
      formattedText: 'SLA Active',
      formattedText_ta: 'SLA செயல்பாட்டில்',
      badgeBg: 'bg-slate-100 border-slate-300 text-slate-800',
      badgeText: 'text-slate-800 font-medium',
      dotColor: 'bg-slate-500',
    };
  }

  const now = new Date();
  const elapsedMs = now.getTime() - createdDate.getTime();
  const elapsedHours = Math.max(0, elapsedMs / (1000 * 60 * 60));
  const remainingHours = Math.round((slaHoursTotal - elapsedHours) * 10) / 10;

  const isOverdue = remainingHours < 0;
  const isAtRisk = !isOverdue && remainingHours <= 12;

  if (isOverdue) {
    const overdueHrs = Math.abs(Math.round(remainingHours));
    return {
      slaHoursTotal,
      remainingHours,
      isOverdue: true,
      isAtRisk: true,
      formattedText: `Overdue by ${overdueHrs}h`,
      formattedText_ta: `${overdueHrs} மணிநேரம் தாமதம்`,
      badgeBg: 'bg-red-50 border-red-300 text-red-950 font-extrabold',
      badgeText: 'text-red-950 font-extrabold',
      dotColor: 'bg-red-600',
    };
  }

  if (isAtRisk) {
    const rem = Math.max(1, Math.round(remainingHours));
    return {
      slaHoursTotal,
      remainingHours,
      isOverdue: false,
      isAtRisk: true,
      formattedText: `Due in ${rem}h (At Risk)`,
      formattedText_ta: `${rem} மணிநேரம் மட்டுமே (கவனம்)`,
      badgeBg: 'bg-amber-50 border-amber-300 text-amber-950 font-bold',
      badgeText: 'text-amber-950 font-bold',
      dotColor: 'bg-amber-600',
    };
  }

  const rem = Math.round(remainingHours);
  return {
    slaHoursTotal,
    remainingHours,
    isOverdue: false,
    isAtRisk: false,
    formattedText: `${rem}h remaining`,
    formattedText_ta: `${rem} மணிநேரம் மீதம்`,
    badgeBg: 'bg-slate-100 border-slate-200 text-slate-800',
    badgeText: 'text-slate-800 font-semibold',
    dotColor: 'bg-civic-600',
  };
}
