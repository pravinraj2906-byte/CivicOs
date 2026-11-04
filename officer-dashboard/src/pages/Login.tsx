import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Droplets,
  Wrench,
  UserX,
  Sparkles,
  Zap,
  Building,
  Eye,
  EyeOff,
  HelpCircle,
  Phone,
  X,
  CheckCircle2,
} from 'lucide-react';
import { CivicLogo } from '../components/design-system/CivicLogo';
import { LanguageSelector } from '../components/LanguageSelector';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login, t } = useAuth();
  const [email, setEmail] = useState<string>('officer.rajesh@civicos.gov');
  const [password, setPassword] = useState<string>('demo123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        t.loginFailedError;
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  const benefitCards = [
    {
      title: t.benefit1Title,
      desc: t.benefit1Desc,
      icon: <ShieldCheck className="w-5 h-5 text-blue-700" />,
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      title: t.benefit2Title,
      desc: t.benefit2Desc,
      icon: <Sparkles className="w-5 h-5 text-indigo-700" />,
      bg: 'bg-indigo-50 border-indigo-200',
    },
    {
      title: t.benefit3Title,
      desc: t.benefit3Desc,
      icon: <Zap className="w-5 h-5 text-amber-700" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: t.benefit4Title,
      desc: t.benefit4Desc,
      icon: <Building className="w-5 h-5 text-emerald-700" />,
      bg: 'bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-civic-100 selection:text-civic-900 animate-fadeIn">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Official CivicOS Logo */}
          <CivicLogo
            portalTag={t.officerPortalBadge}
            subtitle={t.portalSubtitle}
          />

          {/* Controls: Language Selector Dropdown + Need Help */}
          <div className="flex items-center space-x-2">
            <LanguageSelector />

            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all min-h-[44px]"
              aria-label={t.needHelpDesc}
            >
              <HelpCircle className="w-4 h-4 text-civic-600" />
              <span>{t.needHelp}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Body Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT / INTRODUCTION AREA (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            {/* Mission Statement */}
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-civic-50 text-civic-800 border border-civic-200 text-xs font-extrabold">
                <ShieldCheck className="w-4 h-4 text-civic-600" />
                <span>{t.gatewayBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {t.welcomeHeadline} <br />
                <span className="text-civic-600">{t.welcomeSubheadline}</span>
              </h1>

              <div className="text-base sm:text-lg font-bold text-slate-800">
                {t.welcomeTagline}
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                {t.welcomeDesc}
              </p>
            </div>

            {/* 4 Benefit Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {benefitCards.map((card, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${card.bg} space-y-1.5 shadow-xs`}
                >
                  <div className="flex items-center space-x-2">
                    {card.icon}
                    <h3 className="font-bold text-sm text-slate-900">{card.title}</h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Motivation Quote */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium flex items-center space-x-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{t.motivationQuote}</span>
            </div>
          </div>

          {/* RIGHT / LOGIN CARD (lg:col-span-5) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto order-1 lg:order-2">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-5 animate-fadeIn">
              {/* Card Header with Centered CivicOS Logo */}
              <div className="flex flex-col items-center text-center space-y-2.5 pb-4 border-b border-slate-100">
                <img
                  src="/assets/civicos/logo/civicos-logo.png"
                  alt="CivicOS"
                  className="h-10 sm:h-11 w-auto object-contain select-none"
                />
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-[#F0F5FA] text-[#123B6D] border border-[#C3D5E9] text-[10px] font-bold uppercase tracking-wider">
                  <Lock className="w-3 h-3 text-[#123B6D]" />
                  <span>{t.officerPortalBadge}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.loginTitle}</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t.loginSubtitle}
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs font-semibold flex items-start space-x-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Official Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t.officialEmailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.name@civicos.gov"
                      className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-civic-600 transition-all min-h-[48px]"
                    />
                  </div>
                </div>

                {/* Password with Show/Hide Toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full pl-10 pr-11 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-civic-600 transition-all min-h-[48px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-civic-600 hover:bg-civic-700 active:bg-civic-800 text-white font-extrabold text-base shadow-touch transition-all disabled:opacity-60 flex items-center justify-center space-x-2 min-h-[52px] touch-active"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t.authenticating}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.signInBtn}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Tap Quick-Fill Demo Personas */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
                  {t.demoPersonasTitle}
                </span>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('officer.rajesh@civicos.gov', 'demo123')}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left flex items-center justify-between text-xs transition-all group min-h-[48px]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-900 text-sm">
                          {t.demoRajeshTitle}
                        </div>
                        <div className="text-xs text-slate-500">{t.demoRajeshSubtitle}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      demo123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('officer.anita@civicos.gov', 'demo123')}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/80 border border-slate-200 hover:border-orange-300 text-left flex items-center justify-between text-xs transition-all group min-h-[48px]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-orange-100 text-orange-800">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-orange-900 text-sm">
                          {t.demoAnitaTitle}
                        </div>
                        <div className="text-xs text-slate-500">{t.demoAnitaSubtitle}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      demo123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('citizen.priya@example.com', 'demo123')}
                    className="w-full p-2.5 rounded-xl bg-slate-50/60 hover:bg-rose-50/70 border border-slate-200 hover:border-rose-300 text-left flex items-center justify-between text-xs transition-all group min-h-[44px]"
                  >
                    <div className="flex items-center space-x-2">
                      <UserX className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                      <span className="text-slate-600 group-hover:text-rose-900 font-medium">
                        {t.demoPriyaTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {t.demoPriyaBadge}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Support Notice */}
              <div className="pt-2 text-center text-xs text-slate-500 leading-relaxed">
                {t.newOfficerSupportNotice}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">{t.portalTitle} {t.officerPortalBadge}</span>
            <span>•</span>
            <span>{t.footerCopyright}</span>
          </div>

          <div className="flex items-center space-x-4 font-semibold text-slate-700">
            <button
              onClick={() => setShowHelpModal(true)}
              className="hover:text-civic-700 transition-colors"
            >
              {t.supportHelpdesk}
            </button>
            <span>•</span>
            <span>{t.privacyPolicy}</span>
            <span>•</span>
            <span>{t.termsOfService}</span>
          </div>
        </div>
      </footer>

      {/* 4. Help / Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-elevated overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-civic-500 flex items-center justify-center text-white font-bold">
                  ?
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight text-white">{t.helpModalTitle}</h3>
                  <p className="text-xs text-slate-300">{t.helpModalSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t.closeBtn}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-800 text-sm leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                <h4 className="font-bold text-blue-900 text-sm">{t.helpSection1Title}</h4>
                <p className="text-xs text-blue-800">
                  {t.helpSection1Desc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{t.helpSection2Title}</h4>
                <p className="text-xs text-slate-700">
                  {t.helpSection2Desc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-civic-50 border border-civic-200 flex items-center space-x-3">
                <Phone className="w-5 h-5 text-civic-700 shrink-0" />
                <div className="text-xs text-civic-900">
                  {t.helpHelplineText}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-6 py-2.5 rounded-xl bg-civic-600 hover:bg-civic-700 text-white font-bold text-xs transition-all min-h-[44px]"
              >
                {t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
