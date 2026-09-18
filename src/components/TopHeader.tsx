import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, PhoneCall, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { CUENCAS_LIST } from '../data/cuencasData';

interface TopHeaderProps {
  currentView: 'inicio' | 'mapa' | 'auth' | 'emergencias' | 'perfil';
  onNavigate: (view: 'inicio' | 'mapa' | 'auth' | 'emergencias' | 'perfil') => void;
  onSelectCuenca?: (cuencaId: string) => void;
  onOpenSidebarToggle?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  onNavigate,
  onSelectCuenca,
  onOpenSidebarToggle
}) => {
  const { currentUser, logout } = useAuth();
  const [quebradasOpen, setQuebradasOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
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
            className="flex items-center text-left group focus:outline-hidden"
          >
            <Logo size="md" showText={true} />
          </button>
        </div>

        {/* Center/Right Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {/* Inicio Link */}
          <button
            onClick={() => onNavigate('inicio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'inicio'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Inicio</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Quebradas Dropdown */}
          <div className="relative">
            <button
              onClick={() => setQuebradasOpen(!quebradasOpen)}
              onBlur={() => setTimeout(() => setQuebradasOpen(false), 200)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <span>Quebradas</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {quebradasOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Cuencas Comuna 70
                </div>
                {CUENCAS_LIST.map((cuenca) => (
                  <button
                    key={cuenca.id}
                    onClick={() => {
                      if (onSelectCuenca) onSelectCuenca(cuenca.id);
                      setQuebradasOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-medium">{cuenca.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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

          {/* Mapa de Riesgo en Vivo Button */}
          <button
            onClick={() => onNavigate('mapa')}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'mapa'
                ? 'bg-[#8B0000] text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mapa de Riesgo en Vivo
          </button>

          {/* Emergencias y Reporte */}
          <button
            onClick={() => onNavigate('emergencias')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'emergencias'
                ? 'text-[#8B0000] font-semibold bg-red-50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Emergencias y Reporte
          </button>

          {/* 123 Fast Hotline */}
          <a
            href="tel:123"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#8B0000] text-white text-xs font-bold hover:bg-red-800 transition-colors shadow-xs ml-1"
            title="Línea Única de Emergencias Medellín 123"
          >
            <PhoneCall className="w-3 h-3" />
            <span>123</span>
          </a>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          {/* User Auth Controls */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('perfil')}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Ver perfil y gestión de cuenta"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[110px]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize leading-none mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('auth')}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-2 text-sm font-semibold text-white bg-[#8B0000] hover:bg-[#720000] rounded-lg transition-colors shadow-xs"
              >
                Crear Cuenta
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="tel:123"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#8B0000] text-white text-xs font-bold"
          >
            123
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
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
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 flex items-center justify-between"
          >
            <span>Inicio</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => {
              onNavigate('mapa');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-[#8B0000] text-white"
          >
            Mapa de Riesgo en Vivo
          </button>

          <button
            onClick={() => {
              onNavigate('emergencias');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Emergencias y Reporte
          </button>

          <div className="pt-2 border-t border-slate-200">
            {currentUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate('perfil');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-900 font-medium text-sm"
                >
                  <User className="w-4 h-4 text-slate-600" />
                  <span>Mi Cuenta ({currentUser.name})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    onNavigate('auth');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-sm font-semibold text-white bg-[#8B0000] rounded-lg hover:bg-[#720000]"
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
