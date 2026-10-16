import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  ShieldCheck,
  Trash2,
  ArrowLeft,
  FileText,
  Sliders,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  onBackToDashboard: () => void;
  onOpenDeleteVerification: () => void;
  onOpenPrivacyPolicy: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBackToDashboard,
  onOpenDeleteVerification,
  onOpenPrivacyPolicy
}) => {
  const { currentUser } = useAuth();

  // Settings states
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  const [siataSync, setSiataSync] = useState<boolean>(true);
  const [communityNotifs, setCommunityNotifs] = useState<boolean>(true);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setSavedFeedback('Preferencias guardadas correctamente.');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Monitoreo</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sliders className="w-4 h-4 text-slate-600" />
          <span>Configuración del Sistema</span>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* 1. Hydrological Alerts Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Notificaciones y Alertas Hidrológicas
            </h2>
            <p className="text-xs text-slate-500">
              Personaliza cómo recibir avisos sobre crecientes en las quebradas de Altavista
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-slate-600" />
                <span>Alarma Sonora de Emergencia</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Emite tono acústico cuando una quebrada supere la cota de alerta naranja o roja.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-600" />
                <span>Avisos Comunitarios de Vecinos</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Recibir alertas cuando habitantes reporten palizadas o aumento súbito del cauce.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={communityNotifs}
                onChange={(e) => setCommunityNotifs(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B0000]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Sincronización Oficial con Radar SIATA
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Actualizar datos telemétricos de lluvia y cotas hidrológicas cada minuto.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={siataSync}
                onChange={(e) => setSiataSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Guardar Preferencias
          </button>
        </div>
      </div>

      {/* 2. Privacy and Data Policy Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Tratamiento de Datos Personales
            </h2>
            <p className="text-xs text-slate-500">
              Protección conforme a la Ley 1581 de 2012 (Habeas Data)
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Usted otorgó autorización para el uso de sus datos exclusivamente para la salvaguarda de vidas y coordinación ante crecientes hidrológicas. Puede consultar los términos completos o revocar su autorización en cualquier momento eliminando su cuenta.
        </p>

        <button
          type="button"
          onClick={onOpenPrivacyPolicy}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span>Ver Política Completa de Tratamiento de Datos</span>
        </button>
      </div>

      {/* 3. Account Deletion Section */}
      {currentUser && (
        <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-7 border border-rose-200 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Eliminar Cuenta y Datos Personales
              </h3>
              <p className="text-xs text-slate-500">
                Proceso de verificación para supresión total de su cuenta y revocación del tratamiento de datos
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Esta acción borrará de manera definitiva su nombre, correo, teléfono e historial comunitario del sistema Overflows Altavista.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenDeleteVerification}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Iniciar Verificación de Eliminación</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
