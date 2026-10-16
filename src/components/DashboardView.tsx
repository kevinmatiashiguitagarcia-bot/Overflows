import React, { useState, useId } from 'react';
import { CUENCAS_LIST } from '../data/cuencasData';
import { CuencaData } from '../types';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  Waves,
  MapPin,
  TrendingDown,
  TrendingUp,
  Activity,
  Gauge
} from 'lucide-react';

interface DashboardProps {
  onNavigateToMap?: (cuencaId?: string) => void;
  onOpenCuencaModal?: (cuenca: CuencaData) => void;
}

export const DashboardView: React.FC<DashboardProps> = () => {
  const { currentUser } = useAuth();
  const { t, language } = useThemeLanguage();
  const gradientId = useId();
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Compute user assigned cuenca ID based on sector
  const userAssignedCuencaId = React.useMemo(() => {
    if (currentUser?.barrioSector) {
      const s = currentUser.barrioSector.toLowerCase();
      if (s.includes('aguas frías') || s.includes('aguas frias') || s.includes('morro plan') || s.includes('picacha') || s.includes('brisas')) return 'la-picacha';
      if (s.includes('esperanza') || s.includes('chispero') || s.includes('cañada')) return 'la-canada';
      if (s.includes('morro') || s.includes('corazón') || s.includes('corazon') || s.includes('buenavista') || s.includes('san judas')) return 'buenavista';
      if (s.includes('manzanillo') || s.includes('jardín') || s.includes('jardin') || s.includes('guayabala')) return 'la-guayabala';
    }
    return 'la-picacha';
  }, [currentUser?.barrioSector]);

  // Dedicated cuenca record for this user
  const activeCuenca = CUENCAS_LIST.find((c) => c.id === userAssignedCuencaId) || CUENCAS_LIST[0];

  // Simplified flow telemetry history points (meters)
  const historyData = React.useMemo(() => {
    const baseLevel = activeCuenca.currentLevel;
    // 6 time steps: -50m, -40m, -30m, -20m, -10m, Ahora
    const offsets = [-0.06, -0.04, -0.02, -0.01, +0.01, 0];
    const timeLabels = language === 'en'
      ? ['-50 min', '-40 min', '-30 min', '-20 min', '-10 min', 'Now']
      : ['-50 min', '-40 min', '-30 min', '-20 min', '-10 min', 'Ahora'];

    return offsets.map((offset, idx) => {
      const level = Math.max(0.15, Number((baseLevel + offset).toFixed(2)));
      return {
        label: timeLabels[idx],
        level,
        percentage: Math.round((level / activeCuenca.maxThreshold) * 100)
      };
    });
  }, [activeCuenca.currentLevel, activeCuenca.maxThreshold, language]);

  // Determine status visual attributes
  const isAlert = activeCuenca.status === 'alerta_naranja' || activeCuenca.status === 'alerta_roja';
  const isWatch = activeCuenca.status === 'alerta_amarilla';

  const statusLabel = isAlert
    ? (language === 'en' ? 'Orange Alert' : 'Alerta Naranja')
    : isWatch
    ? (language === 'en' ? 'Yellow Alert' : 'Alerta Amarilla')
    : (language === 'en' ? 'Safe / Normal Flow' : 'Caudal Seguro / Normal');

  const statusColorClasses = isAlert
    ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60'
    : isWatch
    ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60';

  const dotColorClass = isAlert ? 'bg-rose-500' : isWatch ? 'bg-amber-500' : 'bg-emerald-500';

  // SVG Chart Geometry
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const minLevel = 0;
  const maxLevel = Math.max(activeCuenca.maxThreshold * 0.7, 1.5);

  const getX = (index: number) => paddingX + (index / (historyData.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minLevel) / (maxLevel - minLevel)) * chartHeight;

  // Build SVG path points
  const points = historyData.map((d, i) => ({ x: getX(i), y: getY(d.level), ...d }));

  // Smooth line path
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const thresholdY = getY(activeCuenca.maxThreshold * 0.5);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* TARJETA PRINCIPAL: MI QUEBRADA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* Encabezado: Nombre de la Quebrada y Estado de Alerta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Waves className="w-6 h-6 text-emerald-300" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {t('nav.dashboard') || 'Mi Quebrada'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Quebrada {activeCuenca.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{currentUser?.barrioSector || activeCuenca.sector}</span>
              </p>
            </div>
          </div>

          {/* Badge de Alerta de Cauce */}
          <div className="self-start sm:self-auto">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border ${statusColorClasses}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${dotColorClass} animate-pulse`} />
              <span>{statusLabel}</span>
            </span>
          </div>
        </div>

        {/* Métricas Principales de Nivel del Cauce */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          {/* 1. Nivel Actual en Metros */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span>Nivel del Cauce</span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {activeCuenca.currentLevel.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">m</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Umbral de desborde: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeCuenca.maxThreshold.toFixed(2)} m</span>
            </div>
          </div>

          {/* 2. Capacidad y Porcentaje */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span>Capacidad Utilizada</span>
              <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                {activeCuenca.capacityPercentage}%
              </span>
            </div>
            {/* Barra de progreso de capacidad */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  activeCuenca.capacityPercentage > 70
                    ? 'bg-rose-500'
                    : activeCuenca.capacityPercentage > 45
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${activeCuenca.capacityPercentage}%` }}
              />
            </div>
          </div>

          {/* 3. Margen de Seguridad */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <span>Margen Libre</span>
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                {activeCuenca.margin}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">cm libres</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold flex items-center gap-1">
              <span>✓ Flujo laminar en cota segura</span>
            </div>
          </div>
        </div>

        {/* Gráfica Simplificada y Limpia del Comportamiento del Flujo */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Comportamiento del Flujo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evolución del nivel en metros durante la última hora
              </p>
            </div>

            {/* Tooltip dinámico o indicador de tendencia */}
            <div className="text-right">
              {activePointIndex !== null ? (
                <div className="text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">{historyData[activePointIndex].label}:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {historyData[activePointIndex].level.toFixed(2)} m
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Caudal Estable</span>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico SVG Responsive Limpio */}
          <div className="w-full overflow-hidden rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-2 sm:p-4 border border-slate-200/80 dark:border-slate-800">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-40 sm:h-48 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Guía horizontal de umbral preventivo */}
              <line
                x1={paddingX}
                y1={thresholdY}
                x2={svgWidth - paddingX}
                y2={thresholdY}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeOpacity="0.5"
              />
              <text
                x={svgWidth - paddingX - 4}
                y={thresholdY - 6}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono"
              >
                Cota de Referencia Preventiva
              </text>

              {/* Área del caudal con degradado */}
              <path d={areaPath} fill={`url(#${gradientId})`} />

              {/* Línea principal suave de caudal */}
              <path
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos y etiquetas de tiempo */}
              {points.map((p, idx) => (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActivePointIndex(idx)}
                  onMouseLeave={() => setActivePointIndex(null)}
                >
                  {/* Zona de toque ampliada */}
                  <circle cx={p.x} cy={p.y} r={14} fill="transparent" />

                  {/* Punto visual */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activePointIndex === idx ? 6 : 4}
                    className={`transition-all duration-150 ${
                      activePointIndex === idx
                        ? 'fill-white stroke-emerald-600 stroke-3 dark:fill-slate-900'
                        : 'fill-emerald-500 stroke-white stroke-2 dark:stroke-slate-900'
                    }`}
                  />

                  {/* Valor en metros sobre el punto */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className={`text-[11px] font-mono font-bold transition-opacity ${
                      activePointIndex === idx
                        ? 'fill-slate-900 dark:fill-white opacity-100'
                        : 'fill-slate-500 dark:fill-slate-400 opacity-80'
                    }`}
                  >
                    {p.level.toFixed(2)}m
                  </text>

                  {/* Etiqueta de tiempo en eje horizontal */}
                  <text
                    x={p.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
