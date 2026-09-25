import React from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useSiataRealtime } from '../context/SiataRealtimeContext';

interface BannerAlertProps {
  onOpenRecommendations: () => void;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({ onOpenRecommendations }) => {
  const { overallAlertLevel, weather, lastSyncTime } = useSiataRealtime();

  const isNormal = overallAlertLevel === 'seguro';
  const isAmarilla = overallAlertLevel === 'alerta_amarilla';
  const isNaranja = overallAlertLevel === 'alerta_naranja';
  const isRoja = overallAlertLevel === 'alerta_roja';

  const bgColor = isNormal
    ? 'bg-emerald-900 text-emerald-100 border-y border-emerald-950'
    : isAmarilla
    ? 'bg-amber-800 text-amber-50 border-y border-amber-900'
    : isNaranja
    ? 'bg-[#b43e12] text-white border-y border-[#92320e]'
    : 'bg-rose-950 text-rose-100 border-y border-rose-900';

  return (
    <div className={`${bgColor} shadow-xs transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded bg-white/15 shrink-0 mt-0.5 sm:mt-0">
            {isNormal ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-200" />
            )}
          </div>
          <div className="leading-snug">
            <span className="font-extrabold tracking-wide uppercase">
              {isNormal
                ? 'ESTADO: TRANQUILIDAD Y NORMALIDAD HIDROLÓGICA'
                : isAmarilla
                ? 'ESTADO DE ALERTA AMARILLA: VIGILANCIA PREVENTIVA'
                : isNaranja
                ? 'ESTADO DE ALERTA NARANJA: PRECAUCIÓN ACTIVA'
                : 'ALERTA ROJA: EVACUACIÓN PREVENTIVA DE RIBERAS'}
            </span>
            <span className="mx-2 hidden sm:inline opacity-60">·</span>
            <span className="opacity-95 font-medium">
              {isNormal
                ? 'Cauces despejados con flujo seguro dentro de cotas normales en Comuna 70.'
                : `Precipitaciones detectadas (${weather.precipitationMmH.toFixed(1)} mm/h). Vigilancia activa en cuencas de Altavista.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-7 sm:pl-0">
          <span className="font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
            {lastSyncTime || 'EN TIEMPO REAL'}
          </span>
          <button
            onClick={onOpenRecommendations}
            className="font-bold underline underline-offset-2 hover:opacity-80 flex items-center gap-1 transition-opacity text-xs sm:text-sm cursor-pointer"
          >
            <span>Ver recomendaciones</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
