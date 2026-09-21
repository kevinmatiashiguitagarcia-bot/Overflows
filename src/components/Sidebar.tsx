import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  MapPin,
  Waves,
  MessageSquareWarning,
  PhoneCall,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  LogIn,
  Settings,
  User,
  LogOut,
  Trash2,
  MoreVertical,
  X
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
  const isAdmin = currentUser?.role === 'administrador';
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'inicio' as const,
      label: isAdmin ? 'Supervisión General' : 'Mi Quebrada Asignada',
      sublabel: isAdmin ? 'Red SIATA Comuna 70' : 'Telemetría y Estado',
      icon: Activity,
      badge: isAdmin ? 'Admin' : 'Exclusivo',
      badgeColor: isAdmin ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'mapa' as const,
      label: 'Mapa de Riesgo en Vivo',
      sublabel: isAdmin ? 'Radares y Cuencas Altavista' : 'Sector Residencial',
      icon: MapPin,
      badge: 'En Vivo',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'reportes' as const,
      label: 'Reportes Ciudadanos',
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

        {/* Live Network Pill - Pure SIATA & Community */}
        {!collapsed && (
          <div className="mx-4 mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">Red Hidrológica SIATA</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono text-[11px] border border-emerald-800/60">
              Activo
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navegación Principal
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative cursor-pointer ${
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
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
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

          {/* Additional Account Navigation Options */}
          {currentUser && (
            <div className="pt-3 mt-3 border-t border-slate-800/80">
              {!collapsed && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Mi Cuenta
                </div>
              )}

              <button
                onClick={() => {
                  onNavigate('perfil');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group cursor-pointer ${
                  currentView === 'perfil'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={collapsed ? 'Ver Perfil' : undefined}
              >
                <div className="p-1.5 rounded-lg shrink-0 bg-slate-800/80 text-slate-400 group-hover:text-white">
                  <User className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <span className="text-xs font-semibold">Ver Perfil</span>
                )}
              </button>

              <button
                onClick={() => {
                  onNavigate('configuracion');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group cursor-pointer ${
                  currentView === 'configuracion'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={collapsed ? 'Configuración' : undefined}
              >
                <div className="p-1.5 rounded-lg shrink-0 bg-slate-800/80 text-slate-400 group-hover:text-white">
                  <Settings className="w-4 h-4" />
                </div>
                {!collapsed && (
                  <span className="text-xs font-semibold">Configuración</span>
                )}
              </button>
            </div>
          )}
        </nav>

        {/* User Account & Profile Menu exclusively situated at bottom-left */}
        <div className="p-3 border-t border-slate-800/80 shrink-0 bg-slate-950/90">
          {currentUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    onNavigate('perfil');
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-2.5 overflow-hidden text-left hover:opacity-90 cursor-pointer ${
                    collapsed ? 'justify-center w-full' : ''
                  }`}
                  title="Ver perfil de usuario"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#8B0000] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-red-400/30">
                    {currentUser.name.charAt(0)}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {currentUser.barrioSector}
                      </p>
                    </div>
                  )}
                </button>

                {!collapsed && (
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Menú de cuenta"
                  >
                    {profileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Profile Menu Actions: Eliminar cuenta y Cerrar sesión */}
              {(!collapsed && profileMenuOpen) && (
                <div className="pt-2 border-t border-slate-800 space-y-1 animate-in fade-in slide-in-from-bottom-1">
                  <button
                    onClick={() => {
                      onNavigate('perfil');
                      setProfileMenuOpen(false);
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('configuracion');
                      setProfileMenuOpen(false);
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Configuración</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onCloseMobile();
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cerrar sesión</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onCloseMobile();
                      onOpenDeleteVerification();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Eliminar cuenta</span>
                  </button>
                </div>
              )}

              {/* Direct quick action buttons when not expanding or when collapsed */}
              {!profileMenuOpen && (
                <div className={`flex items-center gap-1.5 pt-1 ${collapsed ? 'flex-col' : 'justify-between'}`}>
                  <button
                    onClick={() => {
                      onCloseMobile();
                      logout();
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer ${
                      collapsed ? 'w-full justify-center p-2' : ''
                    }`}
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5 text-amber-400" />
                    {!collapsed && <span>Cerrar sesión</span>}
                  </button>

                  <button
                    onClick={() => {
                      onCloseMobile();
                      onOpenDeleteVerification();
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer ${
                      collapsed ? 'w-full justify-center p-2' : ''
                    }`}
                    title="Eliminar cuenta permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    {!collapsed && <span>Eliminar cuenta</span>}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`space-y-1 ${collapsed ? 'text-center' : ''}`}>
              <button
                onClick={() => {
                  onNavigate('auth');
                  onCloseMobile();
                }}
                className={`w-full py-2 px-3 rounded-xl bg-red-900/40 hover:bg-red-900/60 border border-red-800/50 text-red-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
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
