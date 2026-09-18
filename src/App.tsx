/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { CuencaData } from './types';
import { CUENCAS_LIST } from './data/cuencasData';
import {
  PhoneCall,
  AlertTriangle,
  Radio,
  CheckCircle2,
  BellRing,
  ExternalLink
} from 'lucide-react';

function AppContent() {
  const { currentUser, isGuest } = useAuth();
  const [currentView, setCurrentView] = useState<'inicio' | 'mapa' | 'auth' | 'emergencias' | 'perfil'>('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [selectedCuencaId, setSelectedCuencaId] = useState<string>('la-picacha');
  const [selectedCuencaForModal, setSelectedCuencaForModal] = useState<CuencaData | null>(null);
  const [recommendationsModalOpen, setRecommendationsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

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

  // Si no se tiene cuenta previa iniciada, lo primero que sale es Iniciar Sesión o Registrarse
  if (!currentUser && !isGuest) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] text-slate-900 flex flex-col font-sans antialiased selection:bg-red-100 selection:text-red-900">
        <header className="w-full bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
          <div className="flex items-center gap-3">
            <Logo size="md" showText={true} />
            <span className="hidden sm:inline-block h-4 w-px bg-slate-300"></span>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-500">
              Sistema Comunitario de Alerta Temprana · Comuna 70
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Monitoreo Activo</span>
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-5xl">
            <AuthView onSuccessRedirect={() => setCurrentView('inicio')} />
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/50">
          Corregimiento de Altavista · Comuna 70 · Medellín, Antioquia
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 flex flex-col font-sans antialiased selection:bg-red-100 selection:text-red-900">
      {/* 1. FIXED LATERAL NAVIGATION SIDEBAR as requested */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. MAIN APPLICATION CONTENT (adjusted for fixed sidebar on desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header matching Images 1 & 2 */}
        <TopHeader
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onSelectCuenca={handleSelectCuenca}
          onOpenSidebarToggle={() => setMobileSidebarOpen(true)}
        />

        {/* Emergency Alert Banner matching Image 1 & 2 */}
        <BannerAlert
          onOpenRecommendations={() => setRecommendationsModalOpen(true)}
        />

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

          {(currentView === 'auth' || currentView === 'perfil') && (
            <AuthView onSuccessRedirect={() => setCurrentView('inicio')} />
          )}

          {currentView === 'emergencias' && (
            <div className="space-y-6 pb-12">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-red-100 text-[#8B0000]">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900">
                      Central de Auxilio y Emergencias Comuna 70
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Canales directos de respuesta rápida ante crecientes súbitas e inundaciones en Altavista
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  <div className="p-5 rounded-2xl bg-red-950 text-white flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-red-300 uppercase tracking-wide">
                        Bomberos Medellín
                      </div>
                      <div className="text-3xl font-black font-mono mt-1">119</div>
                      <p className="text-xs text-red-200 mt-2">
                        Atención directa a desbordamientos, rescate y deslizamientos en la cuenca.
                      </p>
                    </div>
                    <a
                      href="tel:119"
                      className="mt-4 py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-600 text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Marcar 119</span>
                    </a>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        Línea Única de Seguridad
                      </div>
                      <div className="text-3xl font-black font-mono mt-1">123</div>
                      <p className="text-xs text-slate-300 mt-2">
                        Despacho coordinado DAGRD, Policía Nacional y ambulancias APH.
                      </p>
                    </div>
                    <a
                      href="tel:123"
                      className="mt-4 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Marcar 123</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <BellRing className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">¿Cuándo desalojar preventivamente?</strong> Si el sensor
                    indica capacidad superior al 75%, el agua roza los estribos del puente peatonal, o los
                    vigías reportan empalizadas densas en la parte alta. Desaloje hacia la Cancha El Corazón.
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
