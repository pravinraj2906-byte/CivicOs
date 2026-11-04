import React, { useState } from 'react';
import { CitizenWithProfile } from '../../types/api';
import { apiService } from '../../services/api';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  CheckCircle2,
  Save,
  MapPin,
  Briefcase,
  Users,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
} from 'lucide-react';

interface CitizenTwinViewProps {
  citizenProfile: CitizenWithProfile | null;
  onProfileUpdated: (updated: CitizenWithProfile) => void;
  onNavigateToTab?: (tab: 'home' | 'feed' | 'grievances' | 'schemes' | 'profile') => void;
}

export const CitizenTwinView: React.FC<CitizenTwinViewProps> = ({
  citizenProfile,
  onProfileUpdated,
  onNavigateToTab,
}) => {
  const { t, language, user } = useAuth();
  const isTa = language === 'ta';
  const profile = citizenProfile?.profile;

  // Form states
  const [age, setAge] = useState<number | ''>(profile?.age || 32);
  const [gender, setGender] = useState<string>(profile?.gender || 'female');
  const [occupation, setOccupation] = useState<string>(profile?.occupation || 'Self-Employed / Boutique Owner');
  const [incomeRange, setIncomeRange] = useState<string>(profile?.income_range || '2.5L - 5L');
  const [residenceType, setResidenceType] = useState<string>(profile?.residence_type || 'urban');
  const [familyContext, setFamilyContext] = useState<string>(profile?.family_context || '4 members (2 adults, 2 children)');
  const [isBpl, setIsBpl] = useState<boolean>(profile?.is_bpl || false);
  const [hasDisability, setHasDisability] = useState<boolean>(profile?.has_disability || false);
  const [interests, setInterests] = useState<string>(profile?.interests || 'Solar Energy, Women Entrepreneurship, Higher Education');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate completeness score
  let completeness = 30; // base registered user
  if (age) completeness += 10;
  if (occupation) completeness += 15;
  if (incomeRange) completeness += 15;
  if (residenceType) completeness += 15;
  if (interests) completeness += 15;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const updatedProfile = await apiService.updateCitizenProfile({
        age: Number(age) || undefined,
        gender: gender || undefined,
        occupation: occupation.trim() || undefined,
        income_range: incomeRange.trim() || undefined,
        residence_type: residenceType as 'urban' | 'rural',
        family_context: familyContext.trim() || undefined,
        is_bpl: isBpl,
        has_disability: hasDisability,
        interests: interests.trim() || undefined,
      });

      if (citizenProfile) {
        onProfileUpdated({
          ...citizenProfile,
          profile: updatedProfile,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail ||
        err.message ||
        t.saveProfileError
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HEADER */}
      {/* ========================================================================= */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-extrabold mb-2">
          <User className="w-3.5 h-3.5 text-civic-700" />
          <span>{t.twinCardTitle || 'Your CivicOS Profile'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.profileTitle || 'Your CivicOS Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          {t.profileSubtitle || 'Your information helps CivicOS guide you to services and benefits you may qualify for.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPLETENESS & BENEFITS LINK CARD */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-br from-civic-800 via-civic-900 to-slate-900 text-white shadow-xl space-y-4 border border-civic-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 block">
              {t.completeProfilePrompt || 'Complete your profile'}
            </span>
            <span className="text-2xl font-black text-white">{completeness}% {t.percentComplete || 'Complete'}</span>
          </div>

          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab('schemes')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{t.viewMyBenefitsBtn || 'View My Benefits'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {t.completeProfileSub || 'Add a few details to help CivicOS show more relevant services and benefits tailored to your household.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIVACY-FIRST UX NOTICE */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-extrabold text-slate-900 text-sm">
            {t.twinPrivacyTitle || 'Your Information & Privacy'}
          </h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {t.twinPrivacyNotice ||
              'CivicOS uses the information you provide to help show relevant government services and benefits. Your details are never sold or shared with commercial entities.'}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center space-x-2 animate-fadeIn"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{t.profileUpdatedSuccess || 'Your profile has been saved successfully.'}</span>
        </div>
      )}

      {errorMessage && (
        <ErrorBanner
          title={isTa ? 'சுயவிவரத்தை சேமிக்க முடியவில்லை' : 'Could not save profile'}
          message={errorMessage}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. STRUCTURED PROFILE FORM */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: ABOUT YOU */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <User className="w-5 h-5 text-civic-700" />
            <h2 className="text-base font-extrabold text-slate-900">{t.twinSectionAbout || 'About You'}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name (Readonly) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.registeredName || 'Full Legal Name'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  disabled
                  value={citizenProfile?.name || user?.name || (isTa ? 'குடிமகன்' : 'Citizen')}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 cursor-not-allowed min-h-[48px]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.officialEmail || 'Registered Email'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  disabled
                  value={citizenProfile?.email || user?.email || ''}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 cursor-not-allowed min-h-[48px]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.ageYears || 'Your Age'}
              </label>
              <input
                type="number"
                min={18}
                max={110}
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 32"
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.gender || 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
              >
                <option value="female">{t.genderFemale || 'Female'}</option>
                <option value="male">{t.genderMale || 'Male'}</option>
                <option value="other">{t.genderOther || 'Other'}</option>
                <option value="prefer_not_to_say">{t.genderPreferNot || 'Prefer not to say'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: YOUR LOCATION */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-civic-700" />
            <h2 className="text-base font-extrabold text-slate-900">{t.twinSectionLocation || 'Your Location'}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.stateLabel || 'State'}
              </label>
              <input
                type="text"
                disabled
                value={citizenProfile?.state || user?.state || 'Karnataka'}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 cursor-not-allowed min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.districtLabel || 'District'}
              </label>
              <input
                type="text"
                disabled
                value={citizenProfile?.district || user?.district || 'Bengaluru Urban'}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 cursor-not-allowed min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.residenceType || 'Residence Area'}
              </label>
              <select
                value={residenceType}
                onChange={(e) => setResidenceType(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
              >
                <option value="urban">{t.residenceUrban || 'Urban / City'}</option>
                <option value="rural">{t.residenceRural || 'Rural / Village'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: EMPLOYMENT & INCOME */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-civic-700" />
            <h2 className="text-base font-extrabold text-slate-900">{t.twinSectionOccupation || 'Employment & Income'}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.primaryOccupation || 'Primary Occupation'}
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder={t.occupationPlaceholder || 'e.g. Small Business Owner, Farmer, Student'}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                {t.annualIncomeRange || 'Annual Household Income Range'}
              </label>
              <select
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
              >
                <option value="Below 1.5L">{t.incomeBelow15 || 'Below ₹1.5 Lakh'}</option>
                <option value="1.5L - 2.5L">{t.income15to25 || '₹1.5L – ₹2.5 Lakh'}</option>
                <option value="2.5L - 5L">{t.income25to50 || '₹2.5L – ₹5.0 Lakh'}</option>
                <option value="5L - 10L">{t.income50to10 || '₹5.0L – ₹10 Lakh'}</option>
                <option value="Above 10L">{t.incomeAbove10 || 'Above ₹10 Lakh'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: YOUR FAMILY & HOUSEHOLD */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Users className="w-5 h-5 text-civic-700" />
            <h2 className="text-base font-extrabold text-slate-900">{t.twinSectionFamily || 'Your Family & Household'}</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.familyContext || 'Family Context'}
            </label>
            <input
              type="text"
              value={familyContext}
              onChange={(e) => setFamilyContext(e.target.value)}
              placeholder={t.familyContextPlaceholder || 'e.g. 4 members (2 adults, 2 children)'}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
            />
          </div>

          {/* Special Status Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all min-h-[48px]">
              <input
                type="checkbox"
                checked={isBpl}
                onChange={(e) => setIsBpl(e.target.checked)}
                className="w-5 h-5 text-civic-700 rounded-md border-slate-300 focus:ring-civic-500"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {t.bplEligibilityCheck || 'Below Poverty Line (BPL / Priority Ration Card)'}
              </span>
            </label>

            <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all min-h-[48px]">
              <input
                type="checkbox"
                checked={hasDisability}
                onChange={(e) => setHasDisability(e.target.checked)}
                className="w-5 h-5 text-civic-700 rounded-md border-slate-300 focus:ring-civic-500"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {t.pwdCheck || 'Person with Disability (PwD)'}
              </span>
            </label>
          </div>
        </div>

        {/* SECTION 5: INTERESTS & CIVIC NEEDS */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-civic-700" />
            <h2 className="text-base font-extrabold text-slate-900">{t.twinSectionNeeds || 'Your Interests & Civic Needs'}</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {t.civicInterests || 'Civic Interests & Welfare Goals'}
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder={t.civicInterestsPlaceholder || 'e.g. Solar Energy, Women Entrepreneurship, Higher Education'}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
            />
            <p className="text-xs text-slate-500 font-medium mt-1.5">
              {t.twinMissingFieldHint || 'Add this information to get more relevant suggestions.'}
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-black text-sm sm:text-base shadow-lg transition-all disabled:opacity-60 flex items-center justify-center space-x-2 min-h-[56px] focus:ring-2 focus:ring-civic-600 focus:outline-none"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t.savingTwin || 'Saving Profile...'}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t.saveProfileBtn || 'Save Profile Information'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
