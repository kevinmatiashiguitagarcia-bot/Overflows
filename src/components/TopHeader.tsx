import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { LiveClock } from './LiveClock';
import { ChevronDown, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { CUENCAS_LIST } from '../data/cuencasData';

interface TopHeaderProps {
  currentView: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion' | 'reportes';
  onNavigate: (view: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion' | 'reportes') => void;
  onSelectCuenca?: (cuencaId: string) => void;
  onOpenSidebarToggle?: () => void;
  onOpenDeleteVerification: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  onNavigate,
  onSelectCuenca,
  onOpenSidebarToggle
}) => {
  const { currentUser } = useAuth();
  const { t, theme, toggleTheme, language, setLanguage } = useThemeLanguage();
  const isAdmin = currentUser?.role === 'administrador';
  const [quebradasOpen, setQuebradasOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {onOpenSidebarToggle && (
            <button
              onClick={onOpenSidebarToggle}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Abrir menú lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onNavigate('inicio')}
            className="flex items-center text-left group focus:outline-hidden cursor-pointer"
          >
            <Logo size="md" showText={true} />
          </button>
        </div>

        {/* Center/Right Desktop Navigation - STRICTLY NO PROFILE IN TOP RIGHT */}
        <nav className="hidden md:flex items-center gap-2">
          {/* Inicio / Mi Quebrada Link */}
          <button
            onClick={() => onNavigate('inicio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === 'inicio'
                ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{isAdmin ? t('nav.dashboard_admin') : t('nav.dashboard')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Quebradas Dropdown - Strictly for Administrators */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setQuebradasOpen(!quebradasOpen)}
                onBlur={() => setTimeout(() => setQuebradasOpen(false), 200)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200/80 dark:border-indigo-800 transition-colors cursor-pointer"
              >
                <span>Cuencas (Admin)</span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </button>

              {quebradasOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Quebradas Comuna 70</span>
                    <span className="bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded text-xs">Admin</span>
                  </div>
                  {CUENCAS_LIST.map((cuenca) => (
                    <button
                      key={cuenca.id}
                      onClick={() => {
                        if (onSelectCuenca) onSelectCuenca(cuenca.id);
                        setQuebradasOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{cuenca.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {cuenca.capacityPercentage}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mapa de Riesgo SIATA Button */}
          <button
            onClick={() => onNavigate('mapa')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === 'mapa'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('nav.map')}
          </button>

          {/* Reportes Ciudadanos Button */}
          <button
            onClick={() => onNavigate('reportes')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === 'reportes'
                ? 'bg-rose-950 text-white shadow-xs border border-rose-800'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t('nav.reports')}
          </button>

          {/* Real Natural-Flowing Live Clock with smooth seconds */}
          <LiveClock variant="header" showSeconds={true} />
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LiveClock variant="badge" showSeconds={false} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title="Menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onNavigate('inicio');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <span>{isAdmin ? t('nav.dashboard_admin') : t('nav.dashboard')}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => {
              onNavigate('mapa');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8B0000] text-white"
          >
            {t('nav.map')}
          </button>

          <button
            onClick={() => {
              onNavigate('reportes');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('nav.reports')}
          </button>

          {/* Quick theme and language toggles in mobile */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 p-2 rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
            </button>

            <button
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
