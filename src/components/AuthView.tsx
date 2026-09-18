import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ProfileType, UserRole } from '../types';
import { SECTORS_LIST } from '../data/cuencasData';
import {
  ShieldCheck,
  Users,
  Shield,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Compass,
  CheckCircle2,
  AlertCircle,
  Radio,
  Trash2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface AuthViewProps {
  onSuccessRedirect: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessRedirect }) => {
  const {
    currentUser,
    login,
    register,
    logout,
    deleteAccount,
    continueAsGuest
  } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [profileType, setProfileType] = useState<ProfileType>('comunidad');

  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration extra fields
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [barrioSector, setBarrioSector] = useState(SECTORS_LIST[0]);
  const [userRole, setUserRole] = useState<UserRole>('habitante');

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    const res = login(identifier, password, profileType);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al iniciar sesión.');
    } else {
      setSuccessMessage('¡Bienvenido! Sesión iniciada correctamente.');
      setTimeout(() => {
        onSuccessRedirect();
      }, 800);
    }
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = register({
      name,
      email: registerEmail,
      phone: registerPhone,
      password: registerPassword,
      profileType,
      role: userRole,
      barrioSector
    });

    if (!res.success) {
      setErrorMessage(res.error || 'No se pudo crear la cuenta.');
    } else {
      setSuccessMessage('¡Cuenta creada exitosamente! Bienvenido a la red comunitaria.');
      setTimeout(() => {
        onSuccessRedirect();
      }, 900);
    }
  };

  // Handle Delete Account
  const handleDeleteAccountConfirm = () => {
    if (!currentUser) return;
    const res = deleteAccount(currentUser.id);
    setShowDeleteConfirm(false);
    setSuccessMessage(res.message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto">
      {/* If already logged in, show Profile & Account Management screen */}
      {currentUser ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-tr from-[#8B0000] to-amber-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg mb-4">
              {currentUser.name.charAt(0)}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cuenta Activa y Verificada</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentUser.name}
            </h2>
            <p className="text-sm text-slate-500 capitalize">
              Perfil {currentUser.profileType} · Rol: {currentUser.role}
            </p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* User details grid */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 space-y-3 mb-8 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Correo registrado:</span>
              </span>
              <span className="font-semibold text-slate-900 font-mono">
                {currentUser.email}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Celular registrado:</span>
              </span>
              <span className="font-semibold text-slate-900 font-mono">
                {currentUser.phone}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Barrio / Sector Comuna 70:</span>
              </span>
              <span className="font-semibold text-slate-900">
                {currentUser.barrioSector}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Fecha de registro:</span>
              <span className="font-medium text-slate-600 font-mono text-xs">
                {new Date(currentUser.createdAt).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onSuccessRedirect}
              className="w-full py-3 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Ir al Panel de Monitoreo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>

            {/* Permanent Account Deletion Section as requested */}
            <div className="pt-6 mt-6 border-t border-slate-200">
              <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-red-900">
                      Zona de Eliminación de Cuenta
                    </h3>
                    <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                      Si lo deseas, puedes eliminar tu cuenta permanentemente. Esta acción removerá
                      tu correo, celular y datos de la red de vigías de forma irreversible.
                    </p>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-red-300 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Mi Cuenta Definitivamente</span>
                  </button>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-red-300 space-y-3 animate-in fade-in">
                    <p className="text-xs font-bold text-slate-900">
                      ¿Confirmas que deseas borrar tu cuenta para siempre?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAccountConfirm}
                        className="flex-1 py-2 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sí, eliminar ahora</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unauthenticated Auth Grid matching Image 3 */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: Brand Story, Logo & Vigías (Image 3 Left Card) */}
          <div className="lg:col-span-5 bg-linear-to-b from-slate-50 via-slate-100 to-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header with emblem logo */}
              <div className="flex items-center gap-3.5 mb-6">
                <Logo size="xl" showText={false} />
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800">
                    COMUNA 70 · MEDELLÍN
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none mt-0.5">
                    Overflows Altavista
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Red Comunitaria de Prevención Temprana
                  </p>
                </div>
              </div>

              {/* Description paragraph */}
              <div className="text-sm text-slate-600 leading-relaxed mb-6">
                <p className="mb-2 font-medium text-slate-700">
                  Plataforma de alerta hidrológica y monitoreo en tiempo real de las quebradas:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-800 font-semibold bg-white/80 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Quebrada La Picacha</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Quebrada Altavista</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Quebrada Buenavista</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Quebrada Las Cañadas (La Esperanza)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Quebrada La Guayabala</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>Quebrada el pelon</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>quebrada buga y el barcino</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span>quebrada ana diaz</span>
                  </div>
                </div>
              </div>

              {/* Vigía Testimonial Quote Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs mb-4 flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &quot;El reporte oportuno desde los sectores altos nos da hasta 25 minutos de
                  ventaja para salvaguardar a las familias&quot;.
                </p>
              </div>

              {/* Status Box: Red de Vigías Activa */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Red Comunitaria Activa</div>
                    <div className="text-[11px] text-slate-500">14 puntos de lectura conectados</div>
                  </div>
                </div>

                {/* Green Sparkline */}
                <div className="w-16 h-6">
                  <svg className="w-full h-full" viewBox="0 0 60 20" preserveAspectRatio="none">
                    <path
                      d="M0 16 Q15 4 30 14 T60 6"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Helper */}
            <div className="pt-6 border-t border-slate-200/70 text-[11px] text-slate-500 text-center">
              Sistema verificado por SIATA y líderes comunitarios de Altavista.
            </div>
          </div>

          {/* Right Card: Form (Image 3 Right Card) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl flex flex-col justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>SISTEMA SEGURO</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-[#8B0000] hover:underline"
                >
                  {mode === 'login' ? '¿Crear cuenta nueva?' : '¿Ya tienes cuenta? Ingresa'}
                </button>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-5">
                {mode === 'login' ? 'Ingreso a la Plataforma' : 'Crear Cuenta en la Red'}
              </h2>

              {/* Profile Type Tabs (Comunidad vs Administrativo) */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Tipo de Perfil Comunitario
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProfileType('comunidad')}
                    className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      profileType === 'comunidad'
                        ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>Comunidad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileType('administrativo')}
                    className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      profileType === 'administrativo'
                        ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-blue-700" />
                    <span>Administrativo</span>
                  </button>
                </div>
              </div>

              {/* Error or Success banner */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form switch between Login & Register */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Correo o celular */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Correo electrónico o número celular
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="ej. 3120000000 o correo@ejemplo.com"
                        required
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Contraseña de acceso
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          alert('Para restablecer tu contraseña comunitaria, contacta al Comité Barrial Comuna 70: 300 240 7070.')
                        }
                        className="text-xs text-amber-800 hover:underline font-medium"
                      >
                        ¿Olvidó su contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Escribe tu contraseña"
                        required
                        className="w-full px-3.5 py-3 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox: Mantener sesión iniciada */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8B0000] focus:ring-[#8B0000] border-slate-300"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium">
                      Mantener sesión iniciada en este dispositivo
                    </label>
                  </div>

                  {/* Primary CTA: Iniciar Sesión (dark red) */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                </form>
              ) : (
                /* Mode: Register New Account */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Nombre completo */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Carmen Elena Restrepo"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Correo y Celular en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Número celular / teléfono
                      </label>
                      <input
                        type="tel"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        placeholder="Ej: 3120000000"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Barrio / Sector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sector o Vereda en Altavista
                    </label>
                    <select
                      value={barrioSector}
                      onChange={(e) => setBarrioSector(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    >
                      {SECTORS_LIST.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Contraseña */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Crea tu Contraseña (mínimo 6 caracteres)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Contraseña segura"
                        required
                        minLength={6}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary CTA: Crear una cuenta */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear mi Cuenta Ahora</span>
                  </button>
                </form>
              )}

              {/* Bottom buttons matching Image 3 */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                {mode === 'login' && (
                  <>
                    <div className="text-center text-xs font-semibold text-slate-400">
                      ¿Aún no tienes una cuenta?
                    </div>

                    {/* Green button: Crear una cuenta */}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage(null);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#0f683a] hover:bg-[#0c5630] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Crear una cuenta</span>
                    </button>
                  </>
                )}

                {/* Light button: Continuar como Invitado */}
                <button
                  type="button"
                  onClick={() => {
                    continueAsGuest();
                    onSuccessRedirect();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-50/70 hover:bg-blue-100 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-blue-100"
                >
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>Continuar como Invitado (Sin registro)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
