import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { SECTORS_LIST } from '../data/cuencasData';
import { DataPrivacyModal } from './DataPrivacyModal';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Lock,
  User,
  ArrowLeft,
  FileText
} from 'lucide-react';

interface AuthViewProps {
  onSuccessRedirect: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessRedirect }) => {
  const { currentUser, login, register } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form fields (NO ROLES!)
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [barrioSector, setBarrioSector] = useState(SECTORS_LIST[0]);
  const [dataTreatmentAccepted, setDataTreatmentAccepted] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico o número de celular.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    const res = login(identifier, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al iniciar sesión.');
    } else {
      setSuccessMessage('¡Bienvenido! Sesión iniciada correctamente.');
      setTimeout(() => {
        onSuccessRedirect();
      }, 700);
    }
  };

  // Handle Register (with personal data treatment verification)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!dataTreatmentAccepted) {
      setErrorMessage(
        'Debes autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012 para crear tu cuenta comunitaria.'
      );
      return;
    }

    const res = register({
      name,
      email: registerEmail,
      phone: registerPhone,
      password: registerPassword,
      barrioSector,
      dataTreatmentAccepted
    });

    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo crear la cuenta.');
    } else {
      setSuccessMessage('¡Cuenta creada con éxito! Bienvenido a la red comunitaria.');
      setTimeout(() => {
        onSuccessRedirect();
      }, 800);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-2">
      {/* Return button (only visible if already authenticated) */}
      {currentUser && (
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onSuccessRedirect}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Monitoreo</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Comuna 70 · Altavista
          </span>
        </div>
      )}

      {/* Main Auth Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-6 pb-6 border-b border-slate-100">
          <div className="inline-flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {mode === 'login' ? 'Iniciar Sesión en Overflows' : 'Crear Cuenta Comunitaria'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {mode === 'login'
              ? 'Accede al sistema comunitario de alerta temprana y monitoreo de quebradas.'
              : 'Regístrate para publicar reportes de cauces y recibir avisos preventivos de crecientes.'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Only Iniciar Sesión / Registrarme - NO ROLES!) */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrarme</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Correo electrónico o celular
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Correo electrónico o número de celular"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#8B0000] focus:ring-[#8B0000]"
                />
                <span>Recordar sesión en este dispositivo</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM (WITH DATA TREATMENT) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre y apellidos"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Número de celular
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="Número de celular"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Sector o vereda en Altavista
              </label>
              <div className="relative">
                <select
                  value={barrioSector}
                  onChange={(e) => setBarrioSector(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden cursor-pointer"
                >
                  {SECTORS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Crear contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* MANDATORY DATA TREATMENT AUTHORIZATION (Ley 1581 de 2012 / Habeas Data) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataTreatmentAccepted}
                  onChange={(e) => setDataTreatmentAccepted(e.target.checked)}
                  required
                  className="mt-1 rounded border-slate-300 text-[#8B0000] focus:ring-[#8B0000] shrink-0"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Autorizo el tratamiento de mis datos personales</strong> según la normativa digital y la Ley 1581 de 2012 (Habeas Data) para la recepción de alertas tempranas hidrológicas, avisos de evacuación preventiva y comunicaciones comunitarias en Altavista.
                </span>
              </label>

              <div className="pl-7">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-xs text-[#8B0000] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Leer Política de Tratamiento de Datos Personales</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!dataTreatmentAccepted}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                dataTreatmentAccepted
                  ? 'bg-[#8B0000] hover:bg-[#720000]'
                  : 'bg-slate-300 cursor-not-allowed opacity-75'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta Comunitaria</span>
            </button>
          </form>
        )}
      </div>

      {/* Data Privacy Modal */}
      <DataPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};
