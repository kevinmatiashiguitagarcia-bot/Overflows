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
  FileWarning
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

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
  const { language } = useThemeLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phraseInput, setPhraseInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const expectedPhrase = language === 'en' ? 'DELETE MY ACCOUNT' : 'ELIMINAR MI CUENTA';
  const isPhraseMatch = phraseInput.trim().toUpperCase() === expectedPhrase;

  const handleAdvanceToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!passwordInput.trim()) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter your current password.'
          : 'Por favor ingresa tu contraseña actual.'
      );
      return;
    }

    const isValid = verifyCurrentUserPassword(passwordInput);
    if (!isValid) {
      setErrorMsg(
        language === 'en'
          ? 'Incorrect password. Cannot proceed.'
          : 'La contraseña ingresada no es correcta. No se puede proceder.'
      );
      return;
    }

    setStep(2);
  };

  const handleFinalDelete = () => {
    setErrorMsg(null);
    if (!isPhraseMatch) {
      setErrorMsg(
        language === 'en'
          ? `You must type exactly "${expectedPhrase}" to confirm.`
          : `Debes escribir exactamente la frase "${expectedPhrase}" para confirmar.`
      );
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      const result = deleteAccount(currentUser.id, passwordInput);
      setIsDeleting(false);
      handleResetAndClose();
      onDeleted(
        language === 'en'
          ? 'Account successfully and permanently deleted.'
          : result.message
      );
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
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-rose-200 dark:border-rose-900 shadow-2xl overflow-hidden animate-in zoom-in-95 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with step indicator */}
        <div className="p-5 sm:p-6 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  {language === 'en' ? 'Irreversible Action' : 'Acción Irreversible'}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'en' ? `Step ${step} of 2` : `Paso ${step} de 2`}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {step === 1
                  ? (language === 'en' ? 'Authentication & Safety Warning' : 'Autenticación y Advertencia de Seguridad')
                  : (language === 'en' ? 'Permanent Account Deletion Confirmation' : 'Confirmación Definitiva de Supresión')}
              </h2>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={language === 'en' ? 'Cancel and close' : 'Cancelar y cerrar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 1 ? (
          /* STEP 1: CONSECUENCIAS & REQUERIMIENTO DE CONTRASEÑA ACTUAL */
          <form onSubmit={handleAdvanceToStep2} className="p-6 space-y-4">
            {/* Account Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{language === 'en' ? 'Account to delete:' : 'Cuenta a eliminar:'}</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-medium">
                <p><strong>{language === 'en' ? 'Holder:' : 'Titular:'}</strong> {currentUser.name}</p>
                <p><strong>{language === 'en' ? 'Email:' : 'Correo:'}</strong> {currentUser.email}</p>
                <p><strong>{language === 'en' ? 'Registered Sector:' : 'Sector Registrado:'}</strong> {currentUser.barrioSector}</p>
              </div>
            </div>

            {/* Clear consequences warning */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileWarning className="w-4 h-4 text-amber-600" />
                <span>{language === 'en' ? 'Mandatory deletion consequences:' : 'Consecuencias obligatorias del borrado:'}</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-4 list-disc leading-relaxed">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {language === 'en' ? 'Permanent personal data deletion:' : 'Supresión definitiva de datos personales:'}
                  </strong>{' '}
                  {language === 'en'
                    ? 'Records will be purged in compliance with Law 1581 of 2012 (Habeas Data).'
                    : 'Se eliminará el registro de acuerdo con la Ley 1581 de 2012 (Habeas Data).'}
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {language === 'en' ? 'Permanent session termination:' : 'Cierre de sesión permanente:'}
                  </strong>{' '}
                  {language === 'en'
                    ? 'You will not be able to log in or recover citizen reports associated with this account.'
                    : 'No podrás acceder ni recuperar los reportes ciudadanos asociados a esta cuenta.'}
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {language === 'en' ? 'Unlink early alerts:' : 'Desvinculación de notificaciones:'}
                  </strong>{' '}
                  {language === 'en'
                    ? 'Your preventive hydrological alert subscriptions for your sector will be revoked.'
                    : 'Se revocarán tus suscripciones a alertas preventivas para tu sector.'}
                </li>
              </ul>
            </div>

            {/* Step 1 Requirement: Enter current password */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                {language === 'en'
                  ? '1. Confirm your current password to verify identity:'
                  : '1. Confirma tu contraseña actual para verificar identidad:'}
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
                  placeholder={language === 'en' ? 'Your current password...' : 'Tu contraseña actual...'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Footer Buttons for Step 1 */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>

              <button
                type="submit"
                disabled={!passwordInput.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  passwordInput.trim()
                    ? 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{language === 'en' ? 'Continue to Step 2' : 'Continuar al Paso 2'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: CONFIRMACIÓN EXPLÍCITA CON FRASE DE SEGURIDAD */
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">
                  {language === 'en' ? 'Password verified successfully.' : 'Contraseña verificada con éxito.'}
                </strong>
                <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                  {language === 'en'
                    ? <>You are about to permanently delete your account for <strong>{currentUser.name}</strong>. This action cannot be undone under any circumstances.</>
                    : <>Estás a punto de borrar definitivamente tu cuenta de <strong>{currentUser.name}</strong>. Esta acción no se puede deshacer de ninguna manera.</>}
                </p>
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                {language === 'en'
                  ? '2. To confirm deletion, type the exact phrase:'
                  : '2. Para confirmar el borrado, escribe exactamente la frase:'}
              </label>
              <div className="mb-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-center">
                <span className="font-mono text-sm font-black text-rose-700 dark:text-rose-300 tracking-wider select-all">
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
                placeholder={language === 'en' ? `Type ${expectedPhrase} here...` : `Escribe ${expectedPhrase} aquí...`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5">{errorMsg}</p>
              )}
            </div>

            {/* Footer Buttons for Step 2 */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMsg(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'en' ? 'Back' : 'Volver'}</span>
              </button>

              <button
                type="button"
                onClick={handleFinalDelete}
                disabled={!isPhraseMatch || isDeleting}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isPhraseMatch && !isDeleting
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isDeleting
                    ? (language === 'en' ? 'Deleting account...' : 'Destruyendo cuenta...')
                    : (language === 'en' ? 'Permanently Delete Account' : 'Eliminar Cuenta Definitivamente')}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
