import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  LogOut,
  Trash2,
  ChevronDown,
  ShieldCheck,
  MapPin,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserDropdownProps {
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onOpenDeleteVerification: () => void;
  onNavigateToAuth: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  onNavigateToProfile,
  onNavigateToSettings,
  onOpenDeleteVerification,
  onNavigateToAuth
}) => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    onNavigateToProfile();
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    onNavigateToSettings();
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    logout();
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    onOpenDeleteVerification();
  };

  if (!currentUser) {
    return (
      <button
        onClick={onNavigateToAuth}
        className="px-3.5 py-2 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Iniciar Sesión</span>
      </button>
    );
  }

  // Get first name or initials
  const firstName = currentUser.name.split(' ')[0] || currentUser.name;
  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* User Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          {initials || <User className="w-3.5 h-3.5" />}
        </div>

        {/* User name on larger screens */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 truncate max-w-[110px] leading-tight">
            {firstName}
          </span>
          <span className="text-[10px] text-slate-500 truncate max-w-[110px] leading-tight">
            {currentUser.barrioSector.split(' ')[0] || 'Altavista'}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-800' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-72 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* User Header Summary Card */}
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B0000] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 truncate">
                  {currentUser.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium mt-1">
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  <span className="truncate">{currentUser.barrioSector}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-bold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Habitante Comuna 70</span>
              </span>
              <span className="text-slate-400 font-normal">Datos Protegidos</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            {/* Option 1: Ver Perfil */}
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                <User className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-slate-900">Ver Perfil</span>
                <span className="block text-[10px] text-slate-500">Datos personales y sector</span>
              </div>
            </button>

            {/* Option 2: Configuración */}
            <button
              type="button"
              onClick={handleSettingsClick}
              className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                <Settings className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex-1">
                <span className="block font-bold text-slate-900">Configuración</span>
                <span className="block text-[10px] text-slate-500">Alertas y tratamiento de datos</span>
              </div>
            </button>
          </div>

          {/* Bottom Actions: Logout & Delete Account */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 space-y-1">
            {/* Option 3: Cerrar Sesión */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Cerrar Sesión</span>
            </button>

            {/* Option 4: Eliminar Cuenta */}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-900 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Eliminar Cuenta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
