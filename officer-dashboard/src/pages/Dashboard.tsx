import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Grievance, GrievanceDetail } from '../types/api';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar, DashboardTab } from '../components/Navbar';
import { StatCards } from '../components/StatCards';
import { AttentionCenterSection } from '../components/AttentionCenterSection';
import { FilterBar } from '../components/FilterBar';
import { GrievanceTable } from '../components/GrievanceTable';
import { RecentActivitySection } from '../components/RecentActivitySection';
import { CivicImpactView } from '../components/CivicImpactView';
import { CivicIntelligenceView } from '../components/CivicIntelligenceView';
import { GrievanceDetailModal } from '../components/GrievanceDetailModal';
import { AttentionCenterDrawer } from '../components/AttentionCenterDrawer';
import { AttentionToast } from '../components/AttentionToast';
import { deriveAttentionItems, AttentionItem } from '../utils/attentionRules';
import { getLocalizedDepartment } from '../i18n/formatters';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, t, language } = useAuth();

  // Navigation Tab State (Operations Queue | Civic Intelligence | Civic Impact)
  const [activeTab, setActiveTab] = useState<DashboardTab>('queue');

  // Grievance Queue State
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [specialFilter, setSpecialFilter] = useState<string | null>(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attention Center States
  const [isAttentionDrawerOpen, setIsAttentionDrawerOpen] = useState<boolean>(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('civicos_dismissed_attention');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toastItem, setToastItem] = useState<AttentionItem | null>(null);

  const fetchGrievances = useCallback(async (showRefreshingSpinner = false) => {
    if (showRefreshingSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await apiService.getOfficerGrievances({
        status: statusFilter,
        department: departmentFilter,
        priority: priorityFilter,
      });
      setGrievances(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to connect to CivicOS API';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, departmentFilter, priorityFilter]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Derive Attention Items from current grievance dataset
  const attentionItems = useMemo(() => {
    return deriveAttentionItems(grievances);
  }, [grievances]);

  const activeAttentionItems = useMemo(() => {
    return attentionItems.filter((item) => !dismissedIds.includes(item.id));
  }, [attentionItems, dismissedIds]);

  const hasCriticalAttention = useMemo(() => {
    return activeAttentionItems.some((item) => item.severity === 'CRITICAL');
  }, [activeAttentionItems]);

  // Session-safe toast notification for the most critical newly detected item
  useEffect(() => {
    if (activeAttentionItems.length > 0) {
      const criticalOrHigh = activeAttentionItems.find(
        (i) => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.grievance
      );

      if (criticalOrHigh) {
        const toastShownKey = `civicos_toast_shown_${criticalOrHigh.id}`;
        const hasShown = sessionStorage.getItem(toastShownKey);

        if (!hasShown) {
          setToastItem(criticalOrHigh);
          sessionStorage.setItem(toastShownKey, 'true');

          // Auto dismiss after 8 seconds
          const timer = setTimeout(() => {
            setToastItem(null);
          }, 8000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [activeAttentionItems]);

  const handleDismissAttentionItem = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem('civicos_dismissed_attention', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
    if (toastItem?.id === id) {
      setToastItem(null);
    }
  };

  // Client-side filtering including search and special filters
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      // Special filters
      if (specialFilter === 'COMMUNITY') {
        if (!g.community_count || g.community_count <= 1) return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        g.tracking_id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        (g.location && g.location.toLowerCase().includes(q)) ||
        (g.landmark && g.landmark.toLowerCase().includes(q)) ||
        g.category.toLowerCase().includes(q)
      );
    });
  }, [grievances, searchQuery, specialFilter]);

  const handleCardFilterChange = (type: 'status' | 'priority' | 'special', value: string) => {
    if (type === 'status') {
      setStatusFilter(value);
      setPriorityFilter('ALL');
      setSpecialFilter(null);
    } else if (type === 'priority') {
      setPriorityFilter(value);
      setStatusFilter('ALL');
      setSpecialFilter(null);
    } else if (type === 'special') {
      setSpecialFilter(specialFilter === value ? null : value);
      setStatusFilter('ALL');
      setPriorityFilter('ALL');
    }
  };

  const handleGrievanceUpdated = (updated: GrievanceDetail) => {
    setGrievances((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
    if (selectedGrievance?.id === updated.id) {
      setSelectedGrievance({ ...selectedGrievance, ...updated });
    }
  };

  // Cross-Navigation: Navigate from Intelligence view to filtered Work Queue
  const handleFilterQueueFromIntelligence = (_subset: Grievance[], filterLabel?: string) => {
    if (filterLabel) {
      setSearchQuery(filterLabel);
    }
    setActiveTab('queue');
  };

  const officerDeptName = getLocalizedDepartment(user?.department, t);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-civic-100 selection:text-civic-900 animate-fadeIn">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={() => fetchGrievances(true)}
        isRefreshing={isRefreshing}
        attentionCount={activeAttentionItems.length}
        hasCritical={hasCriticalAttention}
        onOpenAttentionCenter={() => setIsAttentionDrawerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'intelligence' ? (
          /* Dedicated Civic Intelligence View (Phase 2B) */
          <CivicIntelligenceView
            grievances={grievances}
            onSelectGrievance={(g) => setSelectedGrievance(g)}
            onFilterQueueByGrievances={handleFilterQueueFromIntelligence}
          />
        ) : activeTab === 'impact' ? (
          /* Dedicated Operational Civic Impact View */
          <CivicImpactView onSelectGrievance={(g) => setSelectedGrievance(g)} />
        ) : (
          /* Operational Grievances Queue View (Hierarchy: Attention -> Priority -> Work Queue -> Activity) */
          <>
            {/* Header & Context Banner */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-50 border border-civic-200 text-civic-800 text-xs font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5 text-civic-600" />
                  <span>
                    {language === 'ta' ? `உங்கள் துறை: ${officerDeptName}` : `Your Department: ${officerDeptName}`}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  CivicOS {language === 'ta' ? 'அதிகாரிகள் கட்டுப்பாட்டு மையம்' : 'Operations Center'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {language === 'ta'
                    ? 'உங்கள் துறையின் குடிமக்கள் புகார்களை கண்காணித்து உடனடி நடவடிக்கை எடுங்கள்.'
                    : 'Monitor citizen issues and take action across your department.'}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-mono font-bold">
                  {user?.name || 'Officer'}
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-950 text-sm flex items-center justify-between shadow-card animate-fadeIn"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
                  <div>
                    <div className="font-bold">{t.errorLoadingGrievances}</div>
                    <div className="text-xs text-red-800">{errorMessage}</div>
                  </div>
                </div>
                <button
                  onClick={() => fetchGrievances()}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs min-h-[40px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.retryBtn}</span>
                </button>
              </div>
            )}

            {/* A. Attention Strip (Stat Cards) */}
            <StatCards
              grievances={grievances}
              activeStatusFilter={statusFilter}
              activePriorityFilter={priorityFilter}
              onFilterChange={handleCardFilterChange}
            />

            {/* B. Attention Center (Needs Your Attention Section) */}
            <AttentionCenterSection
              grievances={grievances}
              onSelectGrievance={(g) => setSelectedGrievance(g)}
            />

            {/* C. Filter Controls Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              onRefresh={() => fetchGrievances(true)}
              isRefreshing={isRefreshing}
              totalFilteredCount={filteredGrievances.length}
            />

            {/* D. Smart Work Queue Table */}
            <GrievanceTable
              grievances={filteredGrievances}
              isLoading={isLoading}
              onSelectGrievance={(g) => setSelectedGrievance(g)}
            />

            {/* E. Recent Operational Activity */}
            <RecentActivitySection
              grievances={grievances}
              onSelectGrievance={(g) => setSelectedGrievance(g)}
            />
          </>
        )}
      </main>

      {/* Grievance Inspector Drawer / Modal */}
      {selectedGrievance && (
        <GrievanceDetailModal
          grievanceSummary={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
          onGrievanceUpdated={handleGrievanceUpdated}
        />
      )}

      {/* Attention Center Slide-Over Drawer */}
      <AttentionCenterDrawer
        isOpen={isAttentionDrawerOpen}
        onClose={() => setIsAttentionDrawerOpen(false)}
        items={attentionItems}
        dismissedIds={dismissedIds}
        onDismissItem={handleDismissAttentionItem}
        onSelectGrievance={(g) => setSelectedGrievance(g)}
        onFilterStatus={(st) => {
          setStatusFilter(st);
          setPriorityFilter('ALL');
        }}
        onSearchLocation={(loc) => setSearchQuery(loc)}
      />

      {/* Non-Blocking Attention Toast Notification */}
      <AttentionToast
        item={toastItem}
        onDismiss={handleDismissAttentionItem}
        onReview={(item) => {
          if (item.grievance) {
            setSelectedGrievance(item.grievance);
          }
          setToastItem(null);
        }}
      />
    </div>
  );
};
