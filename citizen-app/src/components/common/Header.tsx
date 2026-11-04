import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, LogOut, Type, User as UserIcon, Languages, Bell } from 'lucide-react';
import { HelpModal } from './HelpModal';
import { UpdatesModal } from './UpdatesModal';
import { CivicLogo } from '../design-system/CivicLogo';

export const Header: React.FC = () => {
  const { user, logout, fontSizeMode, setFontSizeMode, language, setLanguage, t } = useAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);

  const cycleFontSize = () => {
    if (fontSizeMode === 'normal') setFontSizeMode('large');
    else if (fontSizeMode === 'large') setFontSizeMode('xl');
    else setFontSizeMode('normal');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const getFontLabel = () => {
    if (fontSizeMode === 'normal') return t.standardText;
    if (fontSizeMode === 'large') return t.largeText;
    return t.extraLargeText;
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#E4E7EC] shadow-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Official CivicOS Logo */}
          <CivicLogo
            portalTag={language === 'ta' ? 'குடிமக்கள்' : 'Citizen'}
            subtitle={t.portalSubtitle}
          />

          {/* Controls: Updates, Language Toggle, Font Size, Help, User */}
          <div className="flex items-center space-x-2">
            {/* In-App Report Updates Bell */}
            <button
              onClick={() => setShowUpdates(true)}
              title={t.inAppUpdatesTitle || 'CivicOS Updates'}
              className="flex items-center justify-center p-2 rounded-xl bg-civic-50 hover:bg-civic-100 text-civic-800 border border-civic-200 transition-all min-w-[44px] min-h-[44px]"
              aria-label={t.inAppUpdatesTitle || 'CivicOS Updates'}
            >
              <Bell className="w-5 h-5 text-civic-700" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title={`Switch Language to ${language === 'en' ? 'தமிழ்' : 'English'}`}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all min-h-[44px]"
              aria-label={`Change language. Current is ${language === 'en' ? 'English' : 'Tamil'}`}
            >
              <Languages className="w-4 h-4 text-civic-600" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Font Size Accessibility Button */}
            <button
              onClick={cycleFontSize}
              title={`${t.textSize}: ${getFontLabel()}`}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-all min-h-[44px]"
              aria-label={`${t.textSize}: ${getFontLabel()}`}
            >
              <Type className="w-4 h-4 text-civic-700" />
              <span className="font-mono">{fontSizeMode === 'normal' ? 'A' : fontSizeMode === 'large' ? 'A+' : 'A++'}</span>
            </button>

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              title={t.help}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 transition-all min-w-[44px] min-h-[44px]"
              aria-label={t.help}
            >
              <HelpCircle className="w-5 h-5 text-civic-700" />
            </button>

            {/* User Avatar & Logout */}
            {user && (
              <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-semibold truncate max-w-[120px]">{user.name.split(' ')[0]}</span>
                </div>

                <button
                  onClick={logout}
                  title={t.logout}
                  className="flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all min-w-[44px] min-h-[44px]"
                  aria-label={t.logout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* In-App CivicOS Updates Modal */}
      {showUpdates && <UpdatesModal onClose={() => setShowUpdates(false)} />}
    </>
  );
};
