import React, { useState, useEffect, useId, useMemo, useRef } from 'react';
import { CUENCAS_LIST } from '../data/cuencasData';
import { QUEBRADAS_MAP_DATA } from '../data/quebradaMapsData';
import { CuencaData } from '../types';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useCuenca } from '../context/CuencaContext';
import {
  Waves,
  MapPin,
  TrendingDown,
  TrendingUp,
  Activity,
  Gauge,
  Radio,
  CloudRain,
  Mountain,
  Compass,
  AlertTriangle,
  ChevronDown,
  Home,
  Lock,
  ArrowLeft,
  User,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface DashboardProps {
  onNavigateToMap?: (cuencaId?: string) => void;
  onOpenCuencaModal?: (cuenca: CuencaData) => void;
  onOpenReportModal?: () => void;
  onNavigateToProfile?: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  onNavigateToMap,
  onOpenCuencaModal,
  onOpenReportModal,
  onNavigateToProfile
}) => {
  const { currentUser } = useAuth();
  const { t, language } = useThemeLanguage();
  const {
    selectedCuencaId,
    setSelectedCuencaId,
    activeCuenca,
    assignedCuenca,
    isExploring,
    isAdmin,
    canSubmitReports,
    resetToAssigned
  } = useCuenca();

  const gradientId = useId();
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Close stream selector dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userAssignedCuencaId = assignedCuenca.id;
  const isViewingAssigned = !isExploring;

  const mapProfile = useMemo(() => {
    return (
      QUEBRADAS_MAP_DATA[activeCuenca.id] ||
      QUEBRADAS_MAP_DATA['altavista'] ||
      QUEBRADAS_MAP_DATA['la-picacha']
    );
  }, [activeCuenca.id]);

  // Sector display text
  const sectorDisplayName = isViewingAssigned
    ? currentUser?.barrioSector || activeCuenca.sector
    : activeCuenca.sector;

  // 2. Continuous Real-Time SIATA Synchronization Engine
  const [telemetryTick, setTelemetryTick] = useState(0);
  const [secondsSinceLastReading, setSecondsSinceLastReading] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryTick((prev) => prev + 1);
      setSecondsSinceLastReading(0);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceLastReading((prev) => (prev < 60 ? prev + 1 : 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute live fluctuating values around the baseline
  const {
    liveLevel,
    liveCapacity,
    liveMarginCm,
    liveFlowRate,
    liveRainIntensity,
    trendDirection
  } = useMemo(() => {
    const wave = Math.sin(telemetryTick * 0.75) * 0.02 + Math.cos(telemetryTick * 0.35) * 0.01;
    const baseLvl = activeCuenca.currentLevel;
    const lvl = Math.max(0.2, Number((baseLvl + wave).toFixed(2)));
    const cap = Math.min(100, Math.max(10, Math.round((lvl / activeCuenca.maxThreshold) * 100)));
    const margin = Math.round(Math.max(15, (activeCuenca.maxThreshold - lvl) * 100));
    const flow = Number((activeCuenca.flowRate + wave * 0.4).toFixed(2));
    const rain = Number((activeCuenca.rainIntensityMmH + Math.abs(Math.sin(telemetryTick * 0.5)) * 0.1).toFixed(1));

    return {
      liveLevel: lvl,
      liveCapacity: cap,
      liveMarginCm: margin,
      liveFlowRate: flow,
      liveRainIntensity: rain,
      trendDirection: wave >= 0 ? 'estable_sube' : 'estable_baja'
    };
  }, [activeCuenca.currentLevel, activeCuenca.maxThreshold, activeCuenca.flowRate, activeCuenca.rainIntensityMmH, telemetryTick]);

  // Historical 6-point chart data synced dynamically with live stream
  const historyData = useMemo(() => {
    const timeLabels =
      language === 'en'
        ? ['-50 min', '-40 min', '-30 min', '-20 min', '-10 min', 'Live']
        : ['-50 min', '-40 min', '-30 min', '-20 min', '-10 min', 'En Vivo'];

    const staticOffsets = [-0.05, -0.03, -0.01, +0.01, -0.01];

    const pts = staticOffsets.map((off, idx) => {
      const l = Math.max(0.2, Number((activeCuenca.currentLevel + off).toFixed(2)));
      return {
        label: timeLabels[idx],
        level: l,
        percentage: Math.round((l / activeCuenca.maxThreshold) * 100)
      };
    });

    pts.push({
      label: timeLabels[5],
      level: liveLevel,
      percentage: liveCapacity
    });

    return pts;
  }, [activeCuenca.currentLevel, activeCuenca.maxThreshold, language, liveLevel, liveCapacity]);

  // Determine status visual attributes
  const isAlert = activeCuenca.status === 'alerta_naranja' || activeCuenca.status === 'alerta_roja';
  const isWatch = activeCuenca.status === 'alerta_amarilla';

  const statusLabel = isAlert
    ? t('dashboard.orange_alert')
    : isWatch
    ? t('dashboard.yellow_alert')
    : t('dashboard.safe_normal_flow');

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
  const maxLevel = Math.max(activeCuenca.maxThreshold * 0.75, 1.6);

  const getX = (index: number) => paddingX + (index / (historyData.length - 1)) * chartWidth;
  const getY = (val: number) =>
    paddingTop + chartHeight - ((val - minLevel) / (maxLevel - minLevel)) * chartHeight;

  const points = historyData.map((d, i) => ({ x: getX(i), y: getY(d.level), ...d }));

  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const thresholdY = getY(activeCuenca.maxThreshold * 0.55);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 transition-colors">
      {/* TARJETA PRINCIPAL: MI QUEBRADA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* Top Control Bar: Stream Selector ("Ver otras quebradas") & Home Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
          
          {/* Status Badges: Admin vs Assigned vs Exploration */}
          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Administrador OVERFLOWS · Control Total</span>
              </span>
            ) : isViewingAssigned ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('dashboard.assigned_stream_badge')}</span>
              </span>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                  <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t('dashboard.exploration_mode_badge')}</span>
                </span>
                <button
                  type="button"
                  onClick={resetToAssigned}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title={t('dashboard.return_to_my_stream')}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{t('dashboard.return_to_my_stream')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Unified Selector Button / Dropdown: "Ver otras quebradas" */}
          <div className="relative" ref={selectorRef}>
            <button
              type="button"
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold transition-all shadow-2xs cursor-pointer"
            >
              <Waves className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('dashboard.explore_other_streams')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
            </button>

            {selectorOpen && (
              <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  {t('dashboard.explore_other_streams')}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {CUENCAS_LIST.map((cuenca) => {
                    const isUserHome = cuenca.id === userAssignedCuencaId;
                    const isSelected = cuenca.id === activeCuenca.id;

                    return (
                      <button
                        key={cuenca.id}
                        type="button"
                        onClick={() => {
                          setSelectedCuencaId(cuenca.id);
                          setSelectorOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-slate-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="pr-2 truncate">
                          <div className="font-bold flex items-center gap-1.5 truncate">
                            {isUserHome && (
                              <Home className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Tu cuenca de residencia" />
                            )}
                            <span className="truncate">
                              {language === 'en' ? `${cuenca.name} Stream` : `Quebrada ${cuenca.name}`}
                            </span>
                          </div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {cuenca.sector}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cuenca.capacityPercentage}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
        </div>

        {/* Exploration Mode Notice Banner for Citizens */}
        {isExploring && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-950 dark:text-amber-200">
                  {t('reports.exploration_mode_title')}: {language === 'en' ? `${activeCuenca.name} Stream` : `Quebrada ${activeCuenca.name}`}
                </p>
                <p className="text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                  {t('reports.exploration_mode_notice')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={resetToAssigned}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                {t('dashboard.return_to_my_stream')}
              </button>
              {onNavigateToProfile && (
                <button
                  type="button"
                  onClick={onNavigateToProfile}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-amber-300 dark:border-amber-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  {t('reports.btn_go_to_profile')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Encabezado: Nombre de la Quebrada, Sector y Estado en Tiempo Real SIATA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Waves className="w-7 h-7 text-emerald-300" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('dashboard.title')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{t('dashboard.live_siata_badge')}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-0.5">
                {language === 'en' ? `${activeCuenca.name} Stream` : `Quebrada ${activeCuenca.name}`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{t('dashboard.sector_label')} {sectorDisplayName}</span>
              </p>
            </div>
          </div>

          {/* Badge de Alerta e Indicador de Sincronización SIATA */}
          <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border ${statusColorClasses}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${dotColorClass} animate-pulse`} />
              <span>{statusLabel}</span>
            </span>
            <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>
                {t('dashboard.updated_ago')} {secondsSinceLastReading}s · {activeCuenca.siataStationId}
              </span>
            </div>
          </div>
        </div>

        {/* 1. MÉTRICAS COMPLETAS DE NIVEL Y CAUCE */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {t('dashboard.telemetry_title')}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {t('dashboard.sensor_label')} {activeCuenca.siataStationName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Métrica 1: Nivel Actual del Cauce */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{t('dashboard.channel_level')}</span>
                <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-950 dark:text-white tracking-tight">
                  {liveLevel.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">m</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center justify-between">
                <span>{t('dashboard.alert_threshold')}</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {activeCuenca.maxThreshold.toFixed(2)} m
                </span>
              </div>
            </div>

            {/* Métrica 2: Capacidad Utilizada */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{t('dashboard.channel_capacity')}</span>
                <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {liveCapacity}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    liveCapacity > 75
                      ? 'bg-rose-500'
                      : liveCapacity > 45
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${liveCapacity}%` }}
                />
              </div>
            </div>

            {/* Métrica 3: Margen Libre de Seguridad */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{t('dashboard.safety_margin')}</span>
                <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {liveMarginCm}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {t('dashboard.free_cm')}
                </span>
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-bold flex items-center gap-1">
                <span>{t('dashboard.safe_hydraulic_level')}</span>
              </div>
            </div>

            {/* Métrica 4: Caudal y Lluvia */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>{t('dashboard.flow_rain')}</span>
                <CloudRain className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {liveFlowRate}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">m³/s</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium flex items-center justify-between">
                <span>{t('dashboard.upper_basin_rain')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                  {liveRainIntensity} mm/h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. GRÁFICA EN TIEMPO REAL DEL COMPORTAMIENTO DEL FLUJO (100% i18n) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('dashboard.flow_behavior_title')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('dashboard.flow_sync_desc')}
              </p>
            </div>

            <div className="text-left sm:text-right">
              {activePointIndex !== null ? (
                <div className="text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">{historyData[activePointIndex].label}:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {historyData[activePointIndex].level.toFixed(2)} m
                  </span>
                  <span className="text-slate-400 ml-1.5 font-sans">
                    ({historyData[activePointIndex].percentage}%)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    {t('dashboard.continuous_flow_laminar')} · {trendDirection === 'estable_sube' ? '+1 cm' : '-1 cm'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico SVG Responsive Limpio */}
          <div className="w-full overflow-hidden rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 p-2 sm:p-4 border border-slate-200/80 dark:border-slate-800">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

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
                {t('dashboard.preventive_threshold')} ({activeCuenca.maxThreshold.toFixed(2)}m {t('dashboard.threshold_tag')})
              </text>

              <path d={areaPath} fill={`url(#${gradientId})`} />

              <path
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((p, idx) => (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setActivePointIndex(idx)}
                  onMouseLeave={() => setActivePointIndex(null)}
                >
                  <circle cx={p.x} cy={p.y} r={14} fill="transparent" />

                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activePointIndex === idx ? 6 : idx === points.length - 1 ? 5 : 4}
                    className={`transition-all duration-150 ${
                      activePointIndex === idx
                        ? 'fill-white stroke-emerald-600 stroke-3 dark:fill-slate-900'
                        : idx === points.length - 1
                        ? 'fill-emerald-400 stroke-emerald-700 stroke-2 animate-pulse'
                        : 'fill-emerald-500 stroke-white stroke-2 dark:stroke-slate-900'
                    }`}
                  />

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

                  <text
                    x={p.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 text-[11px] font-mono font-medium"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* 3. MORFOMETRÍA Y CARACTERÍSTICAS DEL CAUCE (100% i18n) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mountain className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                {t('dashboard.morphometry_title')}
              </h3>
            </div>
            {onNavigateToMap && (
              <button
                type="button"
                onClick={() => onNavigateToMap(activeCuenca.id)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t('dashboard.view_on_risk_map')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('dashboard.elevation_range')}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 font-mono">
                {mapProfile.elevationRange}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('dashboard.channel_length')}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 font-mono">
                {mapProfile.riverLengthKm} km
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('dashboard.average_slope')}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 font-mono">
                {mapProfile.averageSlope}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('dashboard.basin_area')}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 font-mono">
                {mapProfile.basinAreaHa} Ha
              </div>
            </div>
          </div>

          {/* Sector Crítico de Vigilancia del Cauce */}
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-amber-950 dark:text-amber-200">
                {t('dashboard.critical_watch_segment')}
              </span>
              <span className="text-amber-900 dark:text-amber-300 font-medium">
                {mapProfile.criticalSector}
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 font-bold self-start sm:self-auto">
              {t('dashboard.average_velocity')} {mapProfile.flowVelocity}
            </span>
          </div>
        </div>

        {/* 4. SECCIÓN DE REPORTE Y PERMISOS COMUNITARIOS DE RESIDENCIA */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                {isViewingAssigned ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {isViewingAssigned
                    ? t('dashboard.report_critical_segment_button')
                    : t('dashboard.exploration_mode_badge')}
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isViewingAssigned
                  ? t('dashboard.report_enabled_hint')
                  : language === 'en'
                  ? `Community Restriction Notice: You can only submit community reports for your official residential area (${assignedCuenca.name} Stream). To report on this basin, update your residential sector in My Profile.`
                  : `Aviso de Restricción Comunitaria: Solo puedes emitir reportes comunitarios para tu zona de residencia oficial (Quebrada ${assignedCuenca.name}). Para reportar sobre esta cuenca, actualiza tu sector de residencia desde Mi Perfil.`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {isViewingAssigned ? (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="px-4 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('dashboard.report_critical_segment_button')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center gap-2 cursor-not-allowed opacity-75"
                    title={language === 'en' ? 'Report submission locked outside your official residential area' : 'Emisión de reporte bloqueada fuera de tu zona de residencia'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('dashboard.report_critical_segment_button')}</span>
                  </button>

                  {onNavigateToProfile && (
                    <button
                      type="button"
                      onClick={onNavigateToProfile}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{t('nav.profile')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
