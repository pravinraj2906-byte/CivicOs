import React from 'react';
import { Home, Radio, FileText, Award, User, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type TabType = 'home' | 'feed' | 'grievances' | 'schemes' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenReportModal?: () => void;
  activeGrievanceCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenReportModal,
  activeGrievanceCount = 0,
}) => {
  const { t } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-elevated safe-area-bottom"
      aria-label="Citizen Portal Main Navigation"
    >
      <div className="max-w-lg mx-auto flex items-center justify-between min-h-[64px] px-2 py-1">
        {/* 1. Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all min-h-[56px] ${
            activeTab === 'home'
              ? 'text-civic-700 bg-civic-50/80 rounded-2xl font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-current={activeTab === 'home' ? 'page' : undefined}
          aria-label={t.homeTab || 'Home'}
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium truncate max-w-[60px]">
            {t.homeTab || 'Home'}
          </span>
        </button>

        {/* 2. Civic Feed */}
        <button
          onClick={() => onTabChange('feed')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all min-h-[56px] ${
            activeTab === 'feed'
              ? 'text-civic-700 bg-civic-50/80 rounded-2xl font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-current={activeTab === 'feed' ? 'page' : undefined}
          aria-label={t.feedTab || 'Feed'}
        >
          <Radio className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium truncate max-w-[60px]">
            {t.feedTab || 'Feed'}
          </span>
        </button>

        {/* 3. My Grievances */}
        <button
          onClick={() => onTabChange('grievances')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all min-h-[56px] relative ${
            activeTab === 'grievances'
              ? 'text-civic-700 bg-civic-50/80 rounded-2xl font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-current={activeTab === 'grievances' ? 'page' : undefined}
          aria-label={t.grievancesTab || 'Grievances'}
        >
          <div className="relative flex items-center justify-center">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            {activeGrievanceCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full bg-civic-600 text-white text-[10px] font-extrabold border border-white">
                {activeGrievanceCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium truncate max-w-[60px]">
            {t.grievancesTab || 'Grievances'}
          </span>
        </button>

        {/* 4. CENTRAL PROMINENT '+' ACTION (Report an Issue) */}
        <div className="flex-shrink-0 px-1 -mt-4">
          <button
            onClick={onOpenReportModal}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F28C28] hover:bg-[#d9771e] active:bg-[#c46815] text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center border-3 border-white focus:ring-4 focus:ring-amber-300 focus:outline-none"
            aria-label={t.reportIssueTitle || 'Report an Issue'}
            title={t.reportIssueTitle || 'Report an Issue'}
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* 5. Welfare / Benefits */}
        <button
          onClick={() => onTabChange('schemes')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all min-h-[56px] ${
            activeTab === 'schemes'
              ? 'text-civic-700 bg-civic-50/80 rounded-2xl font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-current={activeTab === 'schemes' ? 'page' : undefined}
          aria-label={t.schemesTab || 'Welfare'}
        >
          <Award className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium truncate max-w-[60px]">
            {t.schemesTab || 'Welfare'}
          </span>
        </button>

        {/* 6. Citizen Twin / Profile */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all min-h-[56px] ${
            activeTab === 'profile'
              ? 'text-civic-700 bg-civic-50/80 rounded-2xl font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          aria-label={t.profileTab || 'Twin'}
        >
          <User className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight font-medium truncate max-w-[60px]">
            {t.profileTab || 'Twin'}
          </span>
        </button>
      </div>
    </nav>
  );
};
