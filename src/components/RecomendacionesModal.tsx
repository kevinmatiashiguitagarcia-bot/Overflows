import React from 'react';
import {
  X,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Package,
  Home,
  BellRing,
  AlertTriangle
} from 'lucide-react';

interface RecomendacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecomendacionesModal: React.FC<RecomendacionesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Protocolo DAGRD Comuna 70
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                Recomendaciones Barriales
              </h2>
              <p className="text-xs text-slate-500">
                Acciones inmediatas ante Alerta Amarilla / Naranja en Altavista
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick steps */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Monitoreo constante del cauce y sonidos
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Si habita cerca a La Picacha, Buenavista o La Cañada, preste atención a cambios
                  súbitos en el color del agua (aumento de turbiedad o lodo) y al sonido de choque
                  de piedras. Esto indica una creciente en camino desde la cuenca alta.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-900 shrink-0 mt-0.5">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. Tenga listo el Morral de Supervivencia
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Asegure copias plastificadas de cédulas y escrituras, medicamentos de uso
                  continuo, linterna con pilas de repuesto, botiquín básico y agua potable.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 shrink-0 mt-0.5">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  3. Puntos de Encuentro y Rutas Seguras
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  El punto de encuentro oficial es la <strong>Cancha El Corazón</strong> y la{' '}
                  <strong>Escuela Vereda Aguas Frías</strong>. Nunca intente cruzar puentes
                  peatonales si el agua ya alcanza los estribos de soporte.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Banner */}
          <div className="p-4 rounded-2xl bg-red-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-xs font-bold text-red-300 uppercase tracking-wide">
                Línea Directa de Auxilio y Rescate
              </div>
              <div className="text-xl font-black font-mono">Bomberos Medellín · 119</div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:119"
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Marcar 119 Bomberos</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
