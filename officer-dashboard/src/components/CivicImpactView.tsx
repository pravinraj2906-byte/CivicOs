import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grievance } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CivicImpactCard } from './CivicImpactCard';
import { getPriorityBadge } from './GrievanceTable';
import {
  getLocalizedDepartment,
  getLocalizedTitle,
  getLocalizedLocation,
} from '../i18n/formatters';
import {
  Search,
  Users,
  AlertTriangle,
  Clock,
  RotateCw,
  X,
  Radio,
  FileText,
  CheckCircle,
  AlertCircle,
  Building,
  ArrowRight,
  Zap,
  MapPin,
} from 'lucide-react';

interface CivicImpactViewProps {
  onSelectGrievance: (g: Grievance) => void;
}

export const CivicImpactView: React.FC<CivicImpactViewProps> = ({ onSelectGrievance }) => {
  const { t, language } = useAuth();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'urgent' | 'impact' | 'newest' | 'oldest'>('urgent');

  // Search debounce timer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim().toLowerCase());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Grievances with Officer Token
  const fetchGrievances = useCallback(
    async (showRefreshingSpinner = false) => {
      if (showRefreshingSpinner) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await apiService.getOfficerGrievances();
        setGrievances(data);
      } catch (err: any) {
        const msg =
          err.response?.data?.detail ||
          err.message ||
          (language === 'ta'
            ? 'குடிமக்கள் தாக்கப் பட்டியலை ஏற்ற முடியவில்லை.'
            : 'Failed to load Civic Impact Feed.');
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [language]
  );

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // 1. KPI Aggregate Calculations
  const stats = useMemo(() => {
    const active = grievances.filter(
      (g) => g.status === 'SUBMITTED' || g.status === 'TRIAGED' || g.status === 'IN_PROGRESS'
    );
    const highImpact = grievances.filter((g) => (g.community_count || 0) > 0);
    const critical = grievances.filter((g) => g.priority === 'CRITICAL' && g.status !== 'RESOLVED');
    const resolved = grievances.filter((g) => g.status === 'RESOLVED');

    return {
      totalActive: active.length,
      highImpactCount: highImpact.length,
      criticalCount: critical.length,
      resolvedCount: resolved.length,
    };
  }, [grievances]);

  // 2. Operational Ranking for "Attention Needed" Section
  const attentionNeededItems = useMemo(() => {
    return grievances
      .filter((g) => g.status !== 'RESOLVED' && g.status !== 'REJECTED')
      .map((g) => {
        let score = 0;

        // Priority weighting
        if (g.priority === 'CRITICAL') {
          score += 100;
        } else if (g.priority === 'HIGH') {
          score += 60;
        }

        // Urgency score weighting
        if (g.urgency_score && g.urgency_score >= 0.8) {
          score += 40;
        } else if (g.urgency_score && g.urgency_score >= 0.5) {
          score += 20;
        }

        // Community confirmations weighting
        const commCount = g.community_count || 0;
        if (commCount > 0) {
          score += commCount * 15;
        }

        // Age weighting (hours unresolved)
        const ageHours = (Date.now() - new Date(g.created_at).getTime()) / (1000 * 60 * 60);
        if (ageHours > 48) {
          score += 25;
        } else if (ageHours > 24) {
          score += 10;
        }

        return {
          grievance: g,
          score,
          ageHours: Math.round(ageHours),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Top 4 priority attention items
  }, [grievances]);

  // 3. Filtered & Sorted Feed List
  const filteredGrievances = useMemo(() => {
    return grievances
      .filter((g) => {
        // Status filter
        if (statusFilter === 'IN_PROGRESS' && g.status !== 'IN_PROGRESS') return false;
        if (statusFilter === 'RESOLVED' && g.status !== 'RESOLVED') return false;
        if (statusFilter === 'ACTIVE' && (g.status === 'RESOLVED' || g.status === 'REJECTED')) return false;

        // Priority filter
        if (priorityFilter === 'CRITICAL' && g.priority !== 'CRITICAL') return false;
        if (priorityFilter === 'HIGH' && g.priority !== 'HIGH') return false;

        // Search query
        if (debouncedSearch) {
          const matchTracking = g.tracking_id.toLowerCase().includes(debouncedSearch);
          const matchTitle = g.title.toLowerCase().includes(debouncedSearch);
          const matchDesc = g.description.toLowerCase().includes(debouncedSearch);
          const matchLoc = g.location ? g.location.toLowerCase().includes(debouncedSearch) : false;
          const matchLandmark = g.landmark ? g.landmark.toLowerCase().includes(debouncedSearch) : false;
          const matchCategory = g.category.toLowerCase().includes(debouncedSearch);

          if (!matchTracking && !matchTitle && !matchDesc && !matchLoc && !matchLandmark && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgent') {
          // Priority ranking first, then urgency score
          const prioWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          const pA = prioWeight[a.priority] || 0;
          const pB = prioWeight[b.priority] || 0;
          if (pA !== pB) return pB - pA;
          return (b.urgency_score || 0) - (a.urgency_score || 0);
        } else if (sortBy === 'impact') {
          return (b.community_count || 0) - (a.community_count || 0);
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else {
          // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [grievances, statusFilter, priorityFilter, debouncedSearch, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('urgent');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-50 border border-civic-200 text-civic-800 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-civic-600 animate-pulse" />
            <span>{t.navCivicImpact}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.impactDashboardTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 max-w-2xl">
            {t.impactDashboardSubtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => fetchGrievances(true)}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all min-h-[44px]"
            aria-label="Refresh Civic Impact Data"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-civic-600' : ''}`} />
            <span>{t.refreshBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 text-sm flex items-center justify-between shadow-card animate-fadeIn"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
            <div>
              <div className="font-bold">{t.errorLoadingGrievances}</div>
              <div className="text-xs text-red-800">{errorMessage}</div>
            </div>
          </div>
          <button
            onClick={() => fetchGrievances(false)}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs min-h-[40px]"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t.retryBtn}</span>
          </button>
        </div>
      )}

      {/* 3. Operational KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* TOTAL ACTIVE ISSUES */}
        <button
          onClick={() => {
            setStatusFilter('ACTIVE');
            setPriorityFilter('ALL');
          }}
          className={`p-5 rounded-3xl border text-left transition-all space-y-2 group min-h-[110px] ${
            statusFilter === 'ACTIVE'
              ? 'bg-civic-900 text-white border-civic-900 shadow-elevated'
              : 'bg-white text-slate-900 border-slate-200 shadow-card hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400">
              {t.totalActiveIssuesMetric}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                statusFilter === 'ACTIVE'
                  ? 'bg-civic-800 text-white'
                  : 'bg-civic-50 text-civic-700'
              }`}
            >
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black">{stats.totalActive}</div>
          <p
            className={`text-xs font-medium ${
              statusFilter === 'ACTIVE' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {t.totalActiveIssuesDesc}
          </p>
        </button>

        {/* HIGH COMMUNITY IMPACT */}
        <button
          onClick={() => {
            setSortBy('impact');
            setStatusFilter('ALL');
            setPriorityFilter('ALL');
          }}
          className={`p-5 rounded-3xl border text-left transition-all space-y-2 group min-h-[110px] ${
            sortBy === 'impact'
              ? 'bg-civic-900 text-white border-civic-900 shadow-elevated'
              : 'bg-white text-slate-900 border-slate-200 shadow-card hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-400">
              {t.highCommunityImpactMetric}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                sortBy === 'impact'
                  ? 'bg-civic-800 text-white'
                  : 'bg-civic-50 text-civic-700'
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-civic-600 group-hover:text-civic-400">
            {stats.highImpactCount}
          </div>
          <p
            className={`text-xs font-medium ${
              sortBy === 'impact' ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {t.highCommunityImpactDesc}
          </p>
        </button>

        {/* CRITICAL ATTENTION */}
        <button
          onClick={() => {
            setPriorityFilter('CRITICAL');
            setStatusFilter('ALL');
          }}
          className={`p-5 rounded-3xl border text-left transition-all space-y-2 group min-h-[110px] ${
            priorityFilter === 'CRITICAL'
              ? 'bg-red-950 text-white border-red-950 shadow-elevated'
              : 'bg-white text-slate-900 border-slate-200 shadow-card hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 group-hover:text-red-400">
              {t.criticalAttentionMetric}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                priorityFilter === 'CRITICAL'
                  ? 'bg-red-900 text-white'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 group-hover:text-red-400">
            {stats.criticalCount}
          </div>
          <p
            className={`text-xs font-medium ${
              priorityFilter === 'CRITICAL' ? 'text-red-200' : 'text-slate-500'
            }`}
          >
            {t.criticalAttentionDesc}
          </p>
        </button>

        {/* RECENTLY RESOLVED */}
        <button
          onClick={() => {
            setStatusFilter('RESOLVED');
            setPriorityFilter('ALL');
          }}
          className={`p-5 rounded-3xl border text-left transition-all space-y-2 group min-h-[110px] ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-950 text-white border-emerald-950 shadow-elevated'
              : 'bg-white text-slate-900 border-slate-200 shadow-card hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 group-hover:text-emerald-400">
              {t.recentlyResolvedMetric}
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                statusFilter === 'RESOLVED'
                  ? 'bg-emerald-900 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 group-hover:text-emerald-400">
            {stats.resolvedCount}
          </div>
          <p
            className={`text-xs font-medium ${
              statusFilter === 'RESOLVED' ? 'text-emerald-200' : 'text-slate-500'
            }`}
          >
            {t.recentlyResolvedDesc}
          </p>
        </button>
      </div>

      {/* 4. 🚨 ATTENTION NEEDED SECTION (Operational Intelligence) */}
      {attentionNeededItems.length > 0 && (
        <section className="space-y-4" aria-label={t.attentionNeededHeader}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🚨</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {t.attentionNeededHeader}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-xs font-black border border-red-200">
                {attentionNeededItems.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.attentionNeededSubheader}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attentionNeededItems.map(({ grievance, ageHours }) => {
              const priorityBadge = getPriorityBadge(grievance.priority, t);
              const displayTitle = getLocalizedTitle(grievance.title, language);
              const rawLocation = [
                grievance.location,
                grievance.landmark ? `${t.landmarkPrefix} ${grievance.landmark}` : null,
              ]
                .filter(Boolean)
                .join(' • ');
              const displayLocation = getLocalizedLocation(rawLocation, language);
              const displayDept = getLocalizedDepartment(grievance.department, t);
              const communityCount = grievance.community_count || 0;
              const isCritical = grievance.priority === 'CRITICAL';

              return (
                <div
                  key={`attention-${grievance.id}`}
                  onClick={() => onSelectGrievance(grievance)}
                  className={`rounded-3xl border-2 p-5 transition-all shadow-card hover:shadow-card-hover cursor-pointer space-y-3.5 text-left group ${
                    isCritical
                      ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200'
                      : 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  {/* Header: Attention Alert Badge & Tracking ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{t.attentionNeeded}</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {grievance.tracking_id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {t.reportedAgoPrefix} {ageHours}h
                      </span>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-civic-700 transition-colors leading-snug">
                      {displayTitle}
                    </h3>
                    {displayLocation && (
                      <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-civic-600 shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges: Priority, Department, Community Impact */}
                  <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-200/60">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg text-xs border ${priorityBadge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${priorityBadge.dot}`} />
                      <span>{priorityBadge.label}</span>
                    </span>

                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-semibold">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{displayDept}</span>
                    </span>

                    {communityCount > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-civic-100 text-civic-900 border border-civic-200 text-xs font-bold">
                        <Users className="w-3.5 h-3.5 text-civic-700" />
                        <span>
                          {communityCount}{' '}
                          {communityCount === 1 ? t.citizenAffectedCount : t.citizensAffectedCount}
                        </span>
                      </span>
                    )}

                    {grievance.urgency_score !== null && grievance.urgency_score !== undefined && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                        <Zap className="w-3 h-3 text-blue-600" />
                        <span>{Math.round(grievance.urgency_score * 100)}%</span>
                      </span>
                    )}
                  </div>

                  {/* Operational Footer CTA */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-red-900 font-bold">
                      {t.officerAttentionRequired}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGrievance(grievance);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-touch transition-all flex items-center space-x-1 min-h-[38px]"
                    >
                      <span>{t.viewIssueBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Master Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchImpactPlaceholder}
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-civic-500 focus:border-transparent transition-all min-h-[48px]"
            aria-label={t.searchImpactPlaceholder}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sorting & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Sort By Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">
              {t.sortOfficerLabel}
            </span>

            <button
              onClick={() => setSortBy('urgent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'urgent'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.sortMostUrgent}</span>
            </button>

            <button
              onClick={() => setSortBy('impact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'impact'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.sortHighImpact}</span>
            </button>

            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'newest'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.sortNewest}</span>
            </button>

            <button
              onClick={() => setSortBy('oldest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'oldest'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.sortOldestUnresolved}</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                statusFilter === 'ALL' && priorityFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterAllImpact}
            </button>

            <button
              onClick={() => {
                setPriorityFilter('CRITICAL');
                setStatusFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                priorityFilter === 'CRITICAL'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterCriticalImpact}
            </button>

            <button
              onClick={() => {
                setPriorityFilter('HIGH');
                setStatusFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                priorityFilter === 'HIGH'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterHighImpact}
            </button>

            <button
              onClick={() => {
                setStatusFilter('IN_PROGRESS');
                setPriorityFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterInProgressImpact}
            </button>

            <button
              onClick={() => {
                setStatusFilter('RESOLVED');
                setPriorityFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                statusFilter === 'RESOLVED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterResolvedImpact}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Main Feed Grid */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-civic-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">{t.loadingImpactFeed}</p>
        </div>
      ) : filteredGrievances.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Radio className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-slate-900">{t.noImpactIssuesFound}</h3>
            <p className="text-xs text-slate-600">{t.noImpactIssuesFoundDesc}</p>
          </div>
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-2xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs shadow-touch transition-all min-h-[44px]"
            >
              {language === 'ta' ? 'வடிப்பான்களை அழிக்கவும்' : 'Clear Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-700 uppercase tracking-wider">
              {t.allCommunityIssues} ({filteredGrievances.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGrievances.map((grievance) => (
              <CivicImpactCard
                key={`${grievance.id}-${grievance.community_count}-${grievance.status}`}
                grievance={grievance}
                onSelectGrievance={onSelectGrievance}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
