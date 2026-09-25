import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { SECTORS_LIST } from '../data/cuencasData';
import { DataPrivacyModal } from './DataPrivacyModal';
import { EmailInboxModal } from './EmailInboxModal';
import { maskEmail } from '../services/emailService';
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
  FileText,
  KeyRound,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  Inbox,
  ShieldAlert
} from 'lucide-react';

interface AuthViewProps {
  onSuccessRedirect: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessRedirect }) => {
  const { currentUser, login, register, requestPasswordReset, resetPassword } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Password recovery flow states
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  // Cooldown timer for resending recovery code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  // Password Recovery Handlers
  const handleRequestCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!recoveryEmail.trim()) {
      setRecoveryError('Por favor ingresa tu correo electrónico registrado.');
      return;
    }

    const res = requestPasswordReset(recoveryEmail);
    if (!res.success) {
      setRecoveryError(res.error || 'Error al solicitar el código.');
    } else {
      setRecoverySuccess(
        `Código enviado exitosamente a ${maskEmail(recoveryEmail)}. Por favor revisa tu bandeja de entrada o spam.`
      );
      setResendCooldown(60);
      setRecoveryStep(2);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    handleRequestCode();
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!recoveryCode.trim() || recoveryCode.trim().length !== 6) {
      setRecoveryError('Ingresa el código numérico de seguridad de 6 dígitos.');
      return;
    }

    setRecoverySuccess('Código verificado con éxito. Establece tu nueva contraseña segura.');
    setRecoveryStep(3);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (newPassword.length < 6) {
      setRecoveryError('La contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    const res = resetPassword(recoveryEmail, recoveryCode, newPassword);
    if (!res.success) {
      setRecoveryError(res.error || 'No se pudo actualizar la contraseña.');
    } else {
      setSuccessMessage('¡Contraseña cambiada exitosamente! Ya puedes iniciar sesión con tu nueva clave.');
      setIdentifier(recoveryEmail);
      setPassword('');
      setRecoveryMode(false);
      setRecoveryStep(1);
      setRecoveryCode('');
      setNewPassword('');
      setConfirmNewPassword('');
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
            {recoveryMode
              ? 'Recuperación de Contraseña'
              : mode === 'login'
              ? 'Iniciar Sesión en Overflows'
              : 'Crear Cuenta Comunitaria'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {recoveryMode
              ? 'Proceso seguro paso a paso para restablecer el acceso a tu cuenta comunitaria.'
              : mode === 'login'
              ? 'Accede al sistema comunitario de alerta temprana y monitoreo de quebradas.'
              : 'Regístrate para publicar reportes de cauces y recibir avisos preventivos de crecientes.'}
          </p>
        </div>

        {/* RECOVERY MODE VIEW */}
        {recoveryMode ? (
          <div className="space-y-5">
            {/* Step Progress Bar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className={recoveryStep >= 1 ? 'text-[#8B0000]' : 'text-slate-400'}>
                  1. Correo
                </span>
                <span className="text-slate-300">→</span>
                <span className={recoveryStep >= 2 ? 'text-[#8B0000]' : 'text-slate-400'}>
                  2. Código
                </span>
                <span className="text-slate-300">→</span>
                <span className={recoveryStep >= 3 ? 'text-[#8B0000]' : 'text-slate-400'}>
                  3. Nueva Contraseña
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#8B0000] h-full transition-all duration-300"
                  style={{ width: recoveryStep === 1 ? '33%' : recoveryStep === 2 ? '66%' : '100%' }}
                />
              </div>
            </div>

            {/* Recovery Feedback Messages */}
            {recoveryError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{recoveryError}</span>
              </div>
            )}
            {recoverySuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            {/* STEP 1: Correo de Recuperación */}
            {recoveryStep === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Correo electrónico registrado
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="ejemplo@overflowsaltavista.org"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Te enviaremos un código de seguridad de 6 dígitos para validar tu identidad.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMode(false);
                      setRecoveryError(null);
                      setRecoverySuccess(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Enviar Código</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Código de Verificación */}
            {recoveryStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                {/* Security Confirmation: Code sent to email, NOT shown on screen */}
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-xs sm:text-sm text-sky-950">
                        Código enviado a tu correo electrónico
                      </p>
                      <p className="text-xs text-sky-900/90 mt-1 leading-relaxed">
                        Hemos despachado un código confidencial de 6 dígitos a{' '}
                        <strong className="font-mono text-slate-900 font-bold bg-white/80 px-1.5 py-0.5 rounded border border-sky-300">
                          {maskEmail(recoveryEmail)}
                        </strong>
                        . Revisa tu bandeja de entrada o la carpeta de correo no deseado (spam).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-sky-800 bg-sky-100/70 p-2 rounded-xl border border-sky-200/80">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    <span>
                      Por seguridad y privacidad, <strong>el código no se muestra en esta pantalla</strong>.
                    </span>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-sky-200/60">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        resendCooldown > 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-sky-800 hover:text-sky-950 hover:underline'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                      <span>
                        {resendCooldown > 0
                          ? `Reenviar código en ${resendCooldown}s`
                          : '¿No te llegó el correo? Reenviar código'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsInboxModalOpen(true)}
                      className="text-xs font-bold text-[#8B0000] hover:text-[#720000] hover:underline flex items-center gap-1 cursor-pointer ml-auto"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      <span>Abrir buzón de correo ({maskEmail(recoveryEmail)})</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ingresa el código numérico de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-center font-mono text-2xl tracking-widest font-black text-slate-900 placeholder-slate-300 focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    El código expira en 15 minutos a partir de su emisión.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={recoveryCode.length !== 6}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all ${
                      recoveryCode.length === 6
                        ? 'bg-[#8B0000] hover:bg-[#720000] text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Validar Código</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Establecer Nueva Contraseña */}
            {recoveryStep === 3 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nueva Contraseña Segura
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMode(false);
                      setRecoveryError(null);
                    }}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar y Volver al Login</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
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
                <span>Recordar sesión</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setRecoveryMode(true);
                  setRecoveryStep(1);
                  setRecoveryEmail(identifier.includes('@') ? identifier : '');
                  setRecoveryError(null);
                  setRecoverySuccess(null);
                }}
                className="font-bold text-[#8B0000] hover:text-[#720000] hover:underline cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>

            {/* Quick Demo Login Access */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Acceso Rápido de Prueba (Demo)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const res = login('sandovaldiazmariana23@gmail.com', 'admin2026');
                    if (res.success) {
                      setSuccessMessage('Sesión iniciada como Administrador.');
                      setTimeout(onSuccessRedirect, 500);
                    }
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-800">Mariana Sandoval</p>
                  <p className="text-[11px] text-[#8B0000] font-semibold">Administradora · Morro Plan</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = login('h.ruiz@overflowsaltavista.org', '123456');
                    if (res.success) {
                      setSuccessMessage('Sesión iniciada como Habitante.');
                      setTimeout(onSuccessRedirect, 500);
                    }
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs transition-colors cursor-pointer"
                >
                  <p className="font-bold text-slate-800">Don Hernando Ruiz</p>
                  <p className="text-[11px] text-slate-500 font-semibold">Habitante · San Pablo</p>
                </button>
              </div>
            </div>
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
          </>
        )}
      </div>

      {/* Data Privacy Modal */}
      <DataPrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Email Inbox Modal */}
      <EmailInboxModal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        targetEmail={recoveryEmail}
        onApplyCode={(code) => setRecoveryCode(code)}
      />
    </div>
  );
};
