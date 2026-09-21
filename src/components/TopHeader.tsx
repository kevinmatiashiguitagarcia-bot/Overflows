import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, PhoneCall, Menu, X, User, Settings, LogOut, Trash2 } from 'lucide-react';
import { CUENCAS_LIST } from '../data/cuencasData';
import { UserDropdown } from './UserDropdown';

interface TopHeaderProps {
  currentView: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion';
  onNavigate: (view: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion') => void;
  onSelectCuenca?: (cuencaId: string) => void;
  onOpenSidebarToggle?: () => void;
  onOpenDeleteVerification: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  onNavigate,
  onSelectCuenca,
  onOpenSidebarToggle,
  onOpenDeleteVerification
}) => {
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === 'administrador';
  const [quebradasOpen, setQuebradasOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {onOpenSidebarToggle && (
            <button
              onClick={onOpenSidebarToggle}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
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

        {/* Center/Right Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {/* Inicio Link */}
          <button
            onClick={() => onNavigate('inicio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === 'inicio'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{isAdmin ? 'Supervisión Cuencas' : 'Mi Quebrada'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Quebradas Dropdown - STRICTLY FOR ADMINISTRATORS ONLY */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setQuebradasOpen(!quebradasOpen)}
                onBlur={() => setTimeout(() => setQuebradasOpen(false), 200)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 transition-colors cursor-pointer"
                title="Supervisión integral de cuencas (Exclusivo Administrador)"
              >
                <span>Cuencas (Admin)</span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
              </button>

              {quebradasOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Quebradas Comuna 70</span>
                    <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-[9px]">Admin</span>
                  </div>
                  {CUENCAS_LIST.map((cuenca) => (
                    <button
                      key={cuenca.id}
                      onClick={() => {
                        if (onSelectCuenca) onSelectCuenca(cuenca.id);
                        setQuebradasOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold text-slate-900">{cuenca.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          cuenca.status === 'seguro'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {cuenca.capacityPercentage}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mapa de Riesgo en Vivo Button */}
          <button
            onClick={() => onNavigate('mapa')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === 'mapa'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mapa de Riesgo SIATA
          </button>

          {/* Live System Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-800">Alerta Temprana Activa</span>
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            title="Menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onNavigate('inicio');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between"
          >
            <span>{isAdmin ? 'Supervisión de Quebradas (Admin)' : 'Mi Quebrada Asignada'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => {
              onNavigate('mapa');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold bg-[#8B0000] text-white"
          >
            Mapa de Riesgo SIATA
          </button>

          {/* User section in mobile */}
          <div className="pt-2 border-t border-slate-200">
            {currentUser ? (
              <div className="space-y-1">
                <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-900">
                  <div className="flex items-center justify-between">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      {isAdmin ? 'Administrador' : 'Habitante'}
                    </span>
                  </div>
                  <span className="block text-[10px] text-slate-500 font-normal">
                    {currentUser.barrioSector}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onNavigate('perfil');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-100 font-semibold text-xs text-left"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span>Ver Perfil</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('configuracion');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-100 font-semibold text-xs text-left"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Configuración</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-xs text-left"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Cerrar Sesión</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDeleteVerification();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-semibold text-xs text-left"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Eliminar Cuenta</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#8B0000] rounded-xl hover:bg-[#720000]"
                >
                  Crear Cuenta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
