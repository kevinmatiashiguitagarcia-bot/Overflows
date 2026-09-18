import React from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  MapPin,
  Waves,
  MessageSquareWarning,
  PhoneCall,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  LogIn,
  Trash2
} from 'lucide-react';

interface SidebarProps {
  currentView: 'inicio' | 'mapa' | 'auth' | 'emergencias' | 'perfil';
  onNavigate: (view: 'inicio' | 'mapa' | 'auth' | 'emergencias' | 'perfil') => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile
}) => {
  const { currentUser } = useAuth();

  const navItems = [
    {
      id: 'inicio' as const,
      label: 'Monitoreo Hidrológico',
      sublabel: 'Panel Comuna 70',
      icon: Activity,
      badge: '14 Sensores'
    },
    {
      id: 'mapa' as const,
      label: 'Mapa de Riesgo en Vivo',
      sublabel: 'Lectura Satelital SIATA',
      icon: MapPin,
      badge: 'Alerta Activa',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'emergencias' as const,
      label: 'Emergencias & Reporte',
      sublabel: 'DAGRD & Bomberos 119',
      icon: MessageSquareWarning
    },
    {
      id: currentUser ? ('perfil' as const) : ('auth' as const),
      label: currentUser ? 'Mi Cuenta Comunal' : 'Ingreso & Registro',
      sublabel: currentUser ? currentUser.role : 'Crear o Iniciar Sesión',
      icon: currentUser ? UserCheck : LogIn,
      badge: currentUser ? 'Activo' : undefined
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
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
              className="flex items-center gap-3 text-left focus:outline-hidden"
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
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Network Pill */}
        {!collapsed && (
          <div className="mx-4 mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">Red SIATA En Línea</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[11px] border border-emerald-800/60">
              14/14 Activos
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navegación Fija
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentView === item.id ||
              (item.id === 'perfil' && currentView === 'perfil') ||
              (item.id === 'auth' && currentView === 'auth');

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative ${
                  isActive
                    ? 'bg-[#8B0000] text-white shadow-md font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/20'
                              : item.badgeColor ||
                                'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.sublabel && (
                      <p
                        className={`text-xs truncate ${
                          isActive ? 'text-red-100/80' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Emergency Actions Box */}
        {!collapsed ? (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-red-950/40 border border-red-900/50 space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Líneas Rápidas Comuna 70</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:119"
                className="py-1.5 px-2 bg-red-800/80 hover:bg-red-700 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Bomberos 119</span>
              </a>
              <a
                href="tel:123"
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1 transition-colors border border-slate-700"
              >
                <span>Policía 123</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2 mb-2">
            <a
              href="tel:119"
              className="w-10 h-10 rounded-xl bg-red-800 hover:bg-red-700 text-white flex items-center justify-center shadow-xs"
              title="Llamar Bomberos 119"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* User Account / Footer in Sidebar */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  onNavigate('perfil');
                  onCloseMobile();
                }}
                className={`flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 ${
                  collapsed ? 'justify-center w-full' : ''
                }`}
                title="Ver perfil y opciones de cuenta"
              >
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-red-400/30">
                  {currentUser.name.charAt(0)}
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate capitalize">
                      {currentUser.barrioSector}
                    </p>
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className={`space-y-1 ${collapsed ? 'text-center' : ''}`}>
              <button
                onClick={() => {
                  onNavigate('auth');
                  onCloseMobile();
                }}
                className={`w-full py-2 px-3 rounded-lg bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  collapsed ? 'p-2' : ''
                }`}
                title="Crear cuenta o iniciar sesión"
              >
                <UserPlus className="w-4 h-4 text-red-300 shrink-0" />
                {!collapsed && <span>Crear Cuenta / Ingreso</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
