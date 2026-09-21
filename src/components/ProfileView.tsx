import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Waves,
  Lock,
  Edit3,
  ShieldAlert,
  UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UpdateContactModal } from './UpdateContactModal';

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
  const { currentUser, toggleUserRole } = useAuth();
  const [updateContactOpen, setUpdateContactOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No has iniciado sesión</h2>
        <p className="text-xs text-slate-500 mb-6">
          Inicia sesión para ver tu perfil de habitante y gestionar tu información personal.
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-5 py-2.5 rounded-xl bg-[#8B0000] text-white text-xs font-bold"
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

  const formattedDate = new Date(currentUser.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isAdmin = currentUser.role === 'administrador';

  const handleUpdateSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {successToast && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white hover:text-emerald-200 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Monitoreo</span>
        </button>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 font-bold border border-indigo-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rol: Administrador (Supervisión Total)</span>
            </span>
          ) : (
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rol: Habitante Residente (Quebrada Asignada)</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        {/* User Identity Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950">
                {currentUser.name}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                  isAdmin
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isAdmin ? '🛡️ Administrador del Sistema' : 'Habitante Comuna 70'}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{currentUser.barrioSector} · Corregimiento de Altavista</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Registrado desde el {formattedDate}
            </p>
          </div>

          {/* Quick toggle for demonstration/testing */}
          <div className="shrink-0 self-center sm:self-start">
            <button
              type="button"
              onClick={() => toggleUserRole(currentUser.id)}
              className="text-[11px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Alternar entre rol Administrador y Habitante para verificar permisos"
            >
              <UserCog className="w-3.5 h-3.5 text-slate-500" />
              <span>Alternar Rol: {isAdmin ? 'Pasar a Habitante' : 'Pasar a Administrador'}</span>
            </button>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          {/* Email Card with secure edit trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>Correo Electrónico</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                  Seguro
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 break-all">{currentUser.email}</p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                ✓ Canal habilitado para notificaciones
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setUpdateContactOpen(true)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Actualizar correo (Flujo Seguro)</span>
              </button>
            </div>
          </div>

          {/* Phone Card with secure edit trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Teléfono / Celular</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                  Seguro
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-mono">{currentUser.phone}</p>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                ✓ Alertas de emergencia prioritarias
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setUpdateContactOpen(true)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Actualizar celular (Flujo Seguro)</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span>Sector / Vereda de Residencia</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{currentUser.barrioSector}</p>
            <span className="text-[10px] text-slate-500 mt-1 inline-block">
              Comuna 70 Medellín (Área de influencia de quebradas)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Protección de Datos (Habeas Data)</span>
            </div>
            <p className="text-xs font-bold text-emerald-800">
              Autorización Vigente (Ley 1581 de 2012)
            </p>
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-[11px] text-[#8B0000] font-bold hover:underline mt-1 block cursor-pointer"
            >
              Consultar cláusulas de privacidad →
            </button>
          </div>
        </div>

        {/* Security Notification Banner */}
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="text-xs text-sky-950 leading-relaxed">
            <strong className="font-bold">Política de Seguridad de Contacto:</strong> Para garantizar la autenticidad de las notificaciones hidrológicas, el cambio de correo electrónico y número celular requiere verificación en dos pasos (autenticación obligatoria con tu contraseña actual y código de confirmación temporal).
          </div>
        </div>

        {/* Basin Protection & Community Role Info */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-6 flex items-start gap-3">
          <Waves className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <strong className="font-bold">Permisos de Visualización:</strong> {isAdmin ? 'Cuentas con acceso administrativo integral para supervisar todas las quebradas y cotas de la Comuna 70.' : 'Tu cuenta tiene acceso exclusivo a los datos y reportes de tu quebrada asignada, preservando la privacidad y focalización territorial.'}
          </div>
        </div>

        {/* Danger Zone: Verification Deletion */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Gestión de Datos y Eliminación
            </h4>
            <p className="text-xs text-slate-500">
              Usted puede ejercer su derecho de supresión eliminando definitivamente su cuenta y registros personales.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenDeleteVerification}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Eliminar Mi Cuenta</span>
          </button>
        </div>
      </div>

      {/* Modal for secure step-by-step contact updates */}
      <UpdateContactModal
        isOpen={updateContactOpen}
        onClose={() => setUpdateContactOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};
