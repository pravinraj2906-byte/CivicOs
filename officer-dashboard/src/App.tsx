import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading, t } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-civic-600 flex items-center justify-center shadow-touch border border-civic-500/30 animate-pulse text-white">
          <Shield className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{t.verifyingSessionTitle}</h2>
          <p className="text-xs text-slate-500 font-medium">{t.verifyingSessionDesc}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => {}} />;
  }

  return <Dashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
