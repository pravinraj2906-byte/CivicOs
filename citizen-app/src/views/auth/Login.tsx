import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, UserCheck, Sprout, Briefcase } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login, t, language } = useAuth();
  const [email, setEmail] = useState<string>('citizen.priya@example.com');
  const [password, setPassword] = useState<string>('demo123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail ||
        err.message ||
        t.authLoginError
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/assets/civicos/logo/civicos-logo.png"
              alt="CivicOS"
              className="w-auto max-w-[220px] sm:max-w-[280px] h-auto object-contain select-none"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              CivicOS {language === 'ta' ? 'குடிமக்கள் தளம்' : 'Citizen Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-medium leading-relaxed">
              {t.facingCivicProblemDesc}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">{t.signInTitle}</h2>
            <p className="text-xs text-slate-500 font-medium">{t.signInSubtitle}</p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs font-semibold flex items-start space-x-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-civic-600 transition-all min-h-[48px]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-civic-600 transition-all min-h-[48px]"
                />
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
                  <span>{t.connecting}</span>
                </>
              ) : (
                <>
                  <span>{t.signInBtn}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switchers */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
              {t.demoPersonasTitle}
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('citizen.priya@example.com', 'demo123')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left flex items-center justify-between text-xs transition-all group min-h-[48px]"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-blue-900 text-sm">
                      {t.priyaDemoTitle}
                    </div>
                    <div className="text-xs text-slate-500">{t.priyaDemoSubtitle}</div>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('citizen.ramesh@example.com', 'demo123')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-left flex items-center justify-between text-xs transition-all group min-h-[48px]"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-900 text-sm">
                      {t.rameshDemoTitle}
                    </div>
                    <div className="text-xs text-slate-500">{t.rameshDemoSubtitle}</div>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            </div>
          </div>

          {/* Switch to Register */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs font-bold text-civic-700 hover:text-civic-900 transition-colors p-2"
            >
              {t.newCitizenRegister}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
