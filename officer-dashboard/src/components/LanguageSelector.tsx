import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { Language } from '../i18n/translations';

interface LanguageSelectorProps {
  className?: string;
  align?: 'left' | 'right';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  align = 'right',
}) => {
  const { language, setLanguage, t } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLabel = language === 'ta' ? 'தமிழ்' : 'ENGLISH';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Current Language Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`${t.selectLanguage || 'Select Language'}. Current: ${currentLabel}`}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-bold transition-all min-h-[44px] shadow-xs select-none"
      >
        <Languages className="w-4 h-4 text-civic-700 shrink-0" />
        <span className="tracking-wide">{currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Language Options Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-44 rounded-2xl bg-white border border-slate-200 shadow-elevated py-1.5 z-50 animate-fadeIn`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            {t.selectLanguage || 'SELECT LANGUAGE'}
          </div>

          {/* Option 1: ENGLISH */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('en')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors min-h-[40px] ${
              language === 'en'
                ? 'bg-civic-50 text-civic-900 font-extrabold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
            role="menuitem"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs">ENGLISH</span>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-civic-700 shrink-0" />}
          </button>

          {/* Option 2: தமிழ் */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('ta')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-left transition-colors min-h-[40px] ${
              language === 'ta'
                ? 'bg-civic-50 text-civic-900 font-extrabold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
            role="menuitem"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs">தமிழ்</span>
            </div>
            {language === 'ta' && <Check className="w-4 h-4 text-civic-700 shrink-0" />}
          </button>
        </div>
      )}
    </div>
  );
};
