import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchemeEligibilityCheckRequest, SchemeEligibilityMatchItem, Scheme } from '../../types/api';
import { apiService } from '../../services/api';
import { getLocalizedCategory } from '../../i18n/formatters';
import {
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

interface EligibilityCheckModalProps {
  onClose: () => void;
  onSelectScheme: (scheme: Scheme, whyYouQualify?: string) => void;
  allSchemes: Scheme[];
}

export const EligibilityCheckModal: React.FC<EligibilityCheckModalProps> = ({
  onClose,
  onSelectScheme,
  allSchemes,
}) => {
  const { user, t, language } = useAuth();

  const [age, setAge] = useState<number>(user ? 30 : 25);
  const [gender, setGender] = useState<string>('all');
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [isFarmer, setIsFarmer] = useState<boolean>(false);
  const [isBpl, setIsBpl] = useState<boolean>(false);
  const [isSenior, setIsSenior] = useState<boolean>(false);
  const [occupation, setOccupation] = useState<string>(language === 'ta' ? 'சுயதொழில் / குடிமக்கள்' : 'Self-Employed / Citizen');
  const [incomeRange, setIncomeRange] = useState<string>('2.5L - 5L');
  const [residenceType, setResidenceType] = useState<'urban' | 'rural'>('urban');
  const [stateName, setStateName] = useState<string>('Karnataka');

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResults, setEvaluationResults] = useState<SchemeEligibilityMatchItem[] | null>(null);
  const [contextSummary, setContextSummary] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setErrorMessage(null);
    try {
      const payload: SchemeEligibilityCheckRequest = {
        age: Number(age),
        gender: gender !== 'all' ? gender : undefined,
        is_student: isStudent,
        is_farmer: isFarmer,
        is_bpl: isBpl,
        senior_citizen: isSenior || age >= 60,
        occupation: occupation.trim() || undefined,
        income_range: incomeRange,
        residence_type: residenceType,
        state: stateName,
        language,
      };

      const res = await apiService.checkSchemeEligibility(payload);
      setEvaluationResults(res.matches || []);
      setContextSummary(res.citizen_context_summary || '');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail ||
        err.message ||
        (language === 'ta'
          ? 'தகுதியை கணக்கிட முடியவில்லை. உங்கள் இணைப்பை சரிபார்க்கவும்.'
          : 'Unable to evaluate eligibility. Please check your connection.')
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleOpenMatchedScheme = (match: SchemeEligibilityMatchItem) => {
    const full = allSchemes.find((s) => s.id === match.scheme_id || s.code === match.scheme_code);
    if (full) {
      onSelectScheme(full, match.why_you_qualify);
    } else {
      // Build a fallback scheme object
      const fallbackScheme: Scheme = {
        id: match.scheme_id,
        code: match.scheme_code,
        name: match.scheme_name,
        description: match.why_you_qualify,
        state: 'All-India',
        category: match.category,
        benefits: match.benefits_summary,
        required_documents: match.required_documents.join(', '),
        official_portal: match.official_portal,
        application_steps: match.application_steps,
        source_name: match.source_name,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      onSelectScheme(fallbackScheme, match.why_you_qualify);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-elevated overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-civic-600 flex items-center justify-center text-white font-black shadow-touch">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                {t.eligibilityWizardTitle}
              </h3>
              <p className="text-xs text-slate-300">
                {t.eligibilityWizardSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t.close}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Step 1: Profile Questionnaire Form */}
          {!evaluationResults && (
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.ageLabel} *
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="100"
                    value={age}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setAge(val);
                      if (val >= 60) setIsSenior(true);
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-civic-600 min-h-[44px]"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.genderLabel}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-civic-600 min-h-[44px]"
                  >
                    <option value="all">{language === 'ta' ? 'அனைத்தும் / குறிப்பிட விரும்பவில்லை' : 'All / Prefer not to say'}</option>
                    <option value="female">{t.female}</option>
                    <option value="male">{t.male}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.occupationLabel}
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder={language === 'ta' ? 'எ.கா: மாணவர், விவசாயி, சிறு வணிகர், ஆசிரியர்' : 'e.g. Student, Farmer, Small Business, Teacher'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-civic-600 min-h-[44px]"
                  />
                </div>

                {/* Income Bracket */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.incomeRangeLabel}
                  </label>
                  <select
                    value={incomeRange}
                    onChange={(e) => setIncomeRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-civic-600 min-h-[44px]"
                  >
                    <option value="< 2.5L">{t.incomeBelow15 || 'Under ₹2.5 Lakhs / year'}</option>
                    <option value="2.5L - 5L">{t.income25to50 || '₹2.5 Lakhs - ₹5 Lakhs / year'}</option>
                    <option value="5L - 8L">{t.income50to10 || '₹5 Lakhs - ₹8 Lakhs / year'}</option>
                    <option value="> 8L">{t.incomeAbove10 || 'Above ₹8 Lakhs / year'}</option>
                  </select>
                </div>

                {/* Residence Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.residenceLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setResidenceType('urban')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
                        residenceType === 'urban'
                          ? 'bg-civic-50 border-civic-600 text-civic-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {t.urban}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResidenceType('rural')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
                        residenceType === 'rural'
                          ? 'bg-civic-50 border-civic-600 text-civic-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {t.rural}
                    </button>
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ta' ? 'மாநிலம் / அதிகார வரம்பு' : 'State / Jurisdiction'}
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-civic-600 min-h-[44px]"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="All-India">All-India</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Attributes */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="w-4 h-4 text-civic-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-900">{t.isStudentLabel}</span>
                </label>

                <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFarmer}
                    onChange={(e) => setIsFarmer(e.target.checked)}
                    className="w-4 h-4 text-civic-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-900">{t.isFarmerLabel}</span>
                </label>

                <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isBpl}
                    onChange={(e) => setIsBpl(e.target.checked)}
                    className="w-4 h-4 text-civic-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-900">{t.isBplLabel}</span>
                </label>

                <label className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isSenior || age >= 60}
                    onChange={(e) => setIsSenior(e.target.checked)}
                    className="w-4 h-4 text-civic-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-900">{t.isSeniorLabel}</span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Submit Evaluation */}
              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full py-3.5 px-6 rounded-2xl bg-civic-600 hover:bg-civic-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm transition-all shadow-touch flex items-center justify-center space-x-2 min-h-[48px]"
              >
                {isEvaluating ? (
                  <span>{t.evaluating}</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.evaluateBtn}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Evaluation Results Feed */}
          {isEvaluating && (
            <LoadingState message={t.evaluating} />
          )}

          {evaluationResults && !isEvaluating && (
            <div className="space-y-4 animate-fadeIn">
              {/* Context bar */}
              <div className="p-3.5 bg-civic-50 rounded-2xl border border-civic-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-civic-700" />
                  <span className="font-bold text-civic-900">{contextSummary}</span>
                </div>
                <button
                  onClick={() => setEvaluationResults(null)}
                  className="text-civic-700 hover:text-civic-900 font-bold underline"
                >
                  {t.editCriteriaBtn}
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {t.foundMatchesCount}: ({evaluationResults.length})
                </h4>

                {evaluationResults.map((match) => {
                  const confPct = Math.round(match.confidence * 100);
                  const isLikely = match.eligibility_status === 'LIKELY_ELIGIBLE';
                  const displayCategory = getLocalizedCategory(match.category, language);

                  return (
                    <div
                      key={match.scheme_id}
                      onClick={() => handleOpenMatchedScheme(match)}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-civic-400 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                              isLikely
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-50 text-blue-800 border border-blue-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{import.meta.env.VITE_DEMO_MODE === 'true' ? 'Official verification required' : `${isLikely ? t.likelyEligible : t.possiblyEligible} (${confPct}%)`}</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {displayCategory}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">{match.scheme_code}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-civic-700 transition-colors">
                          {match.scheme_name}
                        </h4>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong>{t.whyYouMayQualify}</strong> {match.why_you_qualify}
                        </p>
                      </div>

                      {match.benefits_summary && (
                        <div className="text-xs text-emerald-950 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 font-medium">
                          <strong>{t.benefits}:</strong> {match.benefits_summary}
                        </div>
                      )}

                      <div className="pt-1 flex justify-end">
                        <span className="text-xs font-bold text-civic-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                          <span>{t.viewDetailsAndApply}</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all min-h-[44px]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
