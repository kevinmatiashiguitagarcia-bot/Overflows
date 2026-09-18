import React from 'react';
import { CuencaData } from '../types';
import {
  X,
  AlertTriangle,
  BatteryCharging,
  Gauge,
  TrendingUp,
  MapPin,
  Clock,
  Radio,
  Waves,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CuencaDetailModalProps {
  cuenca: CuencaData | null;
  onClose: () => void;
  onGoToMap: () => void;
}

export const CuencaDetailModal: React.FC<CuencaDetailModalProps> = ({
  cuenca,
  onClose,
  onGoToMap
}) => {
  if (!cuenca) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-slate-900 to-cyan-900 text-white flex items-center justify-center font-black">
              <Waves className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ficha Técnica Cuenca
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    cuenca.status === 'seguro'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {cuenca.status === 'seguro' ? 'Seguro Verde' : 'Alerta Naranja'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                Quebrada {cuenca.name}
              </h2>
              <p className="text-xs text-slate-500">{cuenca.sector}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs text-slate-500 font-medium">Capacidad</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                {cuenca.capacityPercentage}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs text-slate-500 font-medium">Nivel Actual</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                {cuenca.currentLevel} <span className="text-xs font-normal">m</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs text-slate-500 font-medium">Caudal</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                {cuenca.flowRate} <span className="text-xs font-normal">m³/s</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-xs text-slate-500 font-medium">Velocidad</div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                {cuenca.speed} <span className="text-xs font-normal">m/s</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Descripción Hidrográfica
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              {cuenca.description}
            </p>
          </div>

          {/* Critical Points in this basin */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Puntos Críticos de Monitoreo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cuenca.criticalPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SIATA Station & Community Specs */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 font-sans">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Estación Oficial SIATA</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">{cuenca.siataStationId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-400 font-sans">Nombre estación:</span>{' '}
                <span className="text-white font-sans font-medium">{cuenca.siataStationName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Lluvia SIATA:</span>{' '}
                <span className="text-amber-400 font-bold">{cuenca.rainIntensityMmH} mm/h</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Cota Máxima:</span> {cuenca.maxThreshold} m
              </div>
              <div>
                <span className="text-slate-400 font-sans">Margen Creciente:</span> {cuenca.margin} cm
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 font-sans text-[11px] text-slate-300">
              <span className="text-slate-400 font-medium">Estado según reportes ciudadanos:</span>{' '}
              <strong className="text-emerald-300">{cuenca.communityStatus}</strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToMap();
            }}
            className="px-6 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Ver en Mapa Satelital</span>
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
