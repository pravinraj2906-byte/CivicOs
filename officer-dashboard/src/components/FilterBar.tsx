import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, RefreshCw, X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  departmentFilter: string;
  onDepartmentChange: (dept: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  departmentFilter,
  onDepartmentChange,
  onRefresh,
  isRefreshing,
  totalFilteredCount,
}) => {
  const { t, language } = useAuth();

  const quickPills: {
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }[] = [
    {
      id: 'all',
      label: t.categoryAll || 'All',
      isActive: statusFilter === 'ALL' && priorityFilter === 'ALL',
      onClick: () => {
        onStatusChange('ALL');
        onPriorityChange('ALL');
      },
    },
    {
      id: 'critical',
      label: t.prioCritical || 'Critical',
      isActive: priorityFilter === 'CRITICAL',
      onClick: () => {
        onPriorityChange(priorityFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL');
        if (statusFilter !== 'ALL') onStatusChange('ALL');
      },
    },
    {
      id: 'high',
      label: t.prioHigh || 'High',
      isActive: priorityFilter === 'HIGH',
      onClick: () => {
        onPriorityChange(priorityFilter === 'HIGH' ? 'ALL' : 'HIGH');
        if (statusFilter !== 'ALL') onStatusChange('ALL');
      },
    },
    {
      id: 'standard',
      label: t.filterStandard || 'Standard',
      isActive: priorityFilter === 'MEDIUM' || priorityFilter === 'LOW',
      onClick: () => {
        onPriorityChange(priorityFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM');
        if (statusFilter !== 'ALL') onStatusChange('ALL');
      },
    },
    {
      id: 'new',
      label: t.filterNew || 'New',
      isActive: statusFilter === 'SUBMITTED' || statusFilter === 'TRIAGED',
      onClick: () => {
        onStatusChange(statusFilter === 'TRIAGED' ? 'ALL' : 'TRIAGED');
        if (priorityFilter !== 'ALL') onPriorityChange('ALL');
      },
    },
    {
      id: 'inprogress',
      label: t.statusInProgress || 'In Progress',
      isActive: statusFilter === 'IN_PROGRESS',
      onClick: () => {
        onStatusChange(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS');
        if (priorityFilter !== 'ALL') onPriorityChange('ALL');
      },
    },
    {
      id: 'resolved',
      label: t.statusResolved || 'Resolved',
      isActive: statusFilter === 'RESOLVED',
      onClick: () => {
        onStatusChange(statusFilter === 'RESOLVED' ? 'ALL' : 'RESOLVED');
        if (priorityFilter !== 'ALL') onPriorityChange('ALL');
      },
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs mb-6 space-y-3">
      {/* Top Search & Refresh Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'புகார் எண், பிரச்சனை அல்லது இருப்பிடம் மூலம் தேடுக...'
                : 'Search by issue, reference number, or location...'
            }
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-civic-600 focus:border-civic-600 transition-all placeholder:text-slate-400 min-h-[44px]"
            aria-label="Search grievances"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter & Refresh Button */}
        <div className="flex items-center space-x-2">
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-civic-600 min-h-[44px] cursor-pointer"
            aria-label="Filter by department"
          >
            <option value="ALL">{t.allJurisdictions || 'All Departments'}</option>
            <option value="Water_Sanitation">{t.deptWater || 'Water & Sanitation'}</option>
            <option value="Public_Works">{t.deptRoads || 'Public Works (Roads)'}</option>
            <option value="Electricity_Board">{t.deptElectricity || 'Electricity Board'}</option>
            <option value="Health_Dept">{t.deptHealth || 'Public Health'}</option>
            <option value="Municipal_Corp">{t.deptMunicipal || 'Municipal Administration'}</option>
          </select>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[44px] shrink-0 active:scale-95 disabled:opacity-50"
            title={t.refreshBtn || 'Refresh'}
            aria-label={t.refreshBtn || 'Refresh queue'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-civic-600' : ''}`} />
            <span className="hidden sm:inline">{t.refreshBtn || 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center space-x-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filters:</span>
          </span>

          {quickPills.map((pill) => (
            <button
              key={pill.id}
              onClick={pill.onClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                pill.isActive
                  ? 'bg-civic-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="text-xs text-slate-500 font-semibold">
          {language === 'ta'
            ? `${totalFilteredCount} புகார்கள் காட்டப்படுகின்றன`
            : `Showing ${totalFilteredCount} complaints`}
        </div>
      </div>
    </div>
  );
};
