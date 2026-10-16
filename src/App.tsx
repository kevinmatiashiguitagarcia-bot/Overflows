/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { BannerAlert } from './components/BannerAlert';
import { DashboardView } from './components/DashboardView';
import { LiveRiskMapView } from './components/LiveRiskMapView';
import { AuthView } from './components/AuthView';
import { Logo } from './components/Logo';
import { CuencaDetailModal } from './components/CuencaDetailModal';
import { RecomendacionesModal } from './components/RecomendacionesModal';
import { ReportModal } from './components/ReportModal';
import { ProfileView } from './components/ProfileView';
import { DeleteVerificationModal } from './components/DeleteVerificationModal';
import { DataPrivacyModal } from './components/DataPrivacyModal';
import { CitizenReportsView } from './components/CitizenReportsView';
import { CuencaData } from './types';
import { CUENCAS_LIST } from './data/cuencasData';
import {
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

function AppContent() {
  const { currentUser } = useAuth();
  const { t } = useThemeLanguage();
  // Al iniciar sesión, la vista principal es directamente el mapa centrado en su sector
  const [currentView, setCurrentView] = useState<'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion' | 'reportes'>('mapa');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Derive initial cuenca based on user's registered sector
  const deriveUserCuenca = (sector?: string) => {
    if (!sector) return 'altavista';
    const s = sector.toLowerCase();
    if (s.includes('aguas frías') || s.includes('aguas frias') || s.includes('morro plan') || s.includes('picacha')) return 'la-picacha';
    if (s.includes('esperanza') || s.includes('chispero') || s.includes('cañada')) return 'la-canada';
    if (s.includes('morro') || s.includes('corazón') || s.includes('buenavista')) return 'buenavista';
    if (s.includes('manzanillo') || s.includes('jardín') || s.includes('guayabala')) return 'la-guayabala';
    return 'altavista';
  };

  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(() => deriveUserCuenca(currentUser?.barrioSector));
  const [selectedCuencaForModal, setSelectedCuencaForModal] = useState<CuencaData | null>(null);
  const [recommendationsModalOpen, setRecommendationsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sync selectedCuencaId when user logs in or switches account
  useEffect(() => {
    if (currentUser?.barrioSector) {
      setSelectedCuencaId(deriveUserCuenca(currentUser.barrioSector));
      setCurrentView('mapa');
    }
  }, [currentUser?.id, currentUser?.barrioSector]);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 5000);
  };

  const handleSelectCuenca = (cuencaId: string) => {
    setSelectedCuencaId(cuencaId);
    setCurrentView('mapa');
  };

  // Exclusividad para usuarios que inicien sesión: si no hay sesión iniciada, solo se muestra el acceso/registro
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-red-100 selection:text-red-900 transition-colors">
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xs transition-colors">
          <div className="flex items-center gap-3">
            <Logo size="md" showText={true} />
            <span className="hidden sm:inline-block h-4 w-px bg-slate-300 dark:bg-slate-700"></span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-500 dark:text-slate-400">
              {t('app.subtitle')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8B0000] dark:text-red-400" />
              <span>{t('app.protected_access')}</span>
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-xl">
            <AuthView onSuccessRedirect={() => setCurrentView('mapa')} />
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 transition-colors">
          {t('app.location')}
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-red-100 selection:text-red-900 transition-colors">
      {/* 1. FIXED LATERAL NAVIGATION SIDEBAR */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenDeleteVerification={() => setDeleteModalOpen(true)}
      />

      {/* 2. MAIN APPLICATION CONTENT */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header - No Profile on the Top Right */}
        <TopHeader
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onSelectCuenca={handleSelectCuenca}
          onOpenSidebarToggle={() => setMobileSidebarOpen(true)}
          onOpenDeleteVerification={() => setDeleteModalOpen(true)}
        />

        {/* Emergency Alert Banner (Excluded from MI QUEBRADA section as requested) */}
        {currentView !== 'inicio' && (
          <BannerAlert
            onOpenRecommendations={() => setRecommendationsModalOpen(true)}
          />
        )}

        {/* Main View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'inicio' && (
            <DashboardView
              onNavigateToMap={(cuencaId) => {
                if (cuencaId) setSelectedCuencaId(cuencaId);
                setCurrentView('mapa');
              }}
              onOpenCuencaModal={(cuenca) => setSelectedCuencaForModal(cuenca)}
            />
          )}

          {currentView === 'mapa' && (
            <LiveRiskMapView
              initialCuencaId={selectedCuencaId}
              onOpenReportModal={() => setReportModalOpen(true)}
            />
          )}

          {currentView === 'perfil' && (
            <ProfileView
              onBackToDashboard={() => setCurrentView('mapa')}
              onOpenDeleteVerification={() => setDeleteModalOpen(true)}
              onOpenPrivacyPolicy={() => setPrivacyModalOpen(true)}
            />
          )}

          {currentView === 'reportes' && (
            <CitizenReportsView />
          )}

          {currentView === 'auth' && (
            <AuthView onSuccessRedirect={() => setCurrentView('mapa')} />
          )}
        </main>
      </div>

      {/* Global Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Basin Technical Sheet Modal */}
      <CuencaDetailModal
        cuenca={selectedCuencaForModal}
        onClose={() => setSelectedCuencaForModal(null)}
        onGoToMap={() => {
          setSelectedCuencaForModal(null);
          setCurrentView('mapa');
        }}
      />

      {/* Recommendations Modal */}
      <RecomendacionesModal
        isOpen={recommendationsModalOpen}
        onClose={() => setRecommendationsModalOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onReportSubmitted={(msg) => showToast(msg)}
      />

      {/* Delete Verification Modal */}
      <DeleteVerificationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDeleted={(msg) => {
          showToast(msg);
          setCurrentView('mapa');
        }}
      />

      {/* Data Privacy Policy Modal */}
      <DataPrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeLanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeLanguageProvider>
  );
}
