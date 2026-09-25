import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ChevronDown, Menu, X, Home, MapPin, Waves } from 'lucide-react';
import { CUENCAS_LIST } from '../data/cuencasData';

interface TopHeaderProps {
  currentView: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion';
  onNavigate: (view: 'inicio' | 'mapa' | 'auth' | 'perfil' | 'configuracion') => void;
  onSelectCuenca?: (cuencaId: string) => void;
  onOpenSidebarToggle?: () => void;
  onOpenDeleteVerification?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSidebarToggle
}) => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive user's residential quebrada ID
  const userCuencaId = React.useMemo(() => {
    if (!currentUser?.barrioSector) return 'altavista';
    const s = currentUser.barrioSector.toLowerCase();
    if (s.includes('aguas frías') || s.includes('aguas frias') || s.includes('morro plan') || s.includes('picacha') || s.includes('brisas')) return 'la-picacha';
    if (s.includes('esperanza') || s.includes('chispero') || s.includes('cañada')) return 'la-canada';
    if (s.includes('morro') || s.includes('corazón') || s.includes('corazon') || s.includes('buenavista') || s.includes('san judas')) return 'buenavista';
    if (s.includes('manzanillo') || s.includes('jardín') || s.includes('jardin') || s.includes('guayabala')) return 'la-guayabala';
    return 'altavista';
  }, [currentUser?.barrioSector]);

  const assignedCuenca = CUENCAS_LIST.find((c) => c.id === userCuencaId) || CUENCAS_LIST[0];
  const assignedCuencaName = assignedCuenca.name.split('/')[0].trim();

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

        {/* Center/Right Desktop Navigation: Strictly isolated to assigned quebrada */}
        <nav className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('inicio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border cursor-pointer ${
              currentView === 'inicio'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={`Monitoreo exclusivo de Quebrada ${assignedCuencaName} (${currentUser?.barrioSector || 'Sector Residencial'})`}
          >
            <Waves className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-400 font-normal text-xs">Quebrada asignada:</span>
            <span>{assignedCuencaName}</span>
          </button>

          {/* Mapa de Riesgo en Vivo Button */}
          <button
            onClick={() => onNavigate('mapa')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              currentView === 'mapa'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mapa de Riesgo en Vivo
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
            <span>Mi Quebrada Asignada ({assignedCuencaName})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => {
              onNavigate('mapa');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold bg-[#8B0000] text-white"
          >
            Mapa de Riesgo en Vivo
          </button>
        </div>
      )}
    </header>
  );
};
