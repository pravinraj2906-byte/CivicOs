import { Grievance } from '../types/api';

export type AttentionSeverity = 'CRITICAL' | 'HIGH' | 'FOLLOW_UP' | 'SMART_INSIGHT';

export interface AttentionItem {
  id: string;
  severity: AttentionSeverity;
  title: string;
  subtitle?: string;
  badgeText?: string;
  grievance?: Grievance;
  urgencyPct?: number | null;
  priority?: string;
  status?: string;
  location?: string;
  recommendedAction?: string;
  actionType: 'REVIEW_GRIEVANCE' | 'FILTER_STATUS' | 'SEARCH_LOCATION';
  actionPayload?: any;
  actionLabelKey: 'reviewGrievance' | 'reviewPendingCases' | 'viewRelatedComplaints';
  createdAt?: string;
  count?: number;
}

/**
 * Deterministically derives attention items from current grievance data.
 * Pure function with zero side-effects and zero external API calls.
 */
export function deriveAttentionItems(grievances: Grievance[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  // 1. 🔴 CRITICAL ALERTS:
  // Priority === 'CRITICAL' OR urgency_score >= 0.85, and status is active (not resolved/rejected)
  const criticalGrievances = grievances.filter(
    (g) =>
      (g.priority === 'CRITICAL' || (g.urgency_score !== null && g.urgency_score !== undefined && g.urgency_score >= 0.85)) &&
      g.status !== 'RESOLVED' &&
      g.status !== 'REJECTED'
  );

  criticalGrievances.forEach((g) => {
    const urgencyPct = g.urgency_score !== null && g.urgency_score !== undefined
      ? Math.round(g.urgency_score * 100)
      : null;

    items.push({
      id: `critical-${g.id}`,
      severity: 'CRITICAL',
      title: g.title,
      subtitle: g.ai_summary || g.description,
      grievance: g,
      urgencyPct,
      priority: g.priority,
      status: g.status,
      location: [g.location, g.landmark].filter(Boolean).join(' • '),
      recommendedAction: g.suggested_initial_action || undefined,
      actionType: 'REVIEW_GRIEVANCE',
      actionPayload: g,
      actionLabelKey: 'reviewGrievance',
      createdAt: g.created_at,
    });
  });

  // 2. 🟠 HIGH PRIORITY RECOMMENDATIONS:
  // Priority === 'HIGH' OR urgency_score >= 0.70, and status is SUBMITTED or TRIAGED (not yet actioned)
  const highGrievances = grievances.filter(
    (g) =>
      (g.priority === 'HIGH' || (g.urgency_score !== null && g.urgency_score !== undefined && g.urgency_score >= 0.70)) &&
      (g.status === 'SUBMITTED' || g.status === 'TRIAGED') &&
      !criticalGrievances.some((cg) => cg.id === g.id)
  );

  highGrievances.forEach((g) => {
    const urgencyPct = g.urgency_score !== null && g.urgency_score !== undefined
      ? Math.round(g.urgency_score * 100)
      : null;

    items.push({
      id: `high-${g.id}`,
      severity: 'HIGH',
      title: g.title,
      subtitle: g.ai_summary || g.description,
      grievance: g,
      urgencyPct,
      priority: g.priority,
      status: g.status,
      location: [g.location, g.landmark].filter(Boolean).join(' • '),
      recommendedAction: g.suggested_initial_action || undefined,
      actionType: 'REVIEW_GRIEVANCE',
      actionPayload: g,
      actionLabelKey: 'reviewGrievance',
      createdAt: g.created_at,
    });
  });

  // 3. 🟡 FOLLOW-UP REMINDERS:
  // In-progress cases awaiting field resolution
  const inProgressCases = grievances.filter((g) => g.status === 'IN_PROGRESS');
  if (inProgressCases.length > 0) {
    items.push({
      id: 'followup-inprogress',
      severity: 'FOLLOW_UP',
      title: `${inProgressCases.length} In-Progress Grievance(s)`,
      subtitle: `${inProgressCases.length} case(s) currently being addressed by field crews. Verify completion and log officer remarks.`,
      count: inProgressCases.length,
      actionType: 'FILTER_STATUS',
      actionPayload: 'IN_PROGRESS',
      actionLabelKey: 'reviewPendingCases',
    });
  }

  // Submitted cases awaiting triage
  const submittedCases = grievances.filter((g) => g.status === 'SUBMITTED');
  if (submittedCases.length > 0) {
    items.push({
      id: 'followup-submitted',
      severity: 'FOLLOW_UP',
      title: `${submittedCases.length} Unreviewed Submission(s)`,
      subtitle: `${submittedCases.length} newly submitted complaint(s) awaiting officer review or triage confirmation.`,
      count: submittedCases.length,
      actionType: 'FILTER_STATUS',
      actionPayload: 'SUBMITTED',
      actionLabelKey: 'reviewPendingCases',
    });
  }

  // 4. 🔵 SMART PATTERN INSIGHTS:
  // Detect geographic clustering of complaints (same location / landmark with >= 2 active complaints)
  const locationGroups: Record<string, Grievance[]> = {};
  grievances.forEach((g) => {
    if (g.status !== 'RESOLVED' && g.status !== 'REJECTED') {
      const locKey = (g.location || g.landmark || '').trim().toLowerCase();
      if (locKey && locKey.length > 3) {
        if (!locationGroups[locKey]) {
          locationGroups[locKey] = [];
        }
        locationGroups[locKey].push(g);
      }
    }
  });

  Object.entries(locationGroups).forEach(([locKey, group]) => {
    if (group.length >= 2) {
      const displayLoc = group[0].location || group[0].landmark || locKey;
      const deptCategories = Array.from(new Set(group.map((g) => g.category))).join(', ');

      items.push({
        id: `insight-loc-${locKey}`,
        severity: 'SMART_INSIGHT',
        title: `Possible Area Pattern: ${displayLoc}`,
        subtitle: `${group.length} active complaints reported in ${displayLoc} (${deptCategories}). May require investigation for a common cause.`,
        location: displayLoc,
        count: group.length,
        actionType: 'SEARCH_LOCATION',
        actionPayload: displayLoc,
        actionLabelKey: 'viewRelatedComplaints',
      });
    }
  });

  return items;
}
