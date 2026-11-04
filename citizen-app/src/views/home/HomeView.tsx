import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Grievance, SchemeRecommendationItem, CitizenWithProfile, CivicFeedItem } from '../../types/api';
import { apiService } from '../../services/api';
import { GOVERNMENT_SERVICES } from '../../services/serviceCatalog';
import { GovernmentService } from '../../services/serviceTypes';
import { ServiceResolver } from '../../services/serviceResolver';
import { GOVERNMENT_UPDATES } from '../../data/governmentUpdates';
import { ServiceGuideModal } from '../../components/services/ServiceGuideModal';
import { CivicConciergeModal } from '../../components/services/CivicConciergeModal';
import { ConciergeEngine, ConciergeResult } from '../../services/conciergeEngine';
import { HelpModal } from '../../components/common/HelpModal';
import {
  Search,
  X,
  CreditCard,
  Shield,
  Compass,
  Car,
  FileCheck,
  Home as HomeIcon,
  Award,
  Users,
  Zap,
  ArrowRight,
  ChevronRight,
  Radio,
  Building,
  HelpCircle,
  PhoneCall,
  Droplets,
  Phone,
  Sparkles,
  ExternalLink,
  Calendar,
  FileText,
  User,
} from 'lucide-react';
import {
  getLocalizedTitle,
  getLocalizedDescription,
  getLocalizedLocation,
  getLocalizedCategory,
} from '../../i18n/formatters';

