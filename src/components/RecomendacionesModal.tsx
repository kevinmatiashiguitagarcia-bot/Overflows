import React from 'react';
import {
  X,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Package,
  Home,
  BellRing,
  ExternalLink,
  MapPin,
  Waves
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QUEBRADAS_MAP_DATA, getPointGoogleMapsUrl } from '../data/quebradaMapsData';

interface RecomendacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCuencaId?: string;
}

export const RecomendacionesModal: React.FC<RecomendacionesModalProps> = ({
  isOpen,
  onClose,
  selectedCuencaId
}) => {
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  // Resolve active cuenca based on sector or passed selectedCuencaId
  const userSector = currentUser?.barrioSector || '';
  const s = userSector.toLowerCase();

  let activeId = selectedCuencaId;
  if (!activeId) {
    if (s.includes('aguas frías') || s.includes('aguas frias') || s.includes('morro plan') || s.includes('picacha') || s.includes('brisas')) {
      activeId = 'la-picacha';
    } else if (s.includes('morro') || s.includes('corazón') || s.includes('corazon') || s.includes('buenavista') || s.includes('san judas')) {
      activeId = 'buenavista';
    } else if (s.includes('manzanillo') || s.includes('jardín') || s.includes('jardin') || s.includes('guayabala')) {
      activeId = 'la-guayabala';
    } else {
      activeId = 'altavista';
    }
  }

  const cuencaConfig = QUEBRADAS_MAP_DATA[activeId] || QUEBRADAS_MAP_DATA['la-picacha'] || QUEBRADAS_MAP_DATA['altavista'];
  const evacPoint = cuencaConfig.evacuationPoint;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-amber-50/50 dark:bg-amber-950/20 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                  Sector {currentUser?.barrioSector || cuencaConfig.name}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Protocolo Hidrológico
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
                Recomendaciones
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Pautas hiperlocales de protección y resguardo para Quebrada {cuencaConfig.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dynamic Instructions based strictly on the selected sector */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Acciones Preventivas en la Quebrada</span>
            </div>

            {cuencaConfig.specificInstructions.map((instruction) => (
              <div
                key={instruction.step}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  {instruction.step}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {instruction.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {instruction.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 transition-colors">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0 mt-0.5">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Morral de Emergencia Familiar
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Tenga a mano copias plastificadas de documentos, linterna con baterías de repuesto, botiquín básico y agua potable.
                </p>
              </div>
            </div>
          </div>

          {/* Strictly verified safe location for this sector */}
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lugar Seguro Verificado del Sector</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-700">
                100% Georreferenciado
              </span>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-black text-emerald-950 dark:text-emerald-100">
                {evacPoint.name}
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{evacPoint.address}</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                Capacidad de albergue: <strong className="font-mono">{evacPoint.capacity} personas</strong> · {evacPoint.contact}
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-end">
              <a
                href={getPointGoogleMapsUrl(evacPoint)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Punto Exacto en Google Maps</span>
              </a>
            </div>
          </div>

          {/* Emergency Contacts Banner */}
          <div className="p-4 rounded-2xl bg-red-950 dark:bg-red-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-red-900/80 shadow-xs">
            <div className="text-center sm:text-left">
              <div className="text-[11px] font-bold text-red-300 uppercase tracking-wide">
                Línea Directa de Auxilio y Rescate Comuna 70
              </div>
              <div className="text-lg sm:text-xl font-black font-mono mt-0.5">
                Bomberos Medellín · 119
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:119"
                className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Marcar 119 Bomberos</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-b-3xl text-right transition-colors">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
