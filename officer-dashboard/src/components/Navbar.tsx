import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Droplets,
  Wrench,
  Zap,
  HeartPulse,
  User,
  Bell,
  Trash2,
  FileText,
  Radio,
  Sparkles,
} from 'lucide-react';
import { CivicLogo } from './design-system/CivicLogo';
import { LanguageSelector } from './LanguageSelector';

export type DashboardTab = 'queue' | 'intelligence' | 'impact';

interface NavbarProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  attentionCount?: number;
  hasCritical?: boolean;
  onOpenAttentionCenter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'queue',
  onTabChange,
  attentionCount = 0,
  hasCritical = false,
  onOpenAttentionCenter,
}) => {
  const { user, logout, language, t } = useAuth();

  const getDeptBadge = (dept?: string | null) => {
    switch (dept) {
      case 'Water_Sanitation':
        return {
          label: t.deptWater,
          icon: <Droplets className="w-3.5 h-3.5 text-blue-600" />,
          bg: 'bg-blue-50 border-blue-200 text-blue-900 font-bold',
        };
      case 'Public_Works':
        return {
          label: t.deptRoads,
          icon: <Wrench className="w-3.5 h-3.5 text-orange-600" />,
          bg: 'bg-orange-50 border-orange-200 text-orange-900 font-bold',
        };
      case 'Electricity_Board':
        return {
          label: t.deptElectricity,
          icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-900 font-bold',
        };
      case 'Health_Dept':
      case 'Public_Health':
        return {
          label: t.deptHealth,
          icon: <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold',
        };
      case 'Waste_Management':
      default:
        return {
          label: t.deptWaste,
          icon: <Trash2 className="w-3.5 h-3.5 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200 text-purple-900 font-bold',
        };
    }
  };

  const deptInfo = getDeptBadge(user?.department);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E4E7EC] shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official CivicOS Logo & Nav Tabs */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <CivicLogo
              portalTag={t.officerPortalBadge}
              subtitle={t.portalSubtitle}
            />

            {/* Navigation Tabs (Desktop / Tablet) */}
            {onTabChange && (
              <nav className="hidden md:flex items-center space-x-1.5 pl-4 border-l border-slate-200 ml-2">
                {/* 1. Operations Queue */}
                <button
                  onClick={() => onTabChange('queue')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                    activeTab === 'queue'
                      ? 'bg-[#123B6D] text-white shadow-xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F0F5FA]'
                  }`}
                  aria-current={activeTab === 'queue' ? 'page' : undefined}
                >
                  <FileText className="w-4 h-4" />
                  <span>{t.navOperations || 'Operations'}</span>
                </button>

                {/* 2. Civic Intelligence */}
                <button
                  onClick={() => onTabChange('intelligence')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                    activeTab === 'intelligence'
                      ? 'bg-[#123B6D] text-white shadow-xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F0F5FA]'
                  }`}
                  aria-current={activeTab === 'intelligence' ? 'page' : undefined}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t.navIntelligence || 'Civic Intelligence'}</span>
                </button>

                {/* 3. Civic Impact */}
                <button
                  onClick={() => onTabChange('impact')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                    activeTab === 'impact'
                      ? 'bg-[#123B6D] text-white shadow-xs'
                      : 'text-[#667085] hover:text-[#172033] hover:bg-[#F0F5FA]'
                  }`}
                  aria-current={activeTab === 'impact' ? 'page' : undefined}
                >
                  <Radio className={`w-4 h-4 ${activeTab === 'impact' ? 'animate-pulse text-[#F28C28]' : 'text-[#123B6D]'}`} />
                  <span>{t.navCivicImpact}</span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded-full bg-[#168447] text-white">
                    LIVE
                  </span>
                </button>
              </nav>
            )}
          </div>

          {/* Officer Info & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Attention Center Trigger Button */}
            {onOpenAttentionCenter && (
              <button
                onClick={onOpenAttentionCenter}
                title={`${t.attentionNeeded}: ${attentionCount}`}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                  hasCritical
                    ? 'bg-red-50 hover:bg-red-100 text-red-900 border-red-300 shadow-xs animate-pulse'
                    : attentionCount > 0
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                aria-label={`${t.attentionNeeded}: ${attentionCount}`}
              >
                <Bell className="w-4 h-4 text-civic-700" />
                <span className="hidden sm:inline">{t.attentionNeeded}</span>
                {attentionCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full text-white ${
                      hasCritical ? 'bg-red-600 animate-bounce' : 'bg-amber-600'
                    }`}
                  >
                    {attentionCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Selector Dropdown */}
            <LanguageSelector />

            {/* Department Badge */}
            {user?.department && (
              <div className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs ${deptInfo.bg}`}>
                {deptInfo.icon}
                <span>{deptInfo.label}</span>
              </div>
            )}

            {/* User Profile info */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900">{user?.name || (language === 'ta' ? 'அலுவலர்' : 'Officer')}</div>
                <div className="text-[11px] text-slate-500 truncate max-w-[160px] font-medium">{user?.email}</div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center sm:hidden">
                <User className="w-4 h-4" />
              </div>

              <button
                onClick={logout}
                title={t.logout}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[44px]"
                aria-label={t.logout}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sub-Bar */}
        {onTabChange && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 gap-1">
            <button
              onClick={() => onTabChange('queue')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'queue'
                  ? 'bg-civic-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.navOperations || 'Operations'}</span>
            </button>

            <button
              onClick={() => onTabChange('intelligence')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'intelligence'
                  ? 'bg-civic-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.navIntelligence || 'Intelligence'}</span>
            </button>

            <button
              onClick={() => onTabChange('impact')}
              className={`flex-1 flex items-center justify-center space-x-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'impact'
                  ? 'bg-civic-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{t.navCivicImpact || 'Impact'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