interface HomeViewProps {
  citizenProfile: CitizenWithProfile | null;
  grievances: Grievance[];
  topScheme: SchemeRecommendationItem | null;
  onOpenReportModal: () => void;
  onNavigateToTab: (tab: 'home' | 'feed' | 'grievances' | 'schemes' | 'profile') => void;
  onSelectGrievance: (g: Grievance) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  citizenProfile,
  grievances: _grievances,
  topScheme: _topScheme,
  onOpenReportModal: _onOpenReportModal,
  onNavigateToTab,
  onSelectGrievance: _onSelectGrievance,
}) => {
  const { user, t, language } = useAuth();
  const isTa = language === 'ta';

  // Search & Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<GovernmentService | null>(null);
  const [conciergeResult, setConciergeResult] = useState<ConciergeResult | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [nearbyFeedItems, setNearbyFeedItems] = useState<CivicFeedItem[]>([]);

  const handleAskConcierge = (queryToAsk?: string) => {
    const q = (queryToAsk !== undefined ? queryToAsk : searchQuery).trim();
    if (!q) return;
    const res = ConciergeEngine.interpret(q, language);
    setConciergeResult(res);
  };

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.homeGoodMorning || 'Good morning';
    if (hour < 17) return t.homeGoodAfternoon || 'Good afternoon';
    return t.homeGoodEvening || 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : (isTa ? 'குடிமகன்' : 'Citizen');

  // Citizen Twin completeness
  const profile = citizenProfile?.profile;
  let completeness = 30;
  if (profile?.age) completeness += 15;
  if (profile?.occupation) completeness += 15;
  if (profile?.income_range) completeness += 15;
  if (profile?.residence_type) completeness += 15;
  if (profile?.interests) completeness += 10;

  // Search filter using deterministic ServiceResolver
  const filteredServices = useMemo(() => {
    return ServiceResolver.resolve(searchQuery, language);
  }, [searchQuery, language]);

  // Load 2 recent community feed items for preview
  useEffect(() => {
    let isMounted = true;
    const loadFeedPreview = async () => {
      try {
        const res = await apiService.getCivicFeed({ limit: 2, language });
        if (isMounted && res.items) {
          setNearbyFeedItems(res.items.slice(0, 2));
        }
      } catch {
        // Graceful offline fallback
      }
    };

    loadFeedPreview();
    return () => {
      isMounted = false;
    };
  }, [language]);

  // Icon mapping for services
  const renderServiceIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'FileCheck':
        return <FileCheck className={className} />;
      case 'Home':
        return <HomeIcon className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  // Quick search & AI Concierge suggestions
  const searchSuggestions = isTa
    ? [
        { label: t.promptPan || 'எனக்கு PAN கார்டு வேண்டும்', query: 'எனக்கு PAN கார்டு வேண்டும்' },
        { label: t.promptPassport || 'பாஸ்போர்ட்டிற்கு எப்படி விண்ணப்பிப்பது?', query: 'பாஸ்போர்ட்டிற்கு எப்படி விண்ணப்பிப்பது?' },
        { label: t.promptBenefits || 'குடும்பத்திற்கான அரசு நலத்திட்டங்கள் என்ன?', query: 'குடும்பத்திற்கான அரசு நலத்திட்டங்கள் என்ன?' },
        { label: t.promptIncomeCert || 'வருமானச் சான்றிதழ் பெறுவது எப்படி?', query: 'வருமானச் சான்றிதழ் பெறுவது எப்படி?' },
        { label: t.promptStreetlight || 'தெருவிளக்கு பழுது புகார்', query: 'தெருவிளக்கு பழுது புகார்' },
        { label: t.promptRelocation || 'நான் புதிய முகவரிக்கு மாறினேன்', query: 'நான் புதிய முகவரிக்கு மாறினேன்' },
      ]
    : [
        { label: t.promptPan || 'I need a PAN card', query: 'I need a PAN card' },
        { label: t.promptPassport || 'How can I apply for a passport?', query: 'How can I apply for a passport?' },
        { label: t.promptBenefits || 'What benefits can my family get?', query: 'What benefits can my family get?' },
        { label: t.promptIncomeCert || 'I need an income certificate', query: 'I need an income certificate' },
        { label: t.promptStreetlight || 'I want to report a broken streetlight', query: 'I want to report a broken streetlight' },
        { label: t.promptRelocation || 'I moved to a new address', query: 'I moved to a new address' },
      ];

  const popularServices = GOVERNMENT_SERVICES.filter((s) => s.is_popular);
  const newOnlineServices = GOVERNMENT_SERVICES.filter((s) => s.is_new);

  return (
    <div className="space-y-7 sm:space-y-9 pb-16 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. WELCOME GREETING AREA */}
      {/* ========================================================================= */}
      <section aria-labelledby="welcome-heading">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{t.district}: {user?.district || 'Bengaluru Urban'}</span>
              </div>
              <h1
                id="welcome-heading"
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
              >
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium">
                {t.homeWelcomeSub || 'How can we help you today?'}
              </p>
            </div>

            {/* Quick Profile Summary Link */}
            <button
              onClick={() => onNavigateToTab('profile')}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all flex items-center space-x-3 min-h-[48px] focus:ring-2 focus:ring-civic-700 focus:outline-none"
              aria-label={`${t.twinCardTitle}, ${completeness}% ${t.profileComplete}`}
            >
              <div className="w-10 h-10 rounded-xl bg-civic-100 text-civic-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5 text-civic-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                  <span>{t.citizenTwinPill || 'Citizen Twin'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {completeness}% {t.profileComplete || 'Complete'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN GOVERNMENT SERVICE SEARCH (CORE SERVICE-FIRST HERO) */}
      {/* ========================================================================= */}
      <section aria-labelledby="service-search-heading" className="space-y-4">
        <div className="bg-linear-to-br from-civic-900 via-civic-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-civic-700 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Building className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <h2
                id="service-search-heading"
                className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight"
              >
                {t.serviceSearchHeading || 'What government service do you need?'}
              </h2>
              <p className="text-xs sm:text-sm text-civic-200 font-medium">
                {t.serviceSearchSubtitle || 'Find out how to apply, what you need, and where to apply.'}
              </p>
            </div>

            {/* Prominent Unified Concierge Search Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskConcierge();
              }}
              className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.conciergeInputPlaceholder || 'Tell CivicOS: e.g. I need a PAN card, passport, benefits, broken streetlight...'}
                  className="w-full pl-12 pr-10 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-semibold border-2 border-transparent focus:border-amber-400 focus:outline-none shadow-lg min-h-[56px]"
                  aria-label={t.conciergeHeading || 'What do you need help with?'}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="flex items-center justify-center space-x-2 px-5 py-3.5 sm:py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-sm sm:text-base font-extrabold transition-all shadow-md min-h-[52px] sm:min-h-[56px] shrink-0"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{t.conciergeAskBtn || 'Ask CivicOS'}</span>
              </button>
            </form>

            {/* Quick Search Chips / Suggestions */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-civic-300">
                {isTa ? 'அடிக்கடி கேட்கப்படும் கேள்விகள் (தட்டவும்):' : 'Common citizen requests (tap to ask):'}
              </div>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.query);
                      handleAskConcierge(item.query);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold backdrop-blur-xs transition-all border border-white/10 text-left min-h-[40px] flex items-center space-x-1.5"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Search Results */}
        {searchQuery.trim() !== '' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">
                {isTa ? `தேடல் முடிவுகள் (${filteredServices.length})` : `Search Results (${filteredServices.length})`}
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-civic-700 hover:text-civic-900"
              >
                {isTa ? 'அனைத்தையும் காட்டுக' : 'Clear search'}
              </button>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-civic-600 hover:shadow-card-hover transition-all cursor-pointer space-y-2.5 text-left group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedService(service);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-civic-100 text-civic-800">
                        {isTa ? service.category_ta : service.category}
                      </span>
                      <div className="text-civic-700 group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 group-hover:text-civic-800 transition-colors">
                      {isTa ? service.title_ta : service.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {isTa ? service.short_desc_ta : service.short_desc}
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>{service.official_portal_name}</span>
                      <span className="text-civic-700 font-bold">{t.viewDetails || 'View Guide'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center space-y-3 text-slate-600">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-slate-800">
                    {isTa ? 'அரசு சேவைகளைக் கண்டறிய நான் உதவ முடியும்.' : 'I can help you find a government service.'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isTa
                      ? 'கீழே உள்ள பிரபலமான சேவைகளை கிளிக் செய்யவும் அல்லது "பான்", "ஆதார்", "பாஸ்போர்ட்" எனத் தேடவும்.'
                      : 'Try clicking one of the popular services below or search for "PAN", "Aadhaar", or "Passport".'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {popularServices.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className="px-3.5 py-1.5 rounded-xl bg-civic-50 hover:bg-civic-100 text-civic-800 text-xs font-bold border border-civic-200 transition-colors"
                    >
                      {isTa ? s.title_ta.split('(')[0].trim() : s.title.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. POPULAR GOVERNMENT SERVICES (8 ACCESSIBLE CARDS) */}
      {/* ========================================================================= */}
      <section aria-labelledby="popular-services-heading" className="space-y-3.5">
        <div className="space-y-0.5">
          <h2
            id="popular-services-heading"
            className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight"
          >
            {t.popularServicesHeading || 'Popular Government Services'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t.popularServicesSubtitle || 'Official guides, required documents, and direct application links'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {popularServices.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-civic-700 hover:shadow-card-hover transition-all text-left flex flex-col justify-between group min-h-[140px] focus:ring-2 focus:ring-civic-700 focus:outline-none"
              aria-label={`${isTa ? service.title_ta : service.title} - ${isTa ? service.category_ta : service.category}`}
            >
              <div className="space-y-2.5">
                <div className="w-11 h-11 rounded-2xl bg-civic-50 text-civic-800 border border-civic-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-civic-100 transition-all">
                  {renderServiceIcon(service.icon_name, 'w-5 h-5 text-civic-800')}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block line-clamp-1">
                    {isTa ? service.category_ta : service.category}
                  </span>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-civic-800 transition-colors line-clamp-2 mt-0.5 leading-snug">
                    {isTa ? service.title_ta : service.title}
                  </h3>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-civic-700 group-hover:translate-x-0.5 transition-transform">
                <span>{t.viewDetails || 'View Guide'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. NEW ONLINE SERVICES */}
      {/* ========================================================================= */}
      <section aria-labelledby="new-services-heading" className="space-y-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <h2
              id="new-services-heading"
              className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight"
            >
              {t.newOnlineServicesHeading || 'New Online Services'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t.newOnlineServicesSubtitle || 'Newly available government applications and public portals'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {newOnlineServices.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="p-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-amber-500 hover:shadow-card-hover transition-all cursor-pointer space-y-3 group text-left focus:ring-2 focus:ring-amber-500 focus:outline-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedService(service);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{isTa ? 'புதிய சேவை' : 'New Service'}</span>
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {isTa ? service.category_ta : service.category}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                  {isTa ? service.title_ta : service.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2 font-medium">
                  {isTa ? service.short_desc_ta : service.short_desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 truncate max-w-[200px]">
                  {service.official_portal_name}
                </span>
                <div className="flex items-center space-x-1 font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                  <span>{t.viewDetails || 'View Guide'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. GOVERNMENT UPDATES & OFFICIAL CIRCULARS */}
      {/* ========================================================================= */}
      <section aria-labelledby="govt-updates-heading" className="space-y-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-civic-700" />
            <h2
              id="govt-updates-heading"
              className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight"
            >
              {t.governmentUpdatesHeading || 'Government Updates'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t.governmentUpdatesSubtitle || 'Official public circulars, scheme updates, and citizen advisories'}
          </p>
        </div>

        <div className="space-y-3">
          {GOVERNMENT_UPDATES.map((update) => (
            <div
              key={update.id}
              className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {isTa ? update.category_ta : update.category}
                  </span>
                  <span className="text-xs font-semibold text-civic-800">
                    {isTa ? update.department_ta : update.department}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isTa ? update.date_ta : update.date}</span>
                </div>
              </div>

              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {isTa ? update.title_ta : update.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {isTa ? update.summary_ta : update.summary}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{update.source_portal_name}</span>
                <a
                  href={update.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-civic-700 hover:text-civic-900 flex items-center space-x-1 p-1 focus:outline-none"
                >
                  <span>{t.officialWebsite || 'Official Website'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BENEFITS FOR YOU (WELFARE / SCHEMES HIGHLIGHT) */}
      {/* ========================================================================= */}
      <section aria-labelledby="benefits-heading">
        <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-900 to-teal-950 text-white border border-emerald-800 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-200 text-xs font-bold">
                <Award className="w-4 h-4 text-emerald-300" />
                <span id="benefits-heading">{t.benefitsForYouHeading || 'Benefits for You'}</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                {t.benefitsForYouSubtitle || 'Find government schemes and benefits you may qualify for.'}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                onClick={() => onNavigateToTab('schemes')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 active:bg-emerald-100 font-bold text-xs sm:text-sm transition-all min-h-[48px] flex items-center justify-center space-x-1.5 shadow-md focus:ring-2 focus:ring-white focus:outline-none"
              >
                <span>{t.findBenefitsBtn || 'Find Benefits'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToTab('schemes')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm border border-emerald-700 transition-all min-h-[48px] flex items-center justify-center space-x-1.5 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
              >
                <span>{t.exploreAllSchemesBtn || 'Explore All Schemes'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CIVIC FEED PREVIEW (NEIGHBORHOOD UPDATES) */}
      {/* ========================================================================= */}
      <section aria-labelledby="community-heading" className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-sky-600" />
            <h2
              id="community-heading"
              className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight"
            >
              {t.whatsHappeningNearby || "What's happening nearby"}
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab('feed')}
            className="text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-900 flex items-center space-x-1 p-1 focus:outline-none"
          >
            <span>{t.viewCivicFeedLink || 'View Civic Feed'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {nearbyFeedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {nearbyFeedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateToTab('feed')}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-card hover:shadow-card-hover transition-all cursor-pointer space-y-2.5 group focus:ring-2 focus:ring-sky-600 focus:outline-none text-left"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {getLocalizedCategory(item.category, language)}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {new Date(item.created_at).toLocaleDateString(isTa ? 'ta-IN' : 'en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-1">
                  {getLocalizedTitle(item.title, language)}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {getLocalizedDescription(item.description, language)}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{getLocalizedLocation(item.location, language)}</span>
                  <span className="font-bold text-slate-700">
                    {item.community_count} {isTa ? 'உறுதிப்படுத்தல்கள்' : 'confirmations'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => onNavigateToTab('feed')}
            className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                  {t.exploreCivicFeedBtn || 'Explore Live Civic Feed'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {t.feedSubtitle || 'See verified civic progress and community impact'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 transition-colors shrink-0" />
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. YOUR CIVICOS TWIN */}
      {/* ========================================================================= */}
      <section aria-labelledby="twin-heading">
        <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-slate-900 to-civic-950 text-white border border-slate-800 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-white/10 text-civic-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-civic-300" />
                <span id="twin-heading">{t.twinCardTitle || 'Your CivicOS Twin'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {t.twinCardDesc ||
                  'CivicOS remembers the information you choose to share so we can help you find relevant services and benefits.'}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <button
                onClick={() => onNavigateToTab('profile')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 active:bg-slate-200 font-bold text-xs sm:text-sm transition-all min-h-[48px] flex items-center justify-center space-x-1.5 focus:ring-2 focus:ring-white focus:outline-none"
              >
                <span>{t.twinViewBtn || 'View my Twin'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToTab('schemes')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700 transition-all min-h-[48px] flex items-center justify-center space-x-1.5 focus:ring-2 focus:ring-civic-400 focus:outline-none"
              >
                <span>{t.twinAskBtn || 'Ask CivicOS'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. HELP & ASSISTANCE */}
      {/* ========================================================================= */}
      <section aria-labelledby="help-heading">
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-100 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-civic-100 text-civic-800 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5 text-civic-700" />
              </div>
              <div className="space-y-1">
                <h3 id="help-heading" className="font-bold text-base text-slate-900">
                  {t.helpSectionTitle || 'Need help using CivicOS?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg leading-relaxed">
                  {t.helpSectionDesc ||
                    'Get simple guidance for finding services, reporting an issue, or checking your requests.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 self-start sm:self-center min-h-[44px] focus:ring-2 focus:ring-civic-700 focus:outline-none"
            >
              {t.getHelpBtn || 'Get Help'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. EMERGENCY HELPLINES */}
      {/* ========================================================================= */}
      <section aria-labelledby="emergency-heading" className="space-y-2.5">
        <div className="flex items-center space-x-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
          <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
          <span id="emergency-heading">{t.emergencyHelplinesTitle || 'Emergency Helplines'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center space-x-2.5">
            <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{t.waterSupplyDept || 'Water Supply'}</div>
              <div className="font-mono text-slate-600 font-semibold">1916</div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{t.electricityDept || 'Electricity'}</div>
              <div className="font-mono text-slate-600 font-semibold">1912</div>
            </div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center space-x-2.5">
            <Phone className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">{t.emergencyRedressal || 'Emergency'}</div>
              <div className="font-mono text-slate-600 font-semibold">112</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedService && (
        <ServiceGuideModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
      {conciergeResult && (
        <CivicConciergeModal
          result={conciergeResult}
          onClose={() => setConciergeResult(null)}
          onOpenServiceGuide={(service) => {
            setSelectedService(service);
            setConciergeResult(null);
          }}
          onOpenReportModal={() => {
            _onOpenReportModal();
            setConciergeResult(null);
          }}
          onNavigateToTab={(tab) => {
            onNavigateToTab(tab);
            setConciergeResult(null);
          }}
        />
      )}
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
    </div>
  );
};
