import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
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
  FileText,
  KeyRound,
  RotateCcw,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

interface AuthViewProps {
  onSuccessRedirect: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessRedirect }) => {
  const { currentUser, login, register, loginWithGoogle, checkUserExists, resetPassword } = useAuth();
  const { theme, toggleTheme, language, setLanguage, t } = useThemeLanguage();

  // Mode: 'login' | 'register' | 'recovery'
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');

  // Login form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form fields
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [barrioSector, setBarrioSector] = useState(SECTORS_LIST[0]);
  const [dataTreatmentAccepted, setDataTreatmentAccepted] = useState(false);

  // Recovery form fields (3-step flow)
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [maskedTarget, setMaskedTarget] = useState<string>('');

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage(t('auth.err_empty_identifier'));
      return;
    }
    if (!password) {
      setErrorMessage(t('auth.err_empty_password'));
      return;
    }

    const res = login(identifier, password);
    if (!res.success) {
      setErrorMessage(res.error || t('auth.err_invalid_credentials'));
    } else {
      setSuccessMessage(t('auth.success_login'));
      setTimeout(() => {
        onSuccessRedirect();
      }, 600);
    }
  };

  // Handle Google Sign-In
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMessage(t('auth.success_google'));
        setTimeout(() => {
          onSuccessRedirect();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Error al autenticar con Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!dataTreatmentAccepted) {
      setErrorMessage(t('auth.err_data_treatment'));
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
      setSuccessMessage(t('auth.success_register'));
      setTimeout(() => {
        onSuccessRedirect();
      }, 700);
    }
  };

  // Handle Recovery Step 1: Request Code
  const handleRecoveryStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!recoveryIdentifier.trim()) {
      setErrorMessage(t('auth.err_empty_identifier'));
      return;
    }

    const check = checkUserExists(recoveryIdentifier);
    if (!check.exists) {
      setErrorMessage(t('auth.err_user_not_found'));
      return;
    }

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setMaskedTarget(check.maskedIdentifier || recoveryIdentifier);
    setRecoveryStep(2);
    setSuccessMessage(`${t('recovery.code_sent')} [Código de verificación: ${code}]`);
  };

  // Handle Recovery Step 2: Validate Code
  const handleRecoveryStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredCode.trim() !== generatedCode) {
      setErrorMessage('El código de verificación no coincide. Por favor revisa e ingresa los 6 dígitos.');
      return;
    }

    setRecoveryStep(3);
    setSuccessMessage('Código verificado con éxito. Procede a ingresar tu nueva contraseña.');
  };

  // Handle Recovery Step 3: Save New Password
  const handleRecoveryStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage(t('auth.err_short_password'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('recovery.err_passwords_dont_match'));
      return;
    }

    const res = resetPassword(recoveryIdentifier, newPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al actualizar la contraseña.');
      return;
    }

    setSuccessMessage(t('recovery.success'));
    setTimeout(() => {
      setMode('login');
      setRecoveryStep(1);
      setRecoveryIdentifier('');
      setEnteredCode('');
      setNewPassword('');
      setConfirmPassword('');
      setPassword('');
    }, 1800);
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-2">
      {/* Top Controls: Dark/Light Mode & Language Selector directly accessible on Login/Register */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={onSuccessRedirect}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('nav.map')}</span>
            </button>
          )}
        </div>

        {/* Global Accessible Theme & Language Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{t('theme.light')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">{t('theme.dark')}</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Auth Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        {/* Brand Header */}
        <div className="text-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            {mode === 'recovery'
              ? t('recovery.title')
              : mode === 'login'
              ? t('auth.login_title')
              : t('auth.register_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {mode === 'recovery'
              ? t('recovery.step1_desc')
              : mode === 'login'
              ? t('auth.login_subtitle')
              : t('auth.register_subtitle')}
          </p>
        </div>

        {/* Mode Switcher Tabs (Only if not in recovery) */}
        {mode !== 'recovery' && (
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-6 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.login_tab')}</span>
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
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('auth.register_tab')}</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('auth.email_or_phone')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('auth.email_or_phone_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {t('auth.password')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('recovery');
                    setRecoveryStep(1);
                    setRecoveryIdentifier(identifier);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-bold text-[#8B0000] dark:text-red-400 hover:underline cursor-pointer"
                >
                  {t('auth.forgot_password')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#8B0000] focus:ring-[#8B0000]"
                />
                <span>{t('auth.remember_me')}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.login_button')}</span>
            </button>

            {/* Social Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">
                  {t('auth.or_continue_with')}
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Conectando...' : t('auth.google_signin')}</span>
            </button>
          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('auth.full_name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.full_name_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="300 123 4567"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('auth.sector')}
              </label>
              <div className="relative">
                <select
                  value={barrioSector}
                  onChange={(e) => setBarrioSector(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden cursor-pointer"
                >
                  {SECTORS_LIST.map((s) => (
                    <option key={s} value={s} className="dark:bg-slate-800">
                      {s}
                    </option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('auth.create_password')}
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* MANDATORY DATA TREATMENT AUTHORIZATION */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataTreatmentAccepted}
                  onChange={(e) => setDataTreatmentAccepted(e.target.checked)}
                  required
                  className="mt-1 rounded border-slate-300 dark:border-slate-700 text-[#8B0000] focus:ring-[#8B0000] shrink-0"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {t('auth.data_treatment_consent')}
                </span>
              </label>

              <div className="pl-7">
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-xs text-[#8B0000] dark:text-red-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('auth.read_privacy_policy')}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!dataTreatmentAccepted}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                dataTreatmentAccepted
                  ? 'bg-[#8B0000] hover:bg-[#720000]'
                  : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-75'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('auth.register_button')}</span>
            </button>

            {/* Google Register Button */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">
                  {t('auth.or_continue_with')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Conectando...' : t('auth.google_register')}</span>
            </button>
          </form>
        )}

        {/* 3. PASSWORD RECOVERY GUIDED FLOW (3 STEPS) */}
        {mode === 'recovery' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Step Progress Tracker */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    recoveryStep === 1
                      ? 'bg-[#8B0000] text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  1
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Identificación
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    recoveryStep === 2
                      ? 'bg-[#8B0000] text-white'
                      : recoveryStep > 2
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  2
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Código
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">→</span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    recoveryStep === 3
                      ? 'bg-[#8B0000] text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  3
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Nueva Clave
                </span>
              </div>
            </div>

            {/* STEP 1: Identification */}
            {recoveryStep === 1 && (
              <form onSubmit={handleRecoveryStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('recovery.step1_title')}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {t('recovery.step1_desc')}
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder={t('auth.email_or_phone_placeholder')}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {t('recovery.back_to_login')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {t('recovery.send_code')}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Code Verification */}
            {recoveryStep === 2 && (
              <form onSubmit={handleRecoveryStep2} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('recovery.step2_title')}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Código enviado a <strong>{maskedTarget}</strong>
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-black focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedCode(code);
                      setSuccessMessage(`Nuevo código generado: ${code}`);
                    }}
                    className="text-[#8B0000] dark:text-red-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('recovery.resend_code')}</span>
                  </button>
                  <span className="font-mono text-slate-400">Válido 10 min</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {t('recovery.verify_code')}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {recoveryStep === 3 && (
              <form onSubmit={handleRecoveryStep3} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('recovery.new_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                    {t('recovery.confirm_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm shadow-xs cursor-pointer"
                  >
                    {t('recovery.save_password')}
                  </button>
                </div>
              </form>
            )}
          </div>
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
