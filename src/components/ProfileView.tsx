import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Waves,
  Edit3,
  Camera,
  Check,
  X,
  Compass,
  AlertTriangle,
  Loader2,
  ScanFace,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { UpdateContactModal } from './UpdateContactModal';
import { ChangeSectorModal } from './ChangeSectorModal';
import { validateHumanFaceBiometrics } from '../utils/faceBiometricValidator';

interface ProfileViewProps {
  onBackToDashboard: () => void;
  onOpenDeleteVerification: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onBackToDashboard,
  onOpenDeleteVerification,
  onOpenPrivacyPolicy
}) => {
  const { currentUser, updateUserName, updateUserAvatar } = useAuth();
  const { language } = useThemeLanguage();

  const [updateContactOpen, setUpdateContactOpen] = useState(false);
  const [changeSectorOpen, setChangeSectorOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [nameError, setNameError] = useState<string | null>(null);

  // Biometric Photo Validation State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);
  const [biometricAlert, setBiometricAlert] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto my-12 transition-colors">
        <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No has iniciado sesión</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Inicia sesión para ver tu perfil de habitante y gestionar tu información personal.
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-xl bg-[#8B0000] text-white text-xs font-bold cursor-pointer"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  const formattedDate = new Date(currentUser.createdAt).toLocaleDateString(
    language === 'en' ? 'en-US' : 'es-CO',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
  );

  const isAdmin = currentUser.role === 'administrador';

  const handleUpdateSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Name editing save handler
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    const res = updateUserName(currentUser.id, trimmed);
    if (res.success) {
      setIsEditingName(false);
      handleUpdateSuccess('Nombre actualizado correctamente.');
    } else {
      setNameError(res.message);
    }
  };

  // File selection & biometric face detection handler
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected if desired
    e.target.value = '';

    setBiometricAlert(null);
    setIsScanningBiometrics(true);

    try {
      // 1. Read image as Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Perform Biometric Face Validation (rejects landscapes, vehicles, objects, avatars without real face)
      const validation = await validateHumanFaceBiometrics(dataUrl);

      if (!validation.isHumanFace) {
        // EXACT required alert message on rejection
        setBiometricAlert({
          type: 'error',
          message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.'
        });
        setIsScanningBiometrics(false);
        return;
      }

      // 3. Biometric check passed: save avatar to user account
      const updateRes = updateUserAvatar(currentUser.id, dataUrl);
      if (updateRes.success) {
        setBiometricAlert({
          type: 'success',
          message: '✓ Biometría facial verificada: Rostro humano reconocido exitosamente.'
        });
        handleUpdateSuccess('Foto de perfil actualizada correctamente.');
      } else {
        setBiometricAlert({
          type: 'error',
          message: updateRes.message || 'Error al guardar la foto de perfil.'
        });
      }
    } catch (err) {
      console.error('Error al procesar foto de perfil:', err);
      setBiometricAlert({
        type: 'error',
        message: 'Acceso no concedido: La foto de perfil debe ser una fotografía clara de una persona.'
      });
    } finally {
      setIsScanningBiometrics(false);
    }
  };

  // Delete photo and revert to default avatar with initials
  const handleDeletePhoto = () => {
    const res = updateUserAvatar(currentUser.id, '');
    if (res.success) {
      setBiometricAlert(null);
      handleUpdateSuccess('Foto de perfil eliminada. Se muestra tu avatar con iniciales.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 transition-colors">
      {successToast && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white hover:text-emerald-200 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with back button - Cleaned without static "Rol: Habitante Residente" tag */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Monitoreo</span>
        </button>

        {isAdmin && (
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-800">
            Administrador
          </span>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        
        {/* User Identity Banner: Avatar + Name Editor */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          
          {/* Avatar with Biometric Upload Trigger */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden border-2 border-slate-200 dark:border-slate-800">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}

              {/* Scanning visual overlay */}
              {isScanningBiometrics && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <ScanFace className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-mono mt-1 text-cyan-200">Escaneando...</span>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoFileChange}
              className="hidden"
            />

            {/* Quick action button to trigger photo upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanningBiometrics}
              className="absolute -bottom-1 -right-1 p-2.5 rounded-2xl bg-slate-900 hover:bg-[#8B0000] text-white shadow-md transition-all cursor-pointer border border-slate-700 hover:scale-105"
              title="Cargar foto de perfil (con validación biométrica facial)"
            >
              {isScanningBiometrics ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* User Details & Name Editor */}
          <div className="flex-1 w-full">
            {/* Inline Name Editing Form */}
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      setNameError(null);
                    }}
                    required
                    placeholder="Tu nombre completo"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                    title="Guardar nombre"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(currentUser.name);
                      setNameError(null);
                    }}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {nameError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{nameError}</p>
                )}
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  {currentUser.name}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(currentUser.name);
                    setIsEditingName(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Modificar nombre completo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{currentUser.barrioSector} · Corregimiento de Altavista</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Registrado desde el {formattedDate}
            </p>

            {/* Simplified action buttons: "Cambiar foto" and "Eliminar foto" */}
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanningBiometrics}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#8B0000] dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cambiar foto</span>
              </button>

              {currentUser.avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={isScanningBiometrics}
                  className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Eliminar foto de perfil y restaurar avatar con iniciales"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar foto</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Biometric Validation Feedback Banner */}
        {biometricAlert && (
          <div
            className={`mt-4 p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 animate-in fade-in ${
              biometricAlert.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-900'
            }`}
          >
            {biometricAlert.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="leading-relaxed">{biometricAlert.message}</p>
              {biometricAlert.type === 'error' && (
                <p className="text-[11px] font-normal text-rose-700 dark:text-rose-300 mt-1">
                  El sistema biométrico requiere un retrato humano frontal donde el rostro sea claramente visible y no un objeto, paisaje o ilustración.
                </p>
              )}
            </div>
            <button
              onClick={() => setBiometricAlert(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Email Card with secure edit trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Correo Electrónico</span>
                </div>
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                  Verificado
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white break-all">{currentUser.email}</p>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 inline-block">
                ✓ Canal habilitado para notificaciones de alerta temprana
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setUpdateContactOpen(true)}
                className="text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Actualizar correo (Flujo Seguro con Verificación)</span>
              </button>
            </div>
          </div>

          {/* Sector Card WITH VISIBLE "Cambiar sector" BUTTON */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <span>Sector / Vereda de Residencia</span>
                </div>
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                  Comuna 70
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.barrioSector}</p>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 inline-block">
                Cuenca y margen de protección hidrológica asignada
              </span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Corregimiento Altavista · Medellín
              </span>
              
              {/* Visible "Cambiar sector" Button */}
              <button
                type="button"
                onClick={() => setChangeSectorOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Cambiar sector</span>
              </button>
            </div>
          </div>

          {/* Data Protection Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 sm:col-span-2 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Protección de Datos Personales (Habeas Data)</span>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Ley 1581 de 2012
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Tus datos están protegidos y son utilizados exclusivamente para la emisión de avisos de seguridad y salvaguarda comunitaria ante crecientes súbitas.
            </p>
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-xs text-[#8B0000] dark:text-red-400 font-bold hover:underline mt-2 inline-block cursor-pointer"
            >
              Consultar Política de Tratamiento de Datos Personales →
            </button>
          </div>
        </div>

        {/* Basin Protection & Community Info (Official email text removed as requested) */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 mb-6 flex items-start gap-3">
          <Waves className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
            <strong className="font-bold">Permisos de Visualización:</strong>{' '}
            {isAdmin
              ? 'Cuentas con acceso administrativo integral para supervisar todas las quebradas y cotas de la Comuna 70.'
              : 'Tu cuenta tiene acceso exclusivo a los datos y reportes de tu quebrada asignada, preservando la privacidad y focalización territorial.'}
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Eliminación de Cuenta Comunitaria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Borrado permanente de tus credenciales y reportes conforme a la Ley de Habeas Data.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDeleteVerification}
            className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 text-xs font-bold transition-colors cursor-pointer"
          >
            Eliminar Cuenta
          </button>
        </div>
      </div>

      {/* Secure Email Update Modal */}
      <UpdateContactModal
        isOpen={updateContactOpen}
        onClose={() => setUpdateContactOpen(false)}
        onSuccess={handleUpdateSuccess}
      />

      {/* Secure Sector Change Stepper Modal */}
      <ChangeSectorModal
        isOpen={changeSectorOpen}
        onClose={() => setChangeSectorOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};
