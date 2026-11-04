import React, { useState, useEffect, useCallback } from 'react';
import { CivicFeedItem, FeedFilterParams } from '../../types/api';
import { apiService } from '../../services/api';
import { CivicFeedCard } from '../../components/cards/CivicFeedCard';
import { FeedDetailModal } from './FeedDetailModal';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import {
  Search,
  Flame,
  Clock,
  AlertTriangle,
  PlusCircle,
  X,
  Radio,
  FileQuestion,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CivicFeedViewProps {
  onOpenReportModal?: () => void;
}

export const CivicFeedView: React.FC<CivicFeedViewProps> = ({ onOpenReportModal }) => {
  const { t, language } = useAuth();

  // State
  const [items, setItems] = useState<CivicFeedItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'impact' | 'urgency'>('recent');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');

  // Selected Detail Modal
  const [selectedItem, setSelectedItem] = useState<CivicFeedItem | null>(null);

  // Search debounce timer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Feed Data
  const fetchFeed = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (isInitial) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const params: FeedFilterParams = {
          page: pageNum,
          limit: 10,
          sort_by: sortBy,
          language: language,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        if (selectedStatus !== 'ALL') {
          params.status = selectedStatus;
        }
        if (selectedDepartment !== 'ALL') {
          params.department = selectedDepartment;
        }

        const data = await apiService.getCivicFeed(params);

        if (pageNum === 1) {
          setItems(data.items || []);
        } else {
          setItems((prev) => [...prev, ...(data.items || [])]);
        }

        setTotalCount(data.total);
        setPage(data.page);
        setHasMore(data.has_more);
      } catch {
        const msg =
          language === 'ta'
            ? 'குடிமக்கள் பிரச்சனைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Unable to load civic issues feed. Please check your connection and try again.';
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sortBy, debouncedSearch, selectedStatus, selectedDepartment, language]
  );

  // Trigger initial fetch or re-fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchFeed(1, true);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchFeed(page + 1, false);
    }
  };

  // Toggle "I Have This Problem Too" confirmation
  const handleToggleConfirm = async (item: CivicFeedItem) => {
    const wasConfirmed = item.confirmed_by_current_user;
    const newCount = wasConfirmed
      ? Math.max(0, item.community_count - 1)
      : item.community_count + 1;

    // Optimistic UI update
    const updateLocalItem = (target: CivicFeedItem) => {
      if (target.id === item.id) {
        return {
          ...target,
          community_count: newCount,
          confirmed_by_current_user: !wasConfirmed,
        };
      }
      return target;
    };

    setItems((prev) => prev.map(updateLocalItem));
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem((prev) => (prev ? updateLocalItem(prev) : null));
    }

    try {
      if (wasConfirmed) {
        await apiService.removeConfirmation(item.id);
      } else {
        await apiService.confirmProblem(item.id);
      }
    } catch {
      // Revert optimistic update on failure
      const revertLocalItem = (target: CivicFeedItem) => {
        if (target.id === item.id) {
          return {
            ...target,
            community_count: item.community_count,
            confirmed_by_current_user: wasConfirmed,
          };
        }
        return target;
      };
      setItems((prev) => prev.map(revertLocalItem));
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem((prev) => (prev ? revertLocalItem(prev) : null));
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedStatus('ALL');
    setSelectedDepartment('ALL');
    setSortBy('recent');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-50 border border-civic-200 text-civic-800 text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-civic-600 animate-pulse" />
            <span>{t.feedHeroBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.feedTitle}
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1 max-w-xl">
            {t.feedSubtitle}
          </p>
        </div>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-civic-600 hover:bg-civic-700 text-white font-extrabold text-xs sm:text-sm shadow-touch transition-all shrink-0 min-h-[48px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.reportCivicProblemBtn}</span>
          </button>
        )}
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-card space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchFeedPlaceholder}
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-civic-500 focus:border-transparent transition-all min-h-[48px]"
            aria-label={t.searchFeedPlaceholder}
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
              {t.sortBy}:
            </span>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'recent'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{t.sortRecent}</span>
            </button>

            <button
              onClick={() => setSortBy('impact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'impact'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{t.sortImpact}</span>
            </button>

            <button
              onClick={() => setSortBy('urgency')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center space-x-1.5 shrink-0 ${
                sortBy === 'urgency'
                  ? 'bg-civic-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.sortUrgency}</span>
            </button>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterAllFeed}
            </button>

            <button
              onClick={() => setSelectedStatus('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                selectedStatus === 'IN_PROGRESS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterInProgressFeed}
            </button>

            <button
              onClick={() => setSelectedStatus('RESOLVED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] shrink-0 ${
                selectedStatus === 'RESOLVED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t.filterResolvedFeed}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => fetchFeed(1, true)}
        />
      )}

      {/* 4. Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingState message={t.loadingFeed} />
        </div>
      ) : items.length === 0 ? (
        /* 5. Empty State */
        <EmptyState
          icon={FileQuestion}
          title={t.noFeedIssuesFound}
          description={t.noFeedIssuesFoundDesc}
          actionLabel={
            searchQuery || selectedStatus !== 'ALL' || selectedDepartment !== 'ALL'
              ? t.clearFiltersBtn
              : t.reportCivicProblemBtn
          }
          onAction={
            searchQuery || selectedStatus !== 'ALL' || selectedDepartment !== 'ALL'
              ? handleClearFilters
              : onOpenReportModal
          }
        />
      ) : (
        /* 6. Main Feed List */
        <div className="space-y-4">
          {items.map((item) => (
            <CivicFeedCard
              key={`${item.id}-${item.community_count}`}
              item={item}
              onConfirm={handleToggleConfirm}
              onClickDetail={(selected) => setSelectedItem(selected)}
            />
          ))}

          {/* Pagination: Load More */}
          <div className="pt-4 pb-8 flex flex-col items-center justify-center space-y-2">
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-civic-700 border border-slate-300 font-extrabold text-xs sm:text-sm shadow-touch transition-all min-h-[48px] flex items-center space-x-2"
              >
                {isLoadingMore ? (
                  <>
                    <span className="w-4 h-4 border-2 border-civic-600 border-t-transparent rounded-full animate-spin" />
                    <span>{t.loading}</span>
                  </>
                ) : (
                  <span>{t.loadMoreFeed}</span>
                )}
              </button>
            ) : (
              <p className="text-xs font-semibold text-slate-400">
                {t.endOfFeed} ({totalCount} {language === 'ta' ? 'பிரச்சினைகள்' : 'ISSUES'})
              </p>
            )}
          </div>
        </div>
      )}

      {/* 7. Detailed Issue Modal */}
      {selectedItem && (
        <FeedDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleToggleConfirm}
        />
      )}
    </div>
  );
};
