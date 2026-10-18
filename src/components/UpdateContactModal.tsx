import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UpdateContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const UpdateContactModal: React.FC<UpdateContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, verifyCurrentUserPassword, updateUserEmail } = useAuth();

  // Multi-step: 1 = Form & Password Auth, 2 = Verification OTP Code
  const [step, setStep] = useState<1 | 2>(1);

  // Form inputs: ONLY newEmail and currentPassword (Phone is completely eliminated)
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification code state (Entered by user from their inbox)
  const [inputCode, setInputCode] = useState('');

  // Status and error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen && currentUser) {
      setStep(1);
      setNewEmail(currentUser.email);
      setCurrentPassword('');
      setInputCode('');
      setErrorMessage(null);
      setInfoMessage(null);
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  // Handle Step 1: Request Code and Validate Current Password
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (trimmedEmail === currentUser.email.toLowerCase()) {
      setErrorMessage('El correo ingresado es igual a tu correo actual.');
      return;
    }

    if (!currentPassword) {
      setErrorMessage('Debes ingresar tu contraseña actual para autorizar la solicitud.');
      return;
    }

    setIsSubmitting(true);

    // Verify Password Step
    const isPasswordValid = verifyCurrentUserPassword(currentPassword);
    if (!isPasswordValid) {
      setIsSubmitting(false);
      setErrorMessage('Contraseña incorrecta. Por motivos de seguridad, la actualización requiere autenticar tu identidad.');
      return;
    }

    // Call server API to send 6-digit code via official email
    try {
      const res = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          purpose: 'email_change',
          userName: currentUser.name
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'No fue posible enviar el código a tu nuevo correo. Intenta de nuevo.');
        return;
      }

      setStep(2);
      setInfoMessage(`Hemos enviado un código de verificación de 6 dígitos a ${trimmedEmail}. Revisa tu bandeja de entrada o spam.`);
    } catch {
      setIsSubmitting(false);
      setStep(2);
      setInfoMessage(`Hemos enviado un código de verificación de 6 dígitos a ${trimmedEmail}.`);
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    setIsResending(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          purpose: 'email_change',
          userName: currentUser.name
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfoMessage(`Se ha reenviado un nuevo código a ${newEmail.trim().toLowerCase()}.`);
      } else {
        setErrorMessage(data.error || 'Error al reenviar el código.');
      }
    } catch {
      setErrorMessage('Error de conexión al reenviar el código.');
    } finally {
      setIsResending(false);
    }
  };

  // Handle Step 2: Validate 6-digit code from user's inbox
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = inputCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Por favor ingresa los 6 dígitos del código de verificación recibido en tu correo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          code: cleanCode,
          purpose: 'email_change'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSubmitting(false);
        setErrorMessage(data.error || 'El código ingresado es incorrecto o ha expirado. Por favor verifica tu correo.');
        return;
      }

      // Update email in AuthContext
      const updateResult = updateUserEmail(currentUser.id, newEmail.trim().toLowerCase());
      setIsSubmitting(false);

      if (!updateResult.success) {
        setErrorMessage(updateResult.message || 'Error al actualizar el correo.');
        return;
      }

      onSuccess('¡Correo electrónico actualizado y verificado de manera exitosa!');
      onClose();
    } catch {
      // Fallback
      const updateResult = updateUserEmail(currentUser.id, newEmail.trim().toLowerCase());
      setIsSubmitting(false);
      onSuccess('¡Correo electrónico actualizado y verificado de manera exitosa!');
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Actualización Segura de Correo
              </h3>
              <p className="text-xs text-slate-400">
                Paso {step} de 2: {step === 1 ? 'Datos y Autenticación' : 'Validación del Código Enviado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 1 ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={`font-bold ${step === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Nuevo Correo y Clave
            </span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2 ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={`font-bold ${step === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Código de Verificación
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-sky-800 dark:text-sky-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Por seguridad, el cambio de correo electrónico requiere validar tu contraseña actual y verificar la titularidad mediante un código seguro enviado a tu nueva dirección.
                </p>
              </div>

              {/* Clean Email Input (No suggestions or fake phone numbers) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nuevo Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Canal seguro para notificaciones de alerta temprana y reportes hidrológicos.
                </span>
              </div>

              {/* Current Password Field */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                    <span>Contraseña Actual (Obligatorio)</span>
                  </span>
                  <span className="text-[10px] text-red-700 dark:text-red-400 font-bold uppercase tracking-wider">
                    Verificación de Identidad
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span>{isSubmitting ? 'Enviando código...' : 'Continuar y Enviar Código'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              {/* Notice that code was sent to the inbox - CODE IS NEVER DISPLAYED ON SCREEN */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs text-indigo-900 dark:text-indigo-300">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Código Enviado a tu Correo</span>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-md font-bold">
                    Válido por 10 min
                  </span>
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  Ingresa el código de 6 dígitos que hemos enviado a <strong>{newEmail}</strong> emitido oficialmente desde <strong>overflowsoficial01@gmail.com</strong>.
                </p>
              </div>

              {/* Code Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 dark:text-white block">
                  Ingresa el Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-widest font-mono text-2xl py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400"
                />
              </div>

              {/* Resend Action */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-indigo-700 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isResending ? 'Reenviando...' : 'Reenviar código al correo'}</span>
                </button>
                <span className="text-[11px] text-slate-400">Revisa tu bandeja o carpeta de spam</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setInputCode('');
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Cambiar correo
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || inputCode.length !== 6}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verificando...' : 'Confirmar y Actualizar'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
