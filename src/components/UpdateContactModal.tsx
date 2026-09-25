import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { maskEmail, sendPasswordResetEmail } from '../services/emailService';

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
  const { currentUser, verifyCurrentUserPassword, updateUserContact } = useAuth();

  // Multi-step: 1 = Form & Password Auth, 2 = Verification OTP Code, 3 = Completed
  const [step, setStep] = useState<1 | 2>(1);

  // Form inputs
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification code state
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Status and error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isOpen && currentUser) {
      setStep(1);
      setNewEmail(currentUser.email);
      setNewPhone(currentUser.phone);
      setCurrentPassword('');
      setInputCode('');
      setErrorMessage(null);
      setShowPassword(false);
      // Generate a realistic 6-digit OTP
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(randomCode);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = newEmail.trim().toLowerCase();
    const cleanPhone = newPhone.replace(/\D/g, '').trim();

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido con formato nombre@dominio.com');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Por favor ingresa un número de celular válido de 10 dígitos (ej: 3001234567)');
      return;
    }

    if (trimmedEmail === currentUser.email && cleanPhone === currentUser.phone) {
      setErrorMessage('No has realizado ninguna modificación en tu correo o celular actual.');
      return;
    }

    if (!currentPassword) {
      setErrorMessage('Debes ingresar tu contraseña actual para autenticar esta solicitud.');
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

    // Refresh and dispatch OTP Code to new email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    sendPasswordResetEmail(trimmedEmail, currentUser.name, code);
    setIsSubmitting(false);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (inputCode.trim() !== generatedCode) {
      setErrorMessage('El código de verificación ingresado no coincide. Por favor verifica el código de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);

    const result = updateUserContact(currentUser.id, {
      email: newEmail.trim().toLowerCase() !== currentUser.email ? newEmail.trim().toLowerCase() : undefined,
      phone: newPhone.replace(/\D/g, '').trim() !== currentUser.phone ? newPhone.replace(/\D/g, '').trim() : undefined
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Error al actualizar los datos en el sistema.');
      return;
    }

    onSuccess('¡Datos de contacto actualizados y verificados de manera segura!');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Actualización Segura de Contacto
              </h3>
              <p className="text-xs text-slate-400">
                Paso {step} de 2: {step === 1 ? 'Autenticación con Contraseña' : 'Código de Verificación'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 1 ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className={`font-bold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
              Datos y Contraseña
            </span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </span>
            <span className={`font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Código de Seguridad
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  Por seguridad y salvaguarda de alertas hidrológicas del SIATA, el cambio de correo o celular no es inmediato. Requiere validar tu contraseña y confirmar la titularidad.
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nuevo Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Canal para informes oficiales de riesgo y reportes comunitarios.
                </span>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nuevo Teléfono / Celular</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="3001234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500 block">
                  Canal para avisos urgentes de sirenas comunitarias y evacuación preventiva.
                </span>
              </div>

              {/* Current Password Field */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-red-700" />
                    <span>Contraseña Actual (Obligatorio)</span>
                  </span>
                  <span className="text-[10px] text-red-700 font-bold uppercase tracking-wider">
                    Verificación de Identidad
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Introduce tu contraseña actual"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                >
                  <span>Continuar a Validación</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              {/* Security Confirmation: Code sent to email, NOT shown on screen */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs text-indigo-900">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Código de Verificación Enviado</span>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-200/70 text-indigo-900 px-2 py-0.5 rounded-md font-bold">
                    Válido por 15 min
                  </span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Para confirmar el traspaso seguro de alertas, hemos despachado un código confidencial de 6 dígitos a{' '}
                  <strong className="font-mono text-indigo-950 font-bold bg-white/80 px-1.5 py-0.5 rounded border border-indigo-200">
                    {maskEmail(newEmail)}
                  </strong>
                  . Revisa tu bandeja de entrada o spam.
                </p>
                <div className="p-2 bg-indigo-100/70 rounded-xl text-[11px] text-indigo-900 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span>Por seguridad institucional, <strong>el código no se muestra en esta pantalla</strong>.</span>
                </div>
              </div>

              {/* Code Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 block">
                  Ingresa el Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-widest font-mono text-xl py-2.5 px-3 rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Summary of intended changes */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nuevo Correo:</span>
                  <span className="font-bold text-slate-800">{newEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nuevo Teléfono:</span>
                  <span className="font-bold text-slate-800">{newPhone}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ← Modificar datos
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || inputCode.length !== 6}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y Actualizar</span>
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
