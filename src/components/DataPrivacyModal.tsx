import React from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DataPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950">
                Política de Tratamiento de Datos Personales
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Conforme a la Ley 1581 de 2012 (Habeas Data) y Estándares de Privacidad Digital
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Cerrar política"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 font-medium">
              En <strong>Overflows Altavista</strong> la privacidad y seguridad de la comunidad es una prioridad. Su información se utiliza estrictamente para salvaguardar vidas mediante alertas hidrológicas tempranas.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#8B0000]" />
              <span>1. Responsable del Tratamiento</span>
            </h3>
            <p className="text-slate-600 pl-5">
              El Sistema de Salvaguarda y Monitoreo Hidrológico Comunitario <strong>Overflows Altavista</strong> (Comuna 70 de Medellín, Antioquia), con domicilio operativo en el corregimiento de Altavista.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#8B0000]" />
              <span>2. Datos Objeto de Tratamiento</span>
            </h3>
            <p className="text-slate-600 pl-5 mb-2">
              Para su registro en el sistema se solicitan los siguientes datos básicos:
            </p>
            <ul className="list-disc list-inside pl-5 space-y-1 text-slate-600 text-xs">
              <li>Nombre completo del habitante.</li>
              <li>Dirección de correo electrónico de contacto.</li>
              <li>Número de teléfono o celular (para comunicaciones de emergencia).</li>
              <li>Sector, vereda o tramo de residencia en la Comuna 70 (Altavista).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#8B0000]" />
              <span>3. Finalidades Específicas del Tratamiento</span>
            </h3>
            <ul className="list-disc list-inside pl-5 space-y-1.5 text-slate-600 text-xs">
              <li>
                <strong>Alerta Temprana Hidrológica:</strong> Notificación inmediata a habitantes ante crecientes súbitas o desbordamiento de las quebradas según lecturas SIATA y reportes ciudadanos.
              </li>
              <li>
                <strong>Evacuación Preventiva:</strong> Envío de indicaciones hacia los puntos de encuentro seguros de su vereda en caso de alerta naranja o roja.
              </li>
              <li>
                <strong>Verificación de Reportes Comunitarios:</strong> Permitir que los avisos fotográficos sobre el estado del cauce cuenten con autoría verificada.
              </li>
              <li>
                <strong>No Comercialización:</strong> Sus datos <strong>NUNCA</strong> serán vendidos, cedidos ni usados para fines publicitarios, electorales ni comerciales.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#8B0000]" />
              <span>4. Derechos del Titular (Habeas Data)</span>
            </h3>
            <p className="text-slate-600 pl-5 mb-2">
              De acuerdo con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013, usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside pl-5 space-y-1.5 text-slate-600 text-xs">
              <li>Conocer, actualizar y rectificar sus datos personales en cualquier momento.</li>
              <li>Solicitar prueba de la autorización otorgada al momento del registro.</li>
              <li>
                <strong>Derecho de Supresión (Eliminación Total):</strong> Revocar la autorización y solicitar la eliminación definitiva de su cuenta y todos sus datos almacenados a través del menú de usuario con verificación de seguridad.
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Al marcar la casilla de aceptación en el registro, usted manifiesta de forma previa, expresa e informada su autorización para el tratamiento de sus datos con los fines descritos.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
