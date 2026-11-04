import React, { useState, useEffect } from 'react';
import { Scheme, SchemeRecommendationItem } from '../../types/api';
import { apiService } from '../../services/api';
import { SchemeCard } from '../../components/cards/SchemeCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useAuth } from '../../context/AuthContext';
import { SchemeDetailModal } from './SchemeDetailModal';
import { EligibilityCheckModal } from './EligibilityCheckModal';
import { SchemeAssistantSection } from './SchemeAssistantSection';
import { getLocalizedCategory } from '../../i18n/formatters';
import {
  Award,
  Sparkles,
  Search,
  BookOpen,
  SlidersHorizontal,
  User,
  ArrowRight,
} from 'lucide-react';

interface SchemesViewProps {
  onNavigateToTab?: (tab: 'home' | 'feed' | 'grievances' | 'schemes' | 'profile') => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({ onNavigateToTab }) => {
  const { t, language, user } = useAuth();
  const isTa = language === 'ta';

  const [activeSubTab, setActiveSubTab] = useState<'matched' | 'all'>('matched');
  const [recommendations, setRecommendations] = useState<SchemeRecommendationItem[]>([]);
  const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);

  // Modals & Selection State
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedWhyYouQualify, setSelectedWhyYouQualify] = useState<string | null>(null);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: t.catAll },
    { id: 'Education', label: t.catEducation },
    { id: 'Farmers', label: t.catFarmers },
    { id: 'Women', label: t.catWomen },
    { id: 'Housing', label: t.catHousing },
    { id: 'Health', label: t.catHealth },
    { id: 'Employment', label: t.catEmployment },
    { id: 'Senior Citizens', label: t.catSeniorCitizens },
    { id: 'Energy & Sustainability', label: t.catEnergy },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [recsRes, schemesRes] = await Promise.allSettled([
        apiService.getSchemeRecommendations(),
        apiService.getSchemes({ language }),
      ]);

      if (recsRes.status === 'fulfilled') {
        setRecommendations(recsRes.value.recommendations || []);
      }
      if (schemesRes.status === 'fulfilled') {
        setAllSchemes(schemesRes.value || []);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail ||
        err.message ||
        (isTa
          ? 'அரசு நலத்திட்டங்களை ஏற்றுவதில் தோல்வி ஏற்பட்டது. இணைய இணைப்பை சரிபார்க்கவும்.'
          : 'Unable to load welfare schemes. Please check your connection.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  const handleOpenSchemeDetails = (scheme: Scheme, why?: string) => {
    setSelectedScheme(scheme);
    setSelectedWhyYouQualify(why || null);
  };

  const handleOpenRecDetails = (rec: SchemeRecommendationItem) => {
    // Find matching Scheme from allSchemes or construct from recommendation
    const match = allSchemes.find((s) => s.id === rec.scheme_id || s.code === rec.scheme_code);
    if (match) {
      handleOpenSchemeDetails(match, rec.why_you_qualify);
    } else {
      const fallbackScheme: Scheme = {
        id: rec.scheme_id,
        code: rec.scheme_code,
        name: rec.scheme_name,
        category: rec.category,
        state: 'All-India',
        description: rec.potential_benefits || rec.scheme_name,
        benefits: rec.potential_benefits,
        eligibility_criteria: rec.why_you_qualify,
        required_documents: 'Aadhaar Card, Bank Account Passbook, Income Proof',
        required_documents_list: ['Aadhaar Card', 'Bank Account Passbook', 'Income Proof'],
        application_steps: 'Open the verified government portal and submit your application with required documents.',
        official_portal: 'https://services.india.gov.in',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      handleOpenSchemeDetails(fallbackScheme, rec.why_you_qualify);
    }
  };

  // Filter recommendations
  const filteredRecs = recommendations.filter((r) => {
    if (selectedCategory !== 'ALL' && !r.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.scheme_name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.why_you_qualify.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filter all schemes
  const filteredSchemes = allSchemes.filter((s) => {
    if (selectedCategory !== 'ALL' && !s.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = isTa && s.name_ta ? s.name_ta.toLowerCase() : s.name.toLowerCase();
      const desc = isTa && s.description_ta ? s.description_ta.toLowerCase() : s.description.toLowerCase();
      return (
        name.includes(q) ||
        desc.includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.target_groups && s.target_groups.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HEADER */}
      {/* ========================================================================= */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-black mb-2">
          <Award className="w-3.5 h-3.5 text-civic-700" />
          <span>{t.benefitsForYouTitle || 'Benefits for You'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.benefitsForYouTitle || 'Benefits for You'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          {t.benefitsForYouSubtitle || 'Government benefits and welfare schemes you may be eligible for based on your CivicOS profile.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. CIVICOS TWIN PROFILE BANNER */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-civic-800 via-civic-900 to-slate-900 text-white shadow-xl border border-civic-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{t.basedOnYourProfile || 'Based on your CivicOS profile'}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white leading-tight">
            {isTa
              ? `${user?.district || 'பெங்களூரு'} மற்றும் உங்கள் சுயவிவர அடிப்படையில் திட்டங்கள்`
              : `Personalized for your household in ${user?.district || 'Bengaluru Urban'}`}
          </h2>
          <p className="text-xs text-slate-200 font-medium">
            {isTa
              ? 'உங்கள் சுயவிவர விவரங்கள் மாறினால், மேலும் துல்லியமான திட்டங்களைப் பெற சுயவிவரத்தை புதுப்பிக்கலாம்.'
              : 'Keep your CivicOS profile updated to discover newly announced schemes matching your household.'}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-2">
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs border border-white/20 transition-all min-h-[44px] flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.updateProfileBtn || 'Update Profile'}</span>
            </button>
          )}

          <button
            onClick={() => setIsEligibilityModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs shadow-sm transition-all min-h-[44px] flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-950" />
            <span>{t.checkEligibilityBtn || 'Eligibility Checker'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUBTABS: PERSONALIZED VS ALL SCHEMES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveSubTab('matched')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 min-h-[48px] ${
            activeSubTab === 'matched'
              ? 'bg-white text-civic-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-civic-700" />
          <span>{t.matchedTab || 'Personalized for You'} ({recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-2 min-h-[48px] ${
            activeSubTab === 'all'
              ? 'bg-white text-civic-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-600" />
          <span>{t.allSchemesTab || 'All Government Schemes'} ({allSchemes.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. SEARCH & CATEGORY FILTER BAR */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder || 'Search schemes by keyword, department, or goal...'}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[48px]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border min-h-[40px] ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <ErrorBanner
          title={isTa ? 'திட்டங்களை ஏற்றுவதில் பிழை' : 'Could not load schemes'}
          message={errorMessage}
          onRetry={fetchData}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. CONTENT GRID */}
      {/* ========================================================================= */}
      {isLoading ? (
        <LoadingState message={isTa ? 'அரசு நலத்திட்டங்கள் கண்டறியப்படுகின்றன...' : 'Discovering tailored government welfare schemes...'} />
      ) : activeSubTab === 'matched' ? (
        /* Matched Recommendations Feed */
        filteredRecs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRecs.map((rec) => (
              <SchemeCard
                key={rec.scheme_id}
                recommendation={rec}
                onClick={() => handleOpenRecDetails(rec)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-card">
            <div className="w-14 h-14 rounded-full bg-civic-50 text-civic-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-black text-lg text-slate-900">
                {t.noMatchedBenefitsTitle || "We couldn't find a strong match right now."}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {t.noMatchedBenefitsDesc ||
                  'Add a few more details to your profile to help CivicOS discover tailored schemes, or explore all public services.'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('profile')}
                  className="px-6 py-3 rounded-2xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-bold text-xs sm:text-sm shadow-sm transition-all min-h-[48px]"
                >
                  {t.updateProfileBtn || 'Update Profile'}
                </button>
              )}

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('home')}
                  className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all min-h-[48px]"
                >
                  {t.browseAllGovServices || 'Browse Government Services'}
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        /* All Government Schemes Catalog */
        filteredSchemes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => handleOpenSchemeDetails(scheme)}
                className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-civic-600 shadow-card hover:shadow-card-hover transition-all cursor-pointer space-y-3.5 group touch-active text-left flex flex-col justify-between"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenSchemeDetails(scheme);
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-civic-800 bg-civic-100 px-2.5 py-1 rounded-lg border border-civic-200">
                      {getLocalizedCategory(scheme.category, language)}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-bold">
                      {scheme.code}
                    </span>
                  </div>

                  <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-civic-800 transition-colors leading-tight">
                    {isTa && scheme.name_ta ? scheme.name_ta : scheme.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {isTa && scheme.description_ta ? scheme.description_ta : scheme.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <span className="text-xs text-slate-500 font-semibold">
                    {scheme.source_name || (isTa ? 'அரசு தளம்' : 'Government Portal')}
                  </span>
                  <div className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-civic-50 group-hover:bg-civic-700 text-civic-800 group-hover:text-white font-black text-xs transition-all shadow-2xs">
                    <span>{t.learnMoreAndGuide || 'Application Guide'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
            <p className="font-bold text-sm text-slate-800">
              {t.noSchemesFoundTitle || 'No government schemes found'}
            </p>
            <p className="text-xs text-slate-500">
              {t.noSchemesFoundDesc || 'Try adjusting your search query or category filter.'}
            </p>
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* 6. AI BENEFITS ASSISTANT SECTION */}
      {/* ========================================================================= */}
      <SchemeAssistantSection
        onSelectScheme={handleOpenSchemeDetails}
        allSchemes={allSchemes}
      />

      {/* ========================================================================= */}
      {/* 7. MODALS */}
      {/* ========================================================================= */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          whyYouQualify={selectedWhyYouQualify}
          onClose={() => {
            setSelectedScheme(null);
            setSelectedWhyYouQualify(null);
          }}
        />
      )}

      {isEligibilityModalOpen && (
        <EligibilityCheckModal
          onClose={() => setIsEligibilityModalOpen(false)}
          onSelectScheme={handleOpenSchemeDetails}
          allSchemes={allSchemes}
        />
      )}
    </div>
  );
};
