import React, { useState } from 'react';
import { Grievance } from '../../types/api';
import { GrievanceCard } from '../../components/cards/GrievanceCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, RefreshCw, FileText, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MyGrievancesViewProps {
  grievances: Grievance[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectGrievance: (g: Grievance) => void;
  onOpenReportModal: () => void;
}

export const MyGrievancesView: React.FC<MyGrievancesViewProps> = ({
  grievances,
  isLoading,
  onRefresh,
  onSelectGrievance,
  onOpenReportModal,
}) => {
  const { t } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const statusTabs = [
    { id: 'ALL', label: t.filterAll },
    { id: 'TRIAGED', label: t.filterTriaged },
    { id: 'IN_PROGRESS', label: t.filterInProgress },
    { id: 'RESOLVED', label: t.filterResolved },
    { id: 'SUBMITTED', label: t.filterSubmitted },
    { id: 'REJECTED', label: t.filterRejected },
  ];

  const filteredGrievances = grievances.filter((g) => {
    // Status filter
    if (statusFilter !== 'ALL') {
      if (g.status.toUpperCase() !== statusFilter) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = g.tracking_id.toLowerCase().includes(q);
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchDesc = g.description.toLowerCase().includes(q);
      const matchLoc = (g.location || '').toLowerCase().includes(q);
      const matchDept = g.department.toLowerCase().includes(q);
      return matchId || matchTitle || matchDesc || matchLoc || matchDept;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-12 animate-fadeIn">
      {/* Header & New Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.myGrievancesTitle}</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            {t.myGrievancesSubtitle}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-civic-600 hover:bg-civic-700 active:bg-civic-800 text-white text-xs font-bold shadow-touch transition-all min-h-[48px] touch-active"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.reportNewProblem}</span>
        </button>
      </div>

      {/* Search & Refresh Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchGrievancePlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-civic-600 min-h-[44px]"
          />
        </div>

        <button
          onClick={onRefresh}
          title={t.refresh}
          className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={t.refresh}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map((tab) => {
          const isSelected = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border min-h-[40px] ${
                isSelected
                  ? 'bg-civic-600 text-white border-civic-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List / Empty State */}
      {filteredGrievances.length > 0 ? (
        <div className="space-y-3">
          {filteredGrievances.map((g) => (
            <GrievanceCard
              key={g.id}
              grievance={g}
              onClick={() => onSelectGrievance(g)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={searchQuery || statusFilter !== 'ALL' ? t.noGrievancesFound : t.noGrievancesYet}
          description={
            searchQuery || statusFilter !== 'ALL'
              ? t.noGrievancesFoundDesc
              : t.noGrievancesYetDesc
          }
          actionLabel={t.reportCivicProblemBtn}
          onAction={onOpenReportModal}
        />
      )}
    </div>
  );
};
