import React, { useState } from 'react';
import { GrievanceDetail, GrievanceCreatePayload } from '../../types/api';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PriorityBadge } from '../../components/design-system/PriorityBadge';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  MapPin,
  Building,
  Clock,
  Droplets,
  Wrench,
  Zap,
  Trash2,
  HeartPulse,
  Home as HomeIcon,
  Sparkles,
  Edit3,
  Copy,
  Check,
} from 'lucide-react';
import {
  getLocalizedDepartment,
  getLocalizedCategory,
} from '../../i18n/formatters';

interface SubmitGrievanceModalProps {
  onClose: () => void;
  onGrievanceCreated: (newGrievance: GrievanceDetail) => void;
  onTrackGrievance: (grievance: GrievanceDetail) => void;
}

export const SubmitGrievanceModal: React.FC<SubmitGrievanceModalProps> = ({
  onClose,
  onGrievanceCreated,
  onTrackGrievance,
}) => {
  const { t, language, user } = useAuth();
  const isTa = language === 'ta';

  // 4-Step Wizard: 1 = What happened, 2 = Where & Photo, 3 = Review, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water & Sanitation');
  const [areaStreet, setAreaStreet] = useState(
    isTa ? '12வது மெயின் ரோடு, இந்திரா நகர்' : '12th Main Road, Indiranagar'
  );
  const [cityDistrict, setCityDistrict] = useState(user?.district || 'Bengaluru Urban');
  const [landmark, setLandmark] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<GrievanceDetail | null>(null);
  const [hasCopiedRef, setHasCopiedRef] = useState(false);

  // Common Problem Suggestions
  const commonSuggestions = isTa
    ? [
        'தெருவில் குடிநீர் குழாய் உடைந்து நீர் கசிகிறது',
        'குப்பைகள் பல நாட்களாக அகற்றப்படவில்லை',
        'சாலையில் பெரிய ஆபத்தான குழி உள்ளது',
        'தெருவிளக்கு எரியவில்லை',
        'சாக்கடை கழிவுநீர் நிரம்பி வழிகிறது',
      ]
    : [
        'Water is leaking near my street',
        'Garbage has not been collected',
        'There is a large pothole',
        'Streetlight is not working',
        'Drainage is overflowing',
      ];

  // Category Options
  const categoryOptions = [
    {
      id: 'Water & Sanitation',
      label: t.categoryWater || 'Water & Sanitation',
      icon: <Droplets className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'Roads & Infrastructure',
      label: t.categoryRoads || 'Roads & Public Works',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'Electricity & Energy',
      label: t.categoryElectricity || 'Electricity',
      icon: <Zap className="w-5 h-5 text-yellow-600" />,
      bg: 'bg-yellow-50 border-yellow-200',
    },
    {
      id: 'Public Health',
      label: t.categoryWaste || 'Waste Management',
      icon: <Trash2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'Healthcare',
      label: t.categoryHealth || 'Health',
      icon: <HeartPulse className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200',
    },
    {
      id: 'General',
      label: t.categoryOther || 'Other',
      icon: <HomeIcon className="w-5 h-5 text-slate-600" />,
      bg: 'bg-slate-50 border-slate-200',
    },
  ];

  // Handle Photo Upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoName(null);
  };

  // Step 1 Validation
  const handleStep1Continue = () => {
    if (!description.trim()) {
      setErrorMessage(
        isTa
          ? 'தயவுசெய்து உங்கள் பிரச்சினையை விவரிக்கவும்.'
          : 'Please describe the problem before continuing.'
      );
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  // Step 2 Validation
  const handleStep2Continue = () => {
    if (!areaStreet.trim()) {
      setErrorMessage(
        isTa
          ? 'தயவுசெய்து பகுதி அல்லது தெருவின் பெயரை உள்ளிடவும்.'
          : 'Please enter the area or street name.'
      );
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  // Step 3 Submission
  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // Derive a clean, human title from description or category
    const cleanTitle = description.trim().split('.')[0].slice(0, 80) || category;
    const fullLocation = `${areaStreet.trim()}, ${cityDistrict.trim()}`;

    try {
      const payload: GrievanceCreatePayload = {
        title: cleanTitle,
        description: description.trim(),
        location: fullLocation,
        landmark: landmark.trim() || undefined,
        category: category || 'General',
      };

      const created = await apiService.submitGrievance(payload);
      setTriageResult(created);
      onGrievanceCreated(created);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(
        t.friendlySubmissionError ||
          'Something went wrong while submitting your report. Your information has not been lost. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy tracking ID
  const copyTrackingId = () => {
    if (triageResult?.tracking_id) {
      navigator.clipboard.writeText(triageResult.tracking_id);
      setHasCopiedRef(true);
      setTimeout(() => setHasCopiedRef(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <h2 id="report-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {step === 4
                ? (t.reportSubmittedSuccessTitle || 'Your report has been submitted')
                : (t.reportIssueTitle || 'Report an Issue')}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {step === 4
                ? (t.reportSubmittedSuccessDesc || 'We have sent it to the appropriate department.')
                : (t.reportIssueSubtitle || 'Tell us what is happening. We will help send it to the right department.')}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:ring-2 focus:ring-civic-700 focus:outline-none"
            aria-label={t.close || 'Close'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SIMPLE PROGRESS STEP INDICATOR (Steps 1 to 3) */}
        {/* ========================================================================= */}
        {step < 4 && (
          <div className="px-5 sm:px-7 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100 shrink-0">
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <div
                className={`pb-2 border-b-3 transition-colors ${
                  step === 1 ? 'border-civic-700 text-civic-900' : 'border-slate-200 text-slate-500'
                }`}
              >
                {t.stepWhatHappened || '1. What happened'}
              </div>
              <div
                className={`pb-2 border-b-3 transition-colors ${
                  step === 2 ? 'border-civic-700 text-civic-900' : 'border-slate-200 text-slate-500'
                }`}
              >
                {t.stepWhere || '2. Where'}
              </div>
              <div
                className={`pb-2 border-b-3 transition-colors ${
                  step === 3 ? 'border-civic-700 text-civic-900' : 'border-slate-200 text-slate-500'
                }`}
              >
                {t.stepReview || '3. Review'}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL BODY (SCROLLABLE) */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-slate-800">
          {/* Friendly Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-semibold flex items-start space-x-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: WHAT HAPPENED? */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              {/* Description Field */}
              <div className="space-y-2">
                <label className="block text-sm font-extrabold text-slate-900">
                  {t.whatHappenedLabel || 'What happened?'} <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    t.whatHappenedPlaceholder ||
                    'Describe the problem in your own words (e.g., Water is leaking near the junction since morning)...'
                  }
                  className="w-full p-4 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all resize-none shadow-xs"
                />
              </div>

              {/* Common Suggestions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  {isTa ? 'எடுத்துக்காட்டு பிரச்சினைகள் (கிளிக் செய்க):' : 'Common issues (click to insert):'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {commonSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setDescription((prev) =>
                          prev ? `${prev}. ${suggestion}` : suggestion
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-civic-50 hover:text-civic-900 border border-slate-200 text-xs font-semibold text-slate-700 text-left transition-all min-h-[38px]"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Category Help */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t.whatIsThisAbout || 'What is this about? (Optional)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categoryOptions.map((opt) => {
                    const isSelected = category === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategory(opt.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all flex items-center space-x-2.5 text-left min-h-[56px] ${
                          isSelected
                            ? 'bg-civic-50/80 border-civic-700 text-civic-900 font-bold shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt.icon}
                        <span className="text-xs font-bold leading-tight truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: WHERE DID IT HAPPEN? & OPTIONAL PHOTO */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {t.whereHappenedTitle || 'Where did this happen?'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.whereHappenedSubtitle || 'Provide location details so field inspectors can locate the issue.'}
                </p>
              </div>

              {/* Area / Street */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.areaStreetLabel || 'Area / Street'} <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={areaStreet}
                    onChange={(e) => setAreaStreet(e.target.value)}
                    placeholder={t.areaStreetPlaceholder || 'e.g., 12th Main Road, Indiranagar'}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              {/* City / District */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.cityDistrictLabel || 'City / District'}
                </label>
                <input
                  type="text"
                  value={cityDistrict}
                  onChange={(e) => setCityDistrict(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
                />
              </div>

              {/* Landmark */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {t.landmarkOptionalLabel || 'Nearby landmark (optional)'}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={t.landmarkOptionalPlaceholder || 'e.g., Near Bus Stand, Opposite Temple'}
                  className="w-full px-4 py-3.5 bg-white border-2 border-slate-300 focus:border-civic-700 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none min-h-[48px]"
                />
              </div>

              {/* Photo Upload Section (Optional) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900">
                    {t.addPhotoOptionalTitle || 'Add a photo (optional)'}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.addPhotoOptionalDesc || 'A photo can help the department understand the problem.'}
                  </p>
                </div>

                {photoPreview ? (
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white border border-slate-200">
                    <img
                      src={photoPreview}
                      alt="Attached issue"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1 truncate flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">{photoName || 'photo.jpg'}</div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 p-0.5"
                      >
                        {t.removePhotoBtn || 'Remove Photo'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-dashed border-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[48px] focus-within:ring-2 focus-within:ring-civic-700">
                    <Camera className="w-5 h-5 text-civic-700" />
                    <span>{t.addPhotoBtn || 'Add Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: REVIEW BEFORE SUBMISSION */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  {t.checkYourReportTitle || 'Check your report'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t.checkYourReportDesc || 'Please review your information before submitting.'}
                </p>
              </div>

              {/* Summary Card: What Happened */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t.whatHappenedLabel || 'What happened?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-civic-700 hover:text-civic-900"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.editSectionBtn || 'Edit'}</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  "{description}"
                </p>
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-civic-100 text-civic-800 font-bold text-xs">
                    {getLocalizedCategory(category, language)}
                  </span>
                </div>
              </div>

              {/* Summary Card: Location */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t.whereHappenedTitle || 'Location'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-civic-700 hover:text-civic-900"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.editSectionBtn || 'Edit'}</span>
                  </button>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {areaStreet}, {cityDistrict}
                </div>
                {landmark && (
                  <div className="text-xs text-slate-600 font-medium">
                    {t.landmarkOptionalLabel || 'Landmark'}: {landmark}
                  </div>
                )}
                {photoPreview && (
                  <div className="pt-2 flex items-center space-x-2 text-xs font-bold text-slate-700">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>1 photo attached</span>
                  </div>
                )}
              </div>

              {/* Department Notice */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 font-medium flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>
                  {isTa
                    ? 'உங்கள் புகார் பெறப்பட்டவுடன், அது சம்பந்தப்பட்ட அரசு துறைக்கு நேரடியாக அனுப்பப்படும்.'
                    : (import.meta.env.VITE_DEMO_MODE === 'true' ? 'This creates a synthetic browser-local report with illustrative routing. No government submission is made.' : 'When you submit, your report is classified for department review.')}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SUCCESS / SUBMITTED SCREEN */}
          {/* ========================================================================= */}
          {step === 4 && triageResult && (
            <div className="space-y-6 animate-fadeIn text-center">
              {/* Success Emblem */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-1 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {t.reportSubmittedSuccessTitle || 'Your report has been submitted'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  {t.reportSubmittedSuccessDesc || 'We have sent it to the appropriate department.'}
                </p>
              </div>

              {/* Prominent Reference Number Card */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white max-w-md mx-auto space-y-2.5 shadow-lg border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.referenceNumberLabel || 'Reference Number'}
                </span>
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-wider text-amber-400">
                    {triageResult.tracking_id}
                  </span>
                  <button
                    type="button"
                    onClick={copyTrackingId}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy reference number"
                    aria-label="Copy reference number"
                  >
                    {hasCopiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {t.saveNumberNotice || 'Save this number to check your status later.'}
                </p>
              </div>

              {/* Natural Department Routing & Priority Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.assignedDeptLabel || 'Sent to'}</span>
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-civic-800 truncate">
                    {getLocalizedDepartment(triageResult.department, language)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.assessedPriorityLabel || 'Priority'}</span>
                  </span>
                  <PriorityBadge priority={triageResult.priority} size="sm" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER ACTIONS */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          {step === 1 && (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm min-h-[48px] transition-all"
              >
                {t.close || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleStep1Continue}
                className="px-6 py-3.5 rounded-xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-black text-xs sm:text-sm min-h-[52px] shadow-md transition-all flex items-center space-x-2 focus:ring-2 focus:ring-civic-600 focus:outline-none"
              >
                <span>{t.continueBtn || 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm min-h-[48px] transition-all flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backBtn || 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleStep2Continue}
                className="px-6 py-3.5 rounded-xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-black text-xs sm:text-sm min-h-[52px] shadow-md transition-all flex items-center space-x-2 focus:ring-2 focus:ring-civic-600 focus:outline-none"
              >
                <span>{t.continueBtn || 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm min-h-[48px] transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backBtn || 'Back'}</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitReport}
                className="px-7 py-3.5 rounded-xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-black text-xs sm:text-sm min-h-[56px] shadow-lg transition-all flex items-center space-x-2 disabled:opacity-60 focus:ring-2 focus:ring-civic-600 focus:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.submittingReportStatus || 'Submitting your report...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submitReportBtn || 'Submit Report'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 4 && triageResult && (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm min-h-[48px] transition-all"
              >
                {t.doneBtn || 'Done'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onTrackGrievance(triageResult);
                  onClose();
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-civic-800 hover:bg-civic-900 active:bg-civic-950 text-white font-black text-xs sm:text-sm min-h-[52px] shadow-md transition-all flex items-center justify-center space-x-2 focus:ring-2 focus:ring-civic-600 focus:outline-none"
              >
                <span>{t.trackMyReportBtn || 'Track My Report'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
