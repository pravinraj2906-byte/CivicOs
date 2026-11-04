import { Grievance, GrievancePriority } from '../types/api';

export type DateFilterRange = '24h' | '7d' | '30d' | 'all';

export interface HotspotItem {
  location: string;
  activeCount: number;
  totalCount: number;
  topCategory: string;
  communityConfirmations: number;
  criticalCount: number;
  highCount: number;
  grievances: Grievance[];
}

export interface RepeatedProblemCluster {
  id: string;
  category: string;
  location: string;
  count: number;
  communityCount: number;
  dateSpanDays: number;
  grievances: Grievance[];
}

export interface CommunityImpactGrievance {
  grievance: Grievance;
  communityCount: number;
  impactTier: 'MASS' | 'WIDESPREAD' | 'HIGH' | 'MODERATE';
  impactLabelKey: 'widespreadImpact' | 'highImpact' | 'moderateImpact';
}

export interface TrendMetric {
  category: string;
  currentCount: number;
  previousCount: number;
  percentageChange: number | null; // null if not enough data
  direction: 'UP' | 'DOWN' | 'FLAT';
}

export interface PredictiveSignal {
  id: string;
  type: 'RECURRING' | 'COMMUNITY' | 'VOLUME' | 'HOTSPOT';
  titleKey: 'signalRecurringTitle' | 'signalCommunityTitle' | 'signalVolumeTitle' | 'signalHotspotTitle';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: string;
  location?: string;
  whatDetected: string;
  whatDetected_ta: string;
  whyFlagged: string;
  whyFlagged_ta: string;
  evidence: string;
  evidence_ta: string;
  suggestedAction: string;
  suggestedAction_ta: string;
  whyThisMatters: string;
  whyThisMatters_ta: string;
  relatedGrievances: Grievance[];
}

export interface CivicOutcomeMetrics {
  totalResolved: number;
  resolutionRate: number;
  criticalHighResolved: number;
  communityResolved: number;
  followupCount: number;
}

export interface IntelligenceReport {
  totalInWindow: number;
  totalActive: number;
  criticalHighCount: number;
  totalCommunityConfirmations: number;
  topCategory: { category: string; count: number; percentage: number } | null;
  hotspots: HotspotItem[];
  repeatedProblems: RepeatedProblemCluster[];
  communityImpactList: CommunityImpactGrievance[];
  trends: TrendMetric[];
  hasEnoughTrendData: boolean;
  categoryDistribution: { category: string; count: number; percentage: number }[];
  priorityDistribution: { priority: GrievancePriority | string; count: number; percentage: number }[];
  departmentLoad: { department: string; active: number; critical: number; high: number; resolved: number }[];
  signals: PredictiveSignal[];
  outcomes: CivicOutcomeMetrics;
}

/**
 * Filter grievances by date range.
 */
export function filterGrievancesByDateRange(
  grievances: Grievance[],
  range: DateFilterRange
): Grievance[] {
  if (range === 'all') return grievances;

  const now = new Date().getTime();
  let hoursLimit = 24 * 7;
  if (range === '24h') hoursLimit = 24;
  if (range === '30d') hoursLimit = 24 * 30;

  const thresholdMs = now - hoursLimit * 60 * 60 * 1000;

  return grievances.filter((g) => {
    const t = new Date(g.created_at).getTime();
    return !isNaN(t) && t >= thresholdMs;
  });
}

/**
 * Deterministic Civic Intelligence Engine.
 * Aggregates real backend records without fabricating metrics.
 */
