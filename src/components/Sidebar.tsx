import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  Activity,
  MapPin,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Trash2,
  MoreVertical,
  X,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

interface SidebarProps {
  currentView: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion' | 'reportes';
  onNavigate: (view: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion' | 'reportes') => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenDeleteVerification: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
  onOpenDeleteVerification
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();
  const isAdmin = currentUser?.role === 'administrador';
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'inicio' as const,
      label: isAdmin ? t('nav.dashboard_admin') : t('nav.dashboard'),
      sublabel: isAdmin ? 'Red SIATA Comuna 70' : 'Telemetría y Estado',
      icon: Activity,
      badge: isAdmin ? 'Admin' : 'Exclusivo',
      badgeColor: isAdmin ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'mapa' as const,
      label: t('nav.map'),
      sublabel: isAdmin ? 'Radares y Cuencas Altavista' : 'Sector Residencial',
      icon: MapPin,
      badge: 'En Vivo',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'reportes' as const,
      label: t('nav.reports'),
      sublabel: 'Fotos y Videos Obligatorios',
      icon: MessageSquareWarning,
      badge: 'Alerta',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Fixed Lateral Navigation Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-950 text-slate-100 z-50 flex flex-col border-r border-slate-800/80 shadow-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center overflow-hidden">
            <button
              onClick={() => {
                onNavigate('inicio');
                onCloseMobile();
              }}
              className="flex items-center gap-3 text-left focus:outline-hidden cursor-pointer"
            >
              <Logo
                size={collapsed ? 'sm' : 'md'}
                showText={!collapsed}
                variant="dark"
              />
            </button>
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Network Pill - Normal and Secure */}
        {!collapsed && (
          <div className="mx-4 mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">Red SIATA Comuna 70</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-800/60 font-bold">
              {t('status.normal') || 'Normal'}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Navegación Principal
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isReports = item.id === 'reportes';

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  isActive
                    ? isReports
                      ? 'bg-rose-950 text-white font-bold border border-rose-800/80 shadow-xs'
                      : 'bg-[#8B0000] text-white font-bold shadow-xs'
                    : isReports
                    ? 'text-rose-200 hover:text-white hover:bg-rose-950/40 border border-rose-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isReports
                      ? 'bg-rose-900/40 text-rose-300 group-hover:text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block truncate font-medium">
                      {item.sublabel}
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* User Account Navigation: "Ver Perfil" + Direct Dark/Light & Language Controls */}
          {currentUser && (
            <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
              {!collapsed && (
                <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mi Cuenta
                </div>
              )}

              {/* 1. Ver Perfil Button */}
              <button
                onClick={() => {
                  onNavigate('perfil');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  currentView === 'perfil'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={collapsed ? t('nav.profile') : undefined}
              >
                <div className="p-1.5 rounded-lg shrink-0 bg-slate-800/80 text-slate-400 group-hover:text-white">
                  <User className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <span className="text-xs sm:text-sm font-semibold">{t('nav.profile')}</span>
                )}
              </button>

              {/* 2. Direct Visual Theme Control: Modo Oscuro / Modo Claro */}
              {!collapsed ? (
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{t('theme.title')}</span>
                    <span className="text-slate-300 font-mono font-semibold">
                      {theme === 'dark' ? t('theme.dark') : t('theme.light')}
                    </span>
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-950 rounded-lg">
                    <button
                      type="button"
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Claro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Oscuro</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center"
                  title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              {/* 3. Direct Language Selector: Español / English */}
              {!collapsed ? (
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t('lang.title')}</span>
                    </span>
                    <span className="text-slate-300 font-mono font-semibold uppercase">
                      {language}
                    </span>
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-950 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLanguage('es')}
                      className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        language === 'es'
                          ? 'bg-[#8B0000] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Español
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-[#8B0000] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                  className="w-full p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs font-mono font-bold"
                  title="Cambiar idioma"
                >
                  {language.toUpperCase()}
                </button>
              )}
            </div>
          )}
        </nav>

        {/* User Account Menu Exclusively Situated at the Bottom-Left */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 bg-slate-950/95 relative">
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 cursor-pointer ${
                    collapsed ? 'justify-center w-full' : ''
                  }`}
                  title="Opciones de cuenta"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#8B0000] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-red-400/30">
                    {currentUser.name.charAt(0)}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {currentUser.barrioSector}
                      </p>
                    </div>
                  )}
                </button>

                {!collapsed && (
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Menú de cuenta"
                  >
                    {profileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Clean Profile Popup Menu with ONLY TWO OPTIONS: "Eliminar cuenta" y "Cerrar sesión" */}
              {profileMenuOpen && (
                <div className="pt-2 border-t border-slate-800 space-y-1 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onCloseMobile();
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-200 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-amber-400" />
                    <span>{t('nav.logout')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onCloseMobile();
                      onOpenDeleteVerification();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>{t('nav.delete_account')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-1">
              <button
                onClick={() => {
                  onNavigate('auth');
                  onCloseMobile();
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#8B0000] text-white font-bold text-xs"
              >
                {t('auth.login_tab')}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
