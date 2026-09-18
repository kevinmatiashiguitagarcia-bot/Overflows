import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface BannerAlertProps {
  onOpenRecommendations: () => void;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({ onOpenRecommendations }) => {
  return (
    <div className="bg-[#b43e12] text-white border-y border-[#92320e] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded bg-white/15 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 text-amber-200" />
          </div>
          <div className="leading-snug">
            <span className="font-extrabold tracking-wide uppercase">
              ESTADO DE ALERTA AMARILLA / NARANJA: PRECAUCIÓN ACTIVA
            </span>
            <span className="mx-2 hidden sm:inline opacity-60">·</span>
            <span className="opacity-95 font-medium">
              Precipitaciones intensas registradas en cabecera de Altavista (SIATA / DAGRD Radar 04-B)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-7 sm:pl-0">
          <span className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">
            ACTUALIZADO HACE 4 MIN
          </span>
          <button
            onClick={onOpenRecommendations}
            className="font-bold underline underline-offset-2 hover:text-amber-200 flex items-center gap-1 transition-colors text-xs sm:text-sm"
          >
            <span>Ver recomendaciones barriales</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