export function generateIntelligenceReport(
  allGrievances: Grievance[],
  dateRange: DateFilterRange = '7d'
): IntelligenceReport {
  const windowGrievances = filterGrievancesByDateRange(allGrievances, dateRange);
  const totalInWindow = windowGrievances.length;

  // Active issues
  const activeGrievances = windowGrievances.filter(
    (g) => g.status !== 'RESOLVED' && g.status !== 'REJECTED'
  );
  const totalActive = activeGrievances.length;

  // Resolved issues
  const resolvedGrievances = windowGrievances.filter((g) => g.status === 'RESOLVED');
  const totalResolved = resolvedGrievances.length;

  // Critical & High
  const criticalHighCount = activeGrievances.filter(
    (g) => g.priority === 'CRITICAL' || g.priority === 'HIGH'
  ).length;

  // Critical/High Resolved
  const criticalHighResolved = resolvedGrievances.filter(
    (g) => g.priority === 'CRITICAL' || g.priority === 'HIGH'
  ).length;

  // Community confirmations sum
  const totalCommunityConfirmations = windowGrievances.reduce(
    (acc, g) => acc + (g.community_count || 0),
    0
  );

  // Community-confirmed resolved
  const communityResolved = resolvedGrievances.filter(
    (g) => (g.community_count || 0) >= 2
  ).length;

  // Follow-up / re-opened count
  const followupCount = windowGrievances.filter(
    (g) => g.status === 'IN_PROGRESS' && g.description.toLowerCase().includes('follow-up')
  ).length;

  const outcomes: CivicOutcomeMetrics = {
    totalResolved,
    resolutionRate: totalInWindow > 0 ? Math.round((totalResolved / totalInWindow) * 100) : 0,
    criticalHighResolved,
    communityResolved,
    followupCount,
  };

  // Category distribution
  const catMap = new Map<string, number>();
  windowGrievances.forEach((g) => {
    const cat = g.category || 'General Civic';
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });

  const categoryDistribution = Array.from(catMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalInWindow > 0 ? Math.round((count / totalInWindow) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const topCategory = categoryDistribution.length > 0 ? categoryDistribution[0] : null;

  // Priority distribution
  const prioOrder: GrievancePriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const prioMap = new Map<string, number>();
  windowGrievances.forEach((g) => {
    const p = g.priority || 'MEDIUM';
    prioMap.set(p, (prioMap.get(p) || 0) + 1);
  });

  const priorityDistribution = prioOrder.map((p) => {
    const count = prioMap.get(p) || 0;
    return {
      priority: p,
      count,
      percentage: totalInWindow > 0 ? Math.round((count / totalInWindow) * 100) : 0,
    };
  });

  // Department Load
  const deptMap = new Map<string, { active: number; critical: number; high: number; resolved: number }>();
  windowGrievances.forEach((g) => {
    const d = g.department || 'General';
    if (!deptMap.has(d)) {
      deptMap.set(d, { active: 0, critical: 0, high: 0, resolved: 0 });
    }
    const current = deptMap.get(d)!;
    if (g.status === 'RESOLVED') {
      current.resolved += 1;
    } else if (g.status !== 'REJECTED') {
      current.active += 1;
      if (g.priority === 'CRITICAL') current.critical += 1;
      if (g.priority === 'HIGH') current.high += 1;
    }
  });

  const departmentLoad = Array.from(deptMap.entries())
    .map(([department, stats]) => ({
      department,
      ...stats,
    }))
    .sort((a, b) => b.active - a.active);

  // 1. Problem Hotspots (Grouped by location string)
  const locMap = new Map<string, Grievance[]>();
  windowGrievances.forEach((g) => {
    const loc = (g.location || g.landmark || '').trim();
    if (loc) {
      const key = loc.split(',')[0].trim();
      if (!locMap.has(key)) locMap.set(key, []);
      locMap.get(key)!.push(g);
    }
  });

  const hotspots: HotspotItem[] = Array.from(locMap.entries())
    .map(([location, list]) => {
      const activeList = list.filter((g) => g.status !== 'RESOLVED' && g.status !== 'REJECTED');
      const activeCount = activeList.length;
      const totalCount = list.length;
      const criticalCount = activeList.filter((g) => g.priority === 'CRITICAL').length;
      const highCount = activeList.filter((g) => g.priority === 'HIGH').length;
      const communityConfirmations = list.reduce((sum, g) => sum + (g.community_count || 0), 0);

      const subCatMap = new Map<string, number>();
      list.forEach((g) => {
        subCatMap.set(g.category, (subCatMap.get(g.category) || 0) + 1);
      });
      const topCat = Array.from(subCatMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Civic Issue';

      return {
        location,
        activeCount,
        totalCount,
        topCategory: topCat,
        communityConfirmations,
        criticalCount,
        highCount,
        grievances: list,
      };
    })
    .filter((h) => h.totalCount >= 1)
    .sort((a, b) => {
      const scoreA = a.criticalCount * 4 + a.highCount * 2 + a.activeCount + a.communityConfirmations;
      const scoreB = b.criticalCount * 4 + b.highCount * 2 + b.activeCount + b.communityConfirmations;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  // 2. Repeated Problems (Same Category + Same Normalized Location)
  const repeatedClusters: RepeatedProblemCluster[] = [];
  const catLocMap = new Map<string, Grievance[]>();

  windowGrievances.forEach((g) => {
    const loc = (g.location || g.landmark || '').trim().toLowerCase();
    const primaryLoc = loc.split(',')[0].trim();
    if (primaryLoc && g.category) {
      const key = `${g.category.toLowerCase()}:::${primaryLoc}`;
      if (!catLocMap.has(key)) catLocMap.set(key, []);
      catLocMap.get(key)!.push(g);
    }
  });

  catLocMap.forEach((list, key) => {
    if (list.length >= 2) {
      const [, loc] = key.split(':::');
      const formattedLoc = list[0].location?.split(',')[0].trim() || loc;
      const commCount = list.reduce((sum, g) => sum + (g.community_count || 0), 0);

      const timestamps = list.map((g) => new Date(g.created_at).getTime()).filter((t) => !isNaN(t));
      const minTime = Math.min(...timestamps);
      const maxTime = Math.max(...timestamps);
      const spanDays = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)));

      repeatedClusters.push({
        id: `repeat-${key}`,
        category: list[0].category,
        location: formattedLoc,
        count: list.length,
        communityCount: commCount,
        dateSpanDays: spanDays,
        grievances: list,
      });
    }
  });

  repeatedClusters.sort((a, b) => b.count - a.count);

  // 3. Community Impact Items (Confirmed by multiple citizens)
  const communityImpactList: CommunityImpactGrievance[] = windowGrievances
    .filter((g) => g.community_count && g.community_count >= 2)
    .map((g) => {
      const count = g.community_count || 0;
      let tier: 'MASS' | 'WIDESPREAD' | 'HIGH' | 'MODERATE' = 'MODERATE';
      let labelKey: 'widespreadImpact' | 'highImpact' | 'moderateImpact' = 'moderateImpact';

      if (count >= 25) {
        tier = 'MASS';
        labelKey = 'widespreadImpact';
      } else if (count >= 10) {
        tier = 'WIDESPREAD';
        labelKey = 'widespreadImpact';
      } else if (count >= 5) {
        tier = 'HIGH';
        labelKey = 'highImpact';
      }

      return {
        grievance: g,
        communityCount: count,
        impactTier: tier,
        impactLabelKey: labelKey,
      };
    })
    .sort((a, b) => b.communityCount - a.communityCount);

  // 4. Trend Analysis (Current period vs Previous equal-length period)
  const now = new Date().getTime();
  const periodDurationMs = 7 * 24 * 60 * 60 * 1000;
  const currentPeriodStart = now - periodDurationMs;
  const prevPeriodStart = now - 2 * periodDurationMs;

  const currentPeriodGrievances = allGrievances.filter((g) => {
    const t = new Date(g.created_at).getTime();
    return !isNaN(t) && t >= currentPeriodStart;
  });

  const prevPeriodGrievances = allGrievances.filter((g) => {
    const t = new Date(g.created_at).getTime();
    return !isNaN(t) && t >= prevPeriodStart && t < currentPeriodStart;
  });

  const hasEnoughTrendData = currentPeriodGrievances.length >= 2 && prevPeriodGrievances.length >= 2;

  const trends: TrendMetric[] = [];
  if (hasEnoughTrendData) {
    categoryDistribution.slice(0, 4).forEach(({ category }) => {
      const cCount = currentPeriodGrievances.filter((g) => g.category === category).length;
      const pCount = prevPeriodGrievances.filter((g) => g.category === category).length;

      let pctChange: number | null = null;
      let dir: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';

      if (pCount > 0) {
        pctChange = Math.round(((cCount - pCount) / pCount) * 100);
        if (pctChange > 5) dir = 'UP';
        else if (pctChange < -5) dir = 'DOWN';
      } else if (cCount > 0) {
        pctChange = 100;
        dir = 'UP';
      }

      trends.push({
        category,
        currentCount: cCount,
        previousCount: pCount,
        percentageChange: pctChange,
        direction: dir,
      });
    });
  }

  // 5. Predictive Signals Engine
  const signals: PredictiveSignal[] = [];

  // SIGNAL 1: Recurring Issue Signal
  repeatedClusters.slice(0, 2).forEach((cluster) => {
    signals.push({
      id: `sig-rec-${cluster.id}`,
      type: 'RECURRING',
      titleKey: 'signalRecurringTitle',
      severity: cluster.count >= 4 ? 'CRITICAL' : 'HIGH',
      category: cluster.category,
      location: cluster.location,
      whatDetected: `${cluster.count} recurring reports in ${cluster.location}`,
      whatDetected_ta: `${cluster.location} பகுதியில் ${cluster.count} தொடர் புகார்கள்`,
      whyFlagged: `Multiple complaints share the same category and location within a ${cluster.dateSpanDays}-day period.`,
      whyFlagged_ta: `ஒரே வகை மற்றும் பகுதியில் ${cluster.dateSpanDays} நாட்களில் பல புகார்கள் பதிவாகியுள்ளன.`,
      evidence: `${cluster.count} reports • ${cluster.communityCount} citizen confirmations`,
      evidence_ta: `${cluster.count} புகார்கள் • ${cluster.communityCount} குடிமக்கள் உறுதிப்படுத்தல்கள்`,
      suggestedAction: 'Review cluster reports together to identify common local infrastructure causes.',
      suggestedAction_ta: 'உள்ளூர் உள்கட்டமைப்பு குறைபாடுகளை கண்டறிய அனைத்து புகார்களையும் ஒன்றாக ஆய்வு செய்யவும்.',
      whyThisMatters: 'Concentrated recurring complaints often signal an underlying municipal issue rather than isolated incidents.',
      whyThisMatters_ta: 'ஒரே பகுதியில் மீண்டும் மீண்டும் எழும் புகார்கள் தனிப்பட்ட பிரச்சனையன்றி பொது உள்கட்டமைப்பு குறைபாட்டை சுட்டிக்காட்டுகின்றன.',
      relatedGrievances: cluster.grievances,
    });
  });

  // SIGNAL 2: Community Impact Signal
  communityImpactList.slice(0, 2).forEach((impact) => {
    const g = impact.grievance;
    signals.push({
      id: `sig-comm-${g.id}`,
      type: 'COMMUNITY',
      titleKey: 'signalCommunityTitle',
      severity: impact.communityCount >= 10 ? 'CRITICAL' : 'HIGH',
      category: g.category,
      location: g.location || 'Neighborhood Area',
      whatDetected: `${impact.communityCount} citizens confirmed '${g.title}'`,
      whatDetected_ta: `${impact.communityCount} குடிமக்கள் '${g.title}' புகாரை உறுதிப்படுத்தியுள்ளனர்`,
      whyFlagged: 'Community confirmation threshold met, indicating neighborhood-wide civic impact.',
      whyFlagged_ta: 'பல குடிமக்கள் உறுதிப்படுத்தியதன் மூலம் இப்பகுதியில் அதிக தாக்கம் ஏற்பட்டுள்ளது உறுதியாகிறது.',
      evidence: `Complaint #${g.tracking_id} confirmed by ${impact.communityCount} citizens`,
      evidence_ta: `புகார் எண் #${g.tracking_id} ${impact.communityCount} குடிமக்களால் உறுதிப்படுத்தப்பட்டது`,
      suggestedAction: 'Prioritize field inspection and keep confirmed citizens updated on resolution steps.',
      suggestedAction_ta: 'கள ஆய்வை முன்னுரிமைப்படுத்தி, உறுதிப்படுத்திய குடிமக்களுக்கு தீர்வின் முன்னேற்றத்தை தெரிவிக்கவும்.',
      whyThisMatters: 'Multi-citizen confirmation verifies that an issue directly impacts a collective neighborhood.',
      whyThisMatters_ta: 'பல குடிமக்கள் உறுதிப்படுத்துவது அப்பகுதி முழுவதையும் பாதிக்கும் பிரச்சனையை அடையாளம் காட்டுகிறது.',
      relatedGrievances: [g],
    });
  });

  // SIGNAL 3: Priority Hotspot Concentration
  hotspots
    .filter((h) => h.criticalCount >= 1 || h.highCount >= 2)
    .slice(0, 1)
    .forEach((hotspot) => {
      signals.push({
        id: `sig-hot-${hotspot.location}`,
        type: 'HOTSPOT',
        titleKey: 'signalHotspotTitle',
        severity: hotspot.criticalCount >= 1 ? 'CRITICAL' : 'HIGH',
        category: hotspot.topCategory,
        location: hotspot.location,
        whatDetected: `High priority concentration in ${hotspot.location}`,
        whatDetected_ta: `${hotspot.location} பகுதியில் அதிக அவசர புகார்கள் குவிந்துள்ளன`,
        whyFlagged: `${hotspot.activeCount} active issues (${hotspot.criticalCount} Critical, ${hotspot.highCount} High) in the same jurisdiction.`,
        whyFlagged_ta: `இப்பகுதியில் ${hotspot.activeCount} தீவிர புகார்கள் (${hotspot.criticalCount} அவசரம், ${hotspot.highCount} உயர்) உள்ளன.`,
        evidence: `${hotspot.activeCount} active tickets • ${hotspot.communityConfirmations} confirmations`,
        evidence_ta: `${hotspot.activeCount} தீவிர புகார்கள் • ${hotspot.communityConfirmations} உறுதிப்படுத்தல்கள்`,
        suggestedAction: 'Coordinate inter-departmental field team to clear active cluster tickets.',
        suggestedAction_ta: 'துறைசார் களக் குழுக்களை ஒருங்கிணைத்து இப்பகுதி புகார்களுக்கு உடனடி தீர்வு காணவும்.',
        whyThisMatters: 'Hotspots with urgent complaints risk exceeding SLA deadlines if not addressed collectively.',
        whyThisMatters_ta: 'அவசர புகார்கள் குவியும் பகுதிகளில் கூட்டு நடவடிக்கை எடுக்காவிட்டால் SLA காலக்கெடு மீறப்படலாம்.',
        relatedGrievances: hotspot.grievances,
      });
    });

  return {
    totalInWindow,
    totalActive,
    criticalHighCount,
    totalCommunityConfirmations,
    topCategory,
    hotspots,
    repeatedProblems: repeatedClusters,
    communityImpactList,
    trends,
    hasEnoughTrendData,
    categoryDistribution,
    priorityDistribution,
    departmentLoad,
    signals,
    outcomes,
  };
}
