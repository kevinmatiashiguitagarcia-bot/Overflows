import React, { useState } from 'react';
import {
  X,
  MapPin,
  FileText,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Waves,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface ChangeSectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

// Available Sectors and Associated Quebradas in Comuna 70 (Altavista)
const SECTORS_BY_QUEBRADA = [
  {
    quebradaName: 'Quebrada La Picacha / Aguas Frías',
    quebradaNameEn: 'La Picacha / Aguas Frías Stream',
    cuencaId: 'la-picacha',
    sectors: [
      'Vereda Aguas Frías Alta',
      'Sector Morro Plan',
      'Sector Droguería Aguas Frías',
      'Calle 31B / Altos del Castillo',
      'Sector Universidad de Medellín',
      'Puente Las Brisas (Calle 30)'
    ]
  },
  {
    quebradaName: 'Quebrada Altavista (Cauce Principal)',
    quebradaNameEn: 'Altavista Stream (Main Channel)',
    cuencaId: 'altavista',
    sectors: [
      'Vereda San Pablo (Calle 18)',
      'Vereda Buga - Patio Bonito',
      'Sector Central Altavista (Parque Principal)',
      'Sector Puente San Pablo (Calle 18)'
    ]
  },
  {
    quebradaName: 'Quebrada Buenavista',
    quebradaNameEn: 'Buenavista Stream',
    cuencaId: 'buenavista',
    sectors: [
      'Vereda El Corazón - El Morro',
      'Sector Ladrilleras San Judas',
      'Cerros Padre Amaya',
      'Escuela Rural Buenavista'
    ]
  },
  {
    quebradaName: 'Quebrada La Guayabala',
    quebradaNameEn: 'La Guayabala Stream',
    cuencaId: 'la-guayabala',
    sectors: [
      'Vereda San José del Manzanillo',
      'Vereda El Jardín',
      'Sector Las Camelias',
      'Retiro Hidráulico Rodeo Alto'
    ]
  },
  {
    quebradaName: 'Quebrada Las Cañadas',
    quebradaNameEn: 'Las Cañadas Stream',
    cuencaId: 'la-canada',
    sectors: [
      'Vereda La Esperanza',
      'Sector El Chispero (Zona de Ladera)',
      'Puente La Esperanza (Calle 18A)'
    ]
  }
];

export const ChangeSectorModal: React.FC<ChangeSectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, changeUserSector } = useAuth();
  const { language } = useThemeLanguage();

  // Stepper state: 1 = Sector, 2 = Motivo, 3 = Verificación
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form inputs
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [changeReason, setChangeReason] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Error and submission state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !currentUser) return null;

  const currentSector = currentUser.barrioSector;

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!selectedSector) {
      setErrorMessage(
        language === 'en'
          ? 'Please select the new sector or area you wish to move to.'
          : 'Por favor selecciona el nuevo sector o vereda al que deseas cambiarte.'
      );
      return;
    }
    if (selectedSector === currentSector) {
      setErrorMessage(
        language === 'en'
          ? 'The selected sector is the one currently assigned to you. Please choose another sector.'
          : 'El sector seleccionado es el mismo que tienes asignado actualmente. Por favor elige otro sector.'
      );
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!changeReason || changeReason.trim().length < 5) {
      setErrorMessage(
        language === 'en'
          ? 'Please provide a valid reason (minimum 5 characters) explaining the change.'
          : 'Por favor ingresa un motivo válido (mínimo 5 caracteres) explicando la razón del cambio.'
      );
      return;
    }
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordConfirm) {
      setErrorMessage(
        language === 'en'
          ? 'You must enter your current password to confirm your identity.'
          : 'Debes ingresar tu contraseña actual para confirmar tu identidad.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = changeUserSector(
        currentUser.id,
        selectedSector,
        changeReason,
        passwordConfirm
      );

      if (!result.success) {
        setErrorMessage(
          result.message || (language === 'en' ? 'Error updating residential sector.' : 'Error al actualizar el sector.')
        );
        setIsSubmitting(false);
        return;
      }

      onSuccess(
        language === 'en'
          ? 'Sector and assigned watershed updated successfully.'
          : result.message
      );
      handleClose();
    } catch {
      setErrorMessage(
        language === 'en'
          ? 'An unexpected error occurred while processing the request.'
          : 'Ocurrió un error inesperado al procesar la solicitud.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedSector('');
    setChangeReason('');
    setPasswordConfirm('');
    setErrorMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  const targetGroup = SECTORS_BY_QUEBRADA.find((g) =>
    g.sectors.includes(selectedSector)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 dark:bg-black/80 backdrop-blur-xs animate-in fade-in transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 flex flex-col transition-colors">
        
        {/* Header with Stepper Progress */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                  {language === 'en' ? 'Security & Territorial Assignment' : 'Seguridad & Asignación Territorial'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                  {language === 'en' ? 'Change Residential Sector / Stream' : 'Cambiar Sector o Quebrada'}
                </h2>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={language === 'en' ? 'Close modal' : 'Cerrar modal'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {/* Step 1 Pill */}
            <div
              className={`p-2 rounded-xl text-center border transition-all ${
                currentStep === 1
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 font-bold'
                  : currentStep > 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <div className="text-[10px] uppercase font-mono">{language === 'en' ? 'Step 1' : 'Paso 1'}</div>
              <div className="text-xs truncate font-bold">{language === 'en' ? 'New Sector' : 'Nuevo Sector'}</div>
            </div>

            {/* Step 2 Pill */}
            <div
              className={`p-2 rounded-xl text-center border transition-all ${
                currentStep === 2
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 font-bold'
                  : currentStep > 2
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <div className="text-[10px] uppercase font-mono">{language === 'en' ? 'Step 2' : 'Paso 2'}</div>
              <div className="text-xs truncate font-bold">{language === 'en' ? 'Reason' : 'Motivo'}</div>
            </div>

            {/* Step 3 Pill */}
            <div
              className={`p-2 rounded-xl text-center border transition-all ${
                currentStep === 3
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
              }`}
            >
              <div className="text-[10px] uppercase font-mono">{language === 'en' ? 'Step 3' : 'Paso 3'}</div>
              <div className="text-xs truncate font-bold">{language === 'en' ? 'Verification' : 'Verificación'}</div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SELECCIÓN DEL NUEVO SECTOR / QUEBRADA */}
          {currentStep === 1 && (
            <form onSubmit={handleNextFromStep1} className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">
                  {language === 'en' ? 'Currently assigned sector:' : 'Sector actual asignado:'}
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 block">
                  📍 {currentSector}
                </span>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'en' ? '1. Select your new sector or area:' : '1. Selecciona tu nuevo sector o vereda:'}
                </label>

                <div className="relative">
                  <select
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value);
                      setErrorMessage(null);
                    }}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      {language === 'en'
                        ? '-- Select sector or area in Comuna 70 --'
                        : '-- Seleccionar sector o vereda de la Comuna 70 --'}
                    </option>

                    {SECTORS_BY_QUEBRADA.map((group) => (
                      <optgroup
                        key={group.cuencaId}
                        label={`── ${language === 'en' ? group.quebradaNameEn : group.quebradaName} ──`}
                      >
                        {group.sectors.map((sector) => (
                          <option key={sector} value={sector} disabled={sector === currentSector}>
                            {sector} {sector === currentSector ? (language === 'en' ? '(Current)' : '(Actual)') : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  {language === 'en'
                    ? 'Early warnings and live hydrological telemetry will be calibrated based on this new georeferenced point.'
                    : 'Las alertas tempranas y la telemetría hidrológica en vivo se calibrarán de acuerdo a este nuevo punto georreferenciado.'}
                </p>
              </div>

              {selectedSector && targetGroup && (
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-950 dark:text-cyan-200 space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-900 dark:text-cyan-300">
                    <Waves className="w-4 h-4" />
                    <span>{language === 'en' ? 'Target Watershed:' : 'Microcuenca Receptora:'}</span>
                  </div>
                  <p className="font-extrabold text-sm">
                    {language === 'en' ? targetGroup.quebradaNameEn : targetGroup.quebradaName}
                  </p>
                  <p className="text-[11px] text-cyan-800 dark:text-cyan-400 mt-1">
                    {language === 'en'
                      ? '✓ Alert channel and specific preventive recommendations will be synchronized for this river segment.'
                      : '✓ Se sincronizará el canal de alertas y las recomendaciones preventivas específicas para este tramo del cauce.'}
                  </p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={!selectedSector || selectedSector === currentSector}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#720000] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'en' ? 'Continue to Step 2' : 'Continuar al Paso 2'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PREGUNTA OBLIGATORIA DE MOTIVO */}
          {currentStep === 2 && (
            <form onSubmit={handleNextFromStep2} className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'en' ? `Sector to assign: ${selectedSector}` : `Sector a asignar: ${selectedSector}`}</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {language === 'en'
                    ? 'For territorial traceability and community security reasons, we require recording the relocation reason.'
                    : 'Por motivos de trazabilidad territorial y seguridad comunitaria, requerimos registrar la razón de reubicación.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5">
                  {language === 'en'
                    ? 'What is the reason for changing sector / watershed?'
                    : '¿Por qué razón deseas cambiar de sector/quebrada?'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => {
                    setChangeReason(e.target.value);
                    setErrorMessage(null);
                  }}
                  rows={4}
                  required
                  placeholder={
                    language === 'en'
                      ? 'Briefly describe reason (e.g. moved to a new home, work in this sector, closer to the stream...)'
                      : 'Describe brevemente el motivo (ej. cambio de domicilio a nueva vivienda, jornada de trabajo en este sector, mayor cercanía al cauce...)'
                  }
                  className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{language === 'en' ? 'Mandatory (min 5 characters)' : 'Obligatorio (mínimo 5 caracteres)'}</span>
                  <span className="font-mono">{changeReason.length} car.</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
                </button>

                <button
                  type="submit"
                  disabled={changeReason.trim().length < 5}
                  className="px-6 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#720000] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{language === 'en' ? 'Continue to Verification' : 'Continuar a Verificación'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: VERIFICACIÓN DE SEGURIDAD (CONTRASEÑA ACTUAL) */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'en' ? 'Mandatory Identity Confirmation' : 'Confirmación de Identidad Obligatoria'}</span>
                </div>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  {language === 'en'
                    ? 'To prevent unauthorized changes to your hydrological directives and evacuation routes, enter your current password.'
                    : 'Para prevenir cambios no autorizados en tus directrices hidrológicas y rutas de evacuación comunitaria, ingresa tu contraseña actual.'}
                </p>
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-indigo-500 dark:text-indigo-400 block">
                      {language === 'en' ? 'Previous Sector:' : 'Sector Anterior:'}
                    </span>
                    <span className="font-bold">{currentSector}</span>
                  </div>
                  <div>
                    <span className="text-indigo-500 dark:text-indigo-400 block">
                      {language === 'en' ? 'New Sector:' : 'Nuevo Sector:'}
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedSector}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-1.5">
                  {language === 'en' ? 'Enter your current password:' : 'Ingresa tu contraseña actual:'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      setErrorMessage(null);
                    }}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (language === 'en' ? 'Hide' : 'Ocultar') : (language === 'en' ? 'Show' : 'Mostrar')}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'en'
                    ? 'Your password travels encrypted to authorize the residence update.'
                    : 'Tu clave viaja de forma cifrada para autorizar la actualización de residencia.'}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{language === 'en' ? 'Back' : 'Atrás'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !passwordConfirm}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (language === 'en' ? 'Saving changes...' : 'Guardando cambios...')
                      : (language === 'en' ? 'Confirm and Save Change' : 'Confirmar y Guardar Cambio')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
