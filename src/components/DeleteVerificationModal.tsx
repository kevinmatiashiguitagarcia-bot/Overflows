import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileWarning
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DeleteVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (message: string) => void;
}

export const DeleteVerificationModal: React.FC<DeleteVerificationModalProps> = ({
  isOpen,
  onClose,
  onDeleted
}) => {
  const { currentUser, verifyCurrentUserPassword, deleteAccount } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phraseInput, setPhraseInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const expectedPhrase = 'ELIMINAR MI CUENTA';
  const isPhraseMatch = phraseInput.trim().toUpperCase() === expectedPhrase;

  const handleAdvanceToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwordInput.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña actual.');
      return;
    }

    const isValid = verifyCurrentUserPassword(passwordInput);
    if (!isValid) {
      setErrorMsg('La contraseña ingresada no es correcta. No se puede proceder.');
      return;
    }

    setStep(2);
  };

  const handleFinalDelete = () => {
    setErrorMsg(null);
    if (!isPhraseMatch) {
      setErrorMsg(`Debes escribir exactamente la frase "${expectedPhrase}" para confirmar.`);
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      const result = deleteAccount(currentUser.id, passwordInput);
      setIsDeleting(false);
      handleResetAndClose();
      onDeleted(result.message);
    }, 600);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setPasswordInput('');
    setPhraseInput('');
    setShowPassword(false);
    setErrorMsg(null);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
      onClick={handleResetAndClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-rose-200 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with step indicator */}
        <div className="p-5 sm:p-6 bg-rose-50 border-b border-rose-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                  Acción Irreversible
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Paso {step} de 2
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                {step === 1 ? 'Autenticación y Advertencia de Seguridad' : 'Confirmación Definitiva de Supresión'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            title="Cancelar y cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 1 ? (
          /* STEP 1: CONSECUENCIAS & REQUERIMIENTO DE CONTRASEÑA ACTUAL */
          <form onSubmit={handleAdvanceToStep2} className="p-6 space-y-4">
            {/* Account Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Cuenta a eliminar:</span>
              </div>
              <div className="text-slate-700 font-medium">
                <p><strong>Titular:</strong> {currentUser.name}</p>
                <p><strong>Correo:</strong> {currentUser.email}</p>
                <p><strong>Sector Registrado:</strong> {currentUser.barrioSector}</p>
              </div>
            </div>

            {/* Clear consequences warning */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileWarning className="w-4 h-4 text-amber-600" />
                <span>Consecuencias obligatorias del borrado:</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc leading-relaxed">
                <li>
                  <strong className="text-slate-800">Supresión definitiva de datos personales:</strong> Se eliminará el registro de acuerdo con la Ley 1581 de 2012 (Habeas Data).
                </li>
                <li>
                  <strong className="text-slate-800">Cierre de sesión permanente:</strong> No podrás acceder ni recuperar los reportes ciudadanos asociados a esta cuenta.
                </li>
                <li>
                  <strong className="text-slate-800">Desvinculación de notificaciones:</strong> Se revocarán tus suscripciones a alertas preventivas para tu sector.
                </li>
              </ul>
            </div>

            {/* Step 1 Requirement: Enter current password */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                1. Confirma tu contraseña actual para verificar identidad:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Tu contraseña actual..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons for Step 1 */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!passwordInput.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  passwordInput.trim()
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continuar al Paso 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: CONFIRMACIÓN EXPLÍCITA CON FRASE DE SEGURIDAD */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Contraseña verificada con éxito.</strong>
                <p className="mt-0.5 text-amber-800">
                  Estás a punto de borrar definitivamente tu cuenta de <strong>{currentUser.name}</strong>. Esta acción no se puede deshacer de ninguna manera.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                2. Para confirmar el borrado, escribe exactamente la frase:
              </label>
              <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-center">
                <span className="font-mono text-sm font-black text-rose-700 tracking-wider select-all">
                  {expectedPhrase}
                </span>
              </div>
              <input
                type="text"
                value={phraseInput}
                onChange={(e) => {
                  setPhraseInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Escribe ELIMINAR MI CUENTA aquí..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">{errorMsg}</p>
              )}
            </div>

            {/* Footer Buttons for Step 2 */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMsg(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>

              <button
                type="button"
                onClick={handleFinalDelete}
                disabled={!isPhraseMatch || isDeleting}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isPhraseMatch && !isDeleting
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Destruyendo cuenta...' : 'Eliminar Cuenta Definitivamente'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
