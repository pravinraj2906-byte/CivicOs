import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './views/auth/Login';
import { Register } from './views/auth/Register';
import { Header } from './components/common/Header';
import { BottomNav, TabType } from './components/common/BottomNav';
import { HomeView } from './views/home/HomeView';
import { MyGrievancesView } from './views/grievances/MyGrievancesView';
import { GrievanceDetailView } from './views/grievances/GrievanceDetailView';
import { SubmitGrievanceModal } from './views/grievances/SubmitGrievanceModal';
import { CivicFeedView } from './views/feed/CivicFeedView';
import { SchemesView } from './views/schemes/SchemesView';
import { CitizenTwinView } from './views/profile/CitizenTwinView';
import { LoadingState } from './components/common/LoadingState';
import {
  Grievance,
  GrievanceDetail,
  CitizenWithProfile,
  SchemeRecommendationItem,
} from './types/api';
import { apiService } from './services/api';

const CitizenPortalMain: React.FC = () => {
  const { user, isLoading: authLoading, fontSizeMode, language } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Navigation & Screen States
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // App Data States
  const [citizenProfile, setCitizenProfile] = useState<CitizenWithProfile | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [topScheme, setTopScheme] = useState<SchemeRecommendationItem | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsDataLoading(true);
    try {
      const [profileRes, grievancesRes, recsRes] = await Promise.allSettled([
        apiService.getCitizenDetails(),
        apiService.getMyGrievances(),
        apiService.getSchemeRecommendations(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setCitizenProfile(profileRes.value);
      }
      if (grievancesRes.status === 'fulfilled') {
        setGrievances(grievancesRes.value || []);
      }
      if (recsRes.status === 'fulfilled') {
        const recs = recsRes.value.recommendations || [];
        setTopScheme(recs.length > 0 ? recs[0] : null);
      }
    } catch {
      // Handled gracefully in sub-views
    } finally {
      setIsDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState
          message={
            language === 'ta'
              ? 'குடிமக்கள் அமர்வு சரிபார்க்கப்படுகிறது...'
              : 'Verifying secure citizen session...'
          }
        />
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  const handleGrievanceCreated = (newGrievance: GrievanceDetail) => {
    setGrievances((prev) => [newGrievance, ...prev]);
  };

  const handleTrackGrievance = (grievance: GrievanceDetail) => {
    setSelectedGrievance(grievance);
    setActiveTab('grievances');
  };

  const activeGrievanceCount = grievances.filter(
    (g) => g.status === 'SUBMITTED' || g.status === 'TRIAGED' || g.status === 'IN_PROGRESS'
  ).length;

  const fontSizeClass =
    fontSizeMode === 'large'
      ? 'font-size-large'
      : fontSizeMode === 'xl'
      ? 'font-size-xl'
      : 'font-size-normal';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col ${fontSizeClass}`}>
      {/* Header */}
      <Header />

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24">
        {activeTab === 'home' && (
          <HomeView
            citizenProfile={citizenProfile}
            grievances={grievances}
            topScheme={topScheme}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateToTab={(tab) => {
              setSelectedGrievance(null);
              setActiveTab(tab);
            }}
            onSelectGrievance={(g) => {
              setSelectedGrievance(g);
              setActiveTab('grievances');
            }}
          />
        )}

        {activeTab === 'feed' && (
          <CivicFeedView
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'grievances' && (
          selectedGrievance ? (
            <GrievanceDetailView
              grievanceSummary={selectedGrievance}
              onBack={() => setSelectedGrievance(null)}
            />
          ) : (
            <MyGrievancesView
              grievances={grievances}
              isLoading={isDataLoading}
              onRefresh={loadData}
              onSelectGrievance={(g) => setSelectedGrievance(g)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )
        )}

        {activeTab === 'schemes' && <SchemesView onNavigateToTab={setActiveTab} />}

        {activeTab === 'profile' && (
          <CitizenTwinView
            citizenProfile={citizenProfile}
            onProfileUpdated={(updated) => setCitizenProfile(updated)}
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>


      {/* Report Modal */}
      {isReportModalOpen && (
        <SubmitGrievanceModal
          onClose={() => setIsReportModalOpen(false)}
          onGrievanceCreated={handleGrievanceCreated}
          onTrackGrievance={handleTrackGrievance}
        />
      )}

      {/* Fixed Bottom Navigation with Central + Action */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedGrievance(null);
          setActiveTab(tab);
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        activeGrievanceCount={activeGrievanceCount}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CitizenPortalMain />
    </AuthProvider>
  );
};

export default App;
