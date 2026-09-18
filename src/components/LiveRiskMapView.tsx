import React, { useState, useEffect } from 'react';
import { CUENCAS_LIST } from '../data/cuencasData';
import {
  QUEBRADAS_MAP_DATA,
  COMUNA_70_QUEBRADAS_NETWORK,
  QuebradaSensor,
  QuebradaEvacuationPoint,
  QuebradaNetworkBranch,
  QuebradaLandmark,
  getPointGoogleMapsUrl,
  getPointGoogleMapsDirectionsUrl,
  getPointGoogleMapsEmbedUrl
} from '../data/quebradaMapsData';
import {
  Radio,
  Layers,
  MapPin,
  AlertTriangle,
  Send,
  ShieldAlert,
  ChevronDown,
  Navigation,
  ZoomIn,
  ZoomOut,
  Crosshair,
  CheckCircle2,
  PhoneCall,
  Activity,
  Compass,
  Mountain,
  Gauge,
  Info,
  Clock,
  BatteryCharging,
  TrendingUp,
  X,
  Map,
  Globe,
  ExternalLink
} from 'lucide-react';

interface LiveRiskMapViewProps {
  initialCuencaId?: string;
  onOpenReportModal?: () => void;
}

export const LiveRiskMapView: React.FC<LiveRiskMapViewProps> = ({
  initialCuencaId = 'la-picacha',
  onOpenReportModal
}) => {
  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(initialCuencaId);
  const [activeLayers, setActiveLayers] = useState({
    inundacion: true,
    evacuacion: true,
    sensores: true,
    redCompleta: false
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapStyle, setMapStyle] = useState<'estandar' | 'satelite'>('estandar');
  const [selectedSensor, setSelectedSensor] = useState<QuebradaSensor | null>(null);
  const [selectedEvacPoint, setSelectedEvacPoint] = useState<QuebradaEvacuationPoint | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<QuebradaLandmark | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [showMapsEmbedInCard, setShowMapsEmbedInCard] = useState<boolean>(false);
  const [showMapsQuickList, setShowMapsQuickList] = useState<boolean>(false);

  useEffect(() => {
    if (initialCuencaId) {
      setSelectedCuencaId(initialCuencaId);
      setSelectedSensor(null);
      setSelectedEvacPoint(null);
      setSelectedLandmark(null);
      setSelectedBranchId(null);
      setShowMapsEmbedInCard(false);
      setZoomLevel(1);
    }
  }, [initialCuencaId]);

  // Retrieve dedicated data for selected quebrada
  const currentMap = QUEBRADAS_MAP_DATA[selectedCuencaId] || QUEBRADAS_MAP_DATA['la-picacha'];
  const cuencaMeta = CUENCAS_LIST.find((c) => c.id === selectedCuencaId) || CUENCAS_LIST[0];

  const handleSelectQuebrada = (id: string) => {
    setSelectedCuencaId(id);
    setSelectedSensor(null);
    setSelectedEvacPoint(null);
    setSelectedLandmark(null);
    setSelectedBranchId(null);
    setShowMapsEmbedInCard(false);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleRecenter = () => {
    setZoomLevel(1);
    setSelectedSensor(null);
    setSelectedEvacPoint(null);
    setSelectedLandmark(null);
    setSelectedBranchId(null);
    setShowMapsEmbedInCard(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dedicated Quebrada Selector Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Interactive Quebradas Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Seleccionar Quebrada:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {CUENCAS_LIST.map((cuenca) => {
              const isSelected = cuenca.id === selectedCuencaId;
              const isNetworkView = cuenca.id === 'red-comuna-70';
              const statusColor =
                cuenca.status === 'seguro'
                  ? 'bg-emerald-500'
                  : cuenca.status === 'alerta_amarilla'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              return (
                <button
                  key={cuenca.id}
                  onClick={() => handleSelectQuebrada(cuenca.id)}
                  title={isNetworkView ? 'Ver red integral de todas las quebradas' : `Desplegar exclusivamente la zona y cauce de la Quebrada ${cuenca.name}`}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? isNetworkView
                        ? 'bg-indigo-950 text-white shadow-sm ring-2 ring-indigo-400'
                        : 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                      : isNetworkView
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${statusColor} ${
                      cuenca.status !== 'seguro' ? 'animate-pulse' : ''
                    }`}
                  ></span>
                  <span>{isNetworkView ? 'Red Completa (9 Veredas)' : `Quebrada ${cuenca.name}`}</span>
                  <span
                    className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded ${
                      isSelected
                        ? isNetworkView
                          ? 'bg-indigo-900 text-indigo-200'
                          : 'bg-slate-800 text-slate-300'
                        : isNetworkView
                        ? 'bg-indigo-200/80 text-indigo-800'
                        : 'bg-slate-200/90 text-slate-600'
                    }`}
                  >
                    {cuenca.capacityPercentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Layer Toggles and Google Maps Link */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 flex-wrap">
          <span className="text-slate-400 font-medium">Capas:</span>

          {currentMap.id !== 'red-comuna-70' ? (
            <button
              onClick={() => handleSelectQuebrada('red-comuna-70')}
              className="px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Alternar a la vista de todas las quebradas de la Comuna 70"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ver Todas las Quebradas</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-950 border border-indigo-300 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Red Integral Activa</span>
            </span>
          )}

          <button
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, inundacion: !prev.inundacion }))
            }
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeLayers.inundacion
                ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            Área Inundación
          </button>

          <button
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, evacuacion: !prev.evacuacion }))
            }
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              activeLayers.evacuacion
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            Puntos Seguros
          </button>

          <button
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, sensores: !prev.sensores }))
            }
            className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
              activeLayers.sensores
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-800 animate-pulse" />
            <span>Estaciones SIATA ({currentMap.sensors.length})</span>
          </button>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Corregimiento+Altavista+Medellin+Quebradas"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {/* 2. Main Grid: Exclusive Map Canvas for this Quebrada + Right Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dedicated SVG Map Canvas */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Map Subtitle & Basin Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300">
                  {currentMap.id === 'red-comuna-70'
                    ? 'RED HIDROGRÁFICA INTEGRAL · 9 VEREDAS'
                    : `ZONA Y CAUCE AISLADO: QUEBRADA ${currentMap.name.toUpperCase()}`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                {currentMap.basinTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentMap.subtitle}</p>
            </div>

            <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
              {/* Map View Toggle: Estándar vs Satélite */}
              <div className="flex items-center bg-slate-800/95 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setMapStyle('estandar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapStyle === 'estandar'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Estándar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('satelite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mapStyle === 'satelite'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Satélite</span>
                </button>
              </div>

              {/* Quick Google Maps Points Explorer Button */}
              <button
                type="button"
                onClick={() => setShowMapsQuickList(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Abrir y mirar los puntos de esta quebrada en Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-200" />
                <span>Puntos en Google Maps</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-700/80 text-[10px] font-mono">
                  {currentMap.landmarks.length + currentMap.sensors.length + 1}
                </span>
              </button>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border ${currentMap.riskBadge.bg} ${currentMap.riskBadge.color} ${currentMap.riskBadge.border}`}
              >
                {currentMap.riskBadge.label}
              </span>
            </div>
          </div>

          {/* Dedicated Quebrada Isolation Notification Banner */}
          {currentMap.id !== 'red-comuna-70' ? (
            <div className="bg-sky-50 border-b border-sky-200/90 px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-sky-950">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse shrink-0"></span>
                <span>
                  Visualizando <strong>únicamente la zona y el cauce</strong> de la <strong>Quebrada {currentMap.name}</strong> ({currentMap.elevationRange}).
                </span>
              </div>
              <button
                onClick={() => handleSelectQuebrada('red-comuna-70')}
                className="text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer text-xs shrink-0"
              >
                Ver red completa de la Comuna 70 →
              </button>
            </div>
          ) : (
            <div className="bg-indigo-50 border-b border-indigo-200/90 px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-indigo-950">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-700 shrink-0" />
                <span>
                  Red Hídrica Integral activa: Mapeo de todas las quebradas de la Comuna 70. Para aislar una quebrada, selecciónala en la barra superior o haz clic sobre ella.
                </span>
              </div>
            </div>
          )}

          {/* Interactive SVG Map Viewport */}
          <div className={`relative w-full aspect-16/10 sm:aspect-16/9 overflow-hidden select-none border-b border-slate-200 transition-colors duration-500 ${
            mapStyle === 'satelite' ? 'bg-[#06140b]' : 'bg-[#f4f7f5]'
          }`}>
            {/* Compass Rose */}
            <div className={`absolute top-4 left-4 z-20 pointer-events-none backdrop-blur-xs px-2.5 py-1.5 rounded-xl border shadow-2xs flex items-center gap-2 text-xs font-bold ${
              mapStyle === 'satelite'
                ? 'bg-slate-950/85 text-slate-200 border-slate-700/80'
                : 'bg-white/90 text-slate-700 border-slate-300/80'
            }`}>
              <Compass className="w-4 h-4 text-rose-500" />
              <span>Norte · Altavista</span>
            </div>

            {/* Quick Map Mode Pill Floating directly on the map viewport */}
            <div className={`absolute top-4 left-40 sm:left-44 z-20 flex items-center p-1 rounded-xl border shadow-xs backdrop-blur-xs ${
              mapStyle === 'satelite'
                ? 'bg-slate-950/90 border-slate-700'
                : 'bg-white/95 border-slate-300/80'
            }`}>
              <button
                type="button"
                onClick={() => setMapStyle('estandar')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  mapStyle === 'estandar'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Map className="w-3 h-3" />
                <span>Estándar</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satelite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  mapStyle === 'satelite'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Satélite</span>
              </button>
            </div>

            {/* Scale Marker */}
            <div className={`absolute bottom-4 left-4 z-20 pointer-events-none backdrop-blur-xs px-2.5 py-1.5 rounded-xl border shadow-2xs flex items-center gap-2 text-[11px] font-mono ${
              mapStyle === 'satelite'
                ? 'bg-slate-950/85 text-slate-300 border-slate-700'
                : 'bg-white/90 text-slate-600 border-slate-300/80'
            }`}>
              <div className="w-12 h-1.5 bg-slate-900 rounded-xs flex">
                <div className="w-1/2 h-full bg-white border border-slate-900"></div>
                <div className="w-1/2 h-full bg-slate-900"></div>
              </div>
              <span>500 m</span>
            </div>

            {/* Zoom and Recenter Toolbar */}
            <div className={`absolute top-4 right-4 z-20 flex flex-col gap-1.5 p-1 rounded-xl border shadow-sm backdrop-blur-xs ${
              mapStyle === 'satelite'
                ? 'bg-slate-950/90 border-slate-700 text-white'
                : 'bg-white/95 border-slate-300/80 text-slate-700'
            }`}>
              <button
                onClick={handleZoomIn}
                title="Acercar mapa"
                className="p-2 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Alejar mapa"
                className="p-2 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleRecenter}
                title="Restablecer vista centrada de la quebrada"
                className="p-2 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* SVG Canvas specifically rendered for currentMap */}
            <svg
              viewBox="0 0 900 600"
              className="w-full h-full transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center'
              }}
            >
              <defs>
                {/* Standard terrain pattern */}
                <pattern id={`terrain-${currentMap.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                </pattern>

                {/* Satellite terrain landscape gradients */}
                <linearGradient id="satLandscape" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#08180c" />
                  <stop offset="25%" stopColor="#0f2b16" />
                  <stop offset="55%" stopColor="#184223" />
                  <stop offset="85%" stopColor="#10301a" />
                  <stop offset="100%" stopColor="#0a1d0f" />
                </linearGradient>

                {/* Canopy vegetation texture */}
                <pattern id="satCanopy" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="10" fill="#143b1f" opacity="0.6" />
                  <circle cx="45" cy="20" r="12" fill="#1c4d28" opacity="0.5" />
                  <circle cx="28" cy="45" r="11" fill="#0d2914" opacity="0.6" />
                  <path d="M 5 35 Q 20 25 35 35 T 60 30" fill="none" stroke="#12361c" strokeWidth="2" opacity="0.4" />
                </pattern>

                {/* Urban settlement rooftops pattern */}
                <pattern id="satUrban" width="90" height="90" patternUnits="userSpaceOnUse">
                  <rect x="10" y="10" width="14" height="10" fill="#475569" opacity="0.4" rx="1" />
                  <rect x="28" y="12" width="12" height="12" fill="#b45309" opacity="0.35" rx="1" />
                  <rect x="50" y="8" width="16" height="10" fill="#334155" opacity="0.4" rx="1" />
                  <rect x="15" y="45" width="14" height="14" fill="#78350f" opacity="0.3" rx="1" />
                  <rect x="60" y="50" width="15" height="11" fill="#475569" opacity="0.4" rx="1" />
                </pattern>

                {/* Standard river flow gradient */}
                <linearGradient id={`riverGrad-${currentMap.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#0c4a6e" />
                </linearGradient>

                {/* Satellite river flow gradient */}
                <linearGradient id="satRiverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#06b6d4" />
                  <stop offset="70%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>

                {/* Flood aura blur filter */}
                <filter id={`floodBlur-${currentMap.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="12" result="blur" />
                </filter>
              </defs>

              {/* Background mountain terrain base */}
              {mapStyle === 'estandar' ? (
                <>
                  <rect width="900" height="600" fill="#f8fafc" />
                  <rect width="900" height="600" fill={`url(#terrain-${currentMap.id})`} />
                </>
              ) : (
                <>
                  <rect width="900" height="600" fill="url(#satLandscape)" />
                  <rect width="900" height="600" fill="url(#satCanopy)" opacity="0.75" />
                  <rect width="900" height="600" fill="url(#satUrban)" opacity="0.45" />
                </>
              )}

              {/* Mountain contour lines specific to this basin */}
              <g id="topography-contours" opacity={mapStyle === 'satelite' ? 0.35 : 0.6}>
                {currentMap.mountainContours.map((contour, idx) => (
                  <path
                    key={`contour-${idx}`}
                    d={contour.d}
                    fill="none"
                    stroke={mapStyle === 'satelite' ? '#22c55e' : contour.stroke}
                    strokeWidth={contour.strokeWidth}
                    strokeDasharray={mapStyle === 'satelite' ? '6,6' : '4,4'}
                  />
                ))}
              </g>

              {/* Local roads & access paths specific to this basin */}
              <g id="local-roads" opacity={mapStyle === 'satelite' ? 0.9 : 0.8}>
                {currentMap.localRoads.map((road, idx) => (
                  <g key={`road-${idx}`}>
                    <path
                      d={road.d}
                      fill="none"
                      stroke={mapStyle === 'satelite' ? '#334155' : '#cbd5e1'}
                      strokeWidth={mapStyle === 'satelite' ? road.strokeWidth + 2 : road.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {mapStyle === 'satelite' && (
                      <path
                        d={road.d}
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth={0.9}
                        strokeDasharray="8,10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.8}
                      />
                    )}
                  </g>
                ))}
              </g>

              {/* Specific Hydro-Urban Context for Quebrada La Picacha (Downstream Sector from Google Maps) */}
              {currentMap.id === 'la-picacha' && (
                <g id="la-picacha-downstream-context">
                  {/* Altos del Castillo Etapa 1 - Residential street block grid as seen in Google Maps */}
                  <g id="altos-del-castillo-blocks" opacity={mapStyle === 'satelite' ? 0.35 : 0.75}>
                    <rect x="545" y="90" width="145" height="90" rx="6" fill={mapStyle === 'satelite' ? '#0f172a' : '#f8fafc'} stroke="#94a3b8" strokeWidth="1" />
                    {/* Internal streets */}
                    <path d="M 545 120 L 690 115 M 545 150 L 690 145" stroke={mapStyle === 'satelite' ? '#334155' : '#cbd5e1'} strokeWidth="1.2" />
                    <path d="M 580 90 L 585 180 M 615 90 L 620 180 M 650 90 L 655 180" stroke={mapStyle === 'satelite' ? '#334155' : '#cbd5e1'} strokeWidth="1.2" />
                    {/* Residential buildings footprints */}
                    <rect x="555" y="98" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="590" y="98" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="625" y="98" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="555" y="127" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="590" y="127" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="625" y="127" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="555" y="157" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="590" y="157" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                    <rect x="625" y="157" width="18" height="15" rx="2" fill="#94a3b8" opacity="0.6" />
                  </g>

                  {/* Universidad de Medellín Campus Grounds & Facilities */}
                  <g id="udem-campus-grounds" opacity={mapStyle === 'satelite' ? 0.45 : 0.85}>
                    <rect x="650" y="270" width="195" height="135" rx="10" fill={mapStyle === 'satelite' ? '#064e3b' : '#f0fdf4'} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 3" />
                    {/* Campus Athletic track / Cancha */}
                    <rect x="740" y="325" width="85" height="55" rx="18" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.7" />
                    <rect x="750" y="335" width="65" height="35" rx="8" fill="#10b981" opacity="0.15" />
                    {/* Academic buildings blocks */}
                    <rect x="660" y="285" width="45" height="26" rx="3" fill="#64748b" opacity="0.55" />
                    <rect x="660" y="320" width="45" height="26" rx="3" fill="#64748b" opacity="0.55" />
                    <rect x="660" y="355" width="55" height="28" rx="3" fill="#64748b" opacity="0.55" />
                    <rect x="715" y="285" width="40" height="24" rx="3" fill="#64748b" opacity="0.55" />
                  </g>

                  {/* Lodging pink marker near Droguería Aguas Frías (as seen on Google Maps screenshot) */}
                  <g id="lodging-marker-google-maps" transform="translate(295, 275)">
                    <circle cx="0" cy="0" r="7" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
                    <rect x="-4" y="-2" width="8" height="4" rx="1" fill="#ffffff" />
                    <circle cx="-2" cy="-3" r="1.2" fill="#ffffff" />
                  </g>
                </g>
              )}

              {/* Flood Risk Buffer (Layer 1: Inundación) */}
              {activeLayers.inundacion && (
                <g id="flood-buffer" opacity="0.45">
                  <path
                    d={currentMap.floodAuraD}
                    fill="none"
                    stroke={
                      cuencaMeta.status === 'alerta_naranja'
                        ? '#f97316'
                        : cuencaMeta.status === 'alerta_amarilla'
                        ? '#eab308'
                        : '#38bdf8'
                    }
                    strokeWidth="48"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#floodBlur-${currentMap.id})`}
                  />
                  <path
                    d={currentMap.floodAuraD}
                    fill="none"
                    stroke={
                      cuencaMeta.status === 'alerta_naranja'
                        ? '#ea580c'
                        : cuencaMeta.status === 'alerta_amarilla'
                        ? '#ca8a04'
                        : '#0284c7'
                    }
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                </g>
              )}

              {/* Main River Course Path for this specific Quebrada */}
              <g id="river-course">
                {mapStyle === 'satelite' ? (
                  <>
                    {/* Outer watercourse glow */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.3"
                      filter={`url(#floodBlur-${currentMap.id})`}
                    />
                    {/* River bed underlay */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke="#082f49"
                      strokeWidth="13"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Water Stream (satellite turquoise) */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke="url(#satRiverGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Sunlight foam glint on rapids */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="12, 20"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </>
                ) : (
                  <>
                    {/* River bed underlay */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Water Stream */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke={`url(#riverGrad-${currentMap.id})`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Direction flow indicators */}
                    <path
                      d={currentMap.riverPathD}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="16, 24"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </>
                )}
              </g>

              {/* Prominent Quebrada Name & Mode Watermark Axis Badge */}
              <g id="quebrada-axis-badge">
                <rect
                  x="30"
                  y="22"
                  width="290"
                  height="34"
                  rx="8"
                  fill={mapStyle === 'satelite' ? '#041309' : '#ffffff'}
                  stroke={mapStyle === 'satelite' ? '#10b981' : '#cbd5e1'}
                  strokeWidth="1.2"
                  opacity="0.94"
                />
                <circle
                  cx="46"
                  cy="39"
                  r="4"
                  fill={mapStyle === 'satelite' ? '#34d399' : '#0284c7'}
                  className="animate-ping"
                />
                <circle
                  cx="46"
                  cy="39"
                  r="3"
                  fill={mapStyle === 'satelite' ? '#10b981' : '#0369a1'}
                />
                <text
                  x="58"
                  y="36"
                  fontSize="12"
                  fontWeight="800"
                  fill={mapStyle === 'satelite' ? '#ffffff' : '#0f172a'}
                  letterSpacing="0.4"
                  fontFamily="system-ui, sans-serif"
                >
                  QUEBRADA {currentMap.name.toUpperCase()}
                </text>
                <text
                  x="58"
                  y="49"
                  fontSize="9"
                  fontWeight="700"
                  fill={mapStyle === 'satelite' ? '#34d399' : '#0284c7'}
                  fontFamily="monospace"
                >
                  CAUCE ACTIVO · {mapStyle === 'satelite' ? 'VISTA SATELITAL HD' : 'VISTA TOPOGRÁFICA ESTÁNDAR'}
                </text>
              </g>

              {/* Critical River Segment if alert is present */}
              {currentMap.criticalSegmentD && (
                <path
                  d={currentMap.criticalSegmentD}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="10, 8"
                  opacity="0.9"
                />
              )}

              {/* Point of delivery / confluence indicator for Las Cañadas into Quebrada Altavista */}
              {currentMap.id === 'la-canada' && (
                <g id="la-canada-confluence-altavista">
                  <circle cx="640" cy="540" r="12" fill="#0284c7" opacity="0.25" className="animate-ping" />
                  <circle cx="640" cy="540" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <rect
                    x="510"
                    y="552"
                    width="260"
                    height="22"
                    rx="5"
                    fill={mapStyle === 'satelite' ? '#082f49' : '#f0f9ff'}
                    stroke="#0284c7"
                    strokeWidth="1.2"
                  />
                  <text
                    x="640"
                    y="567"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="800"
                    fill={mapStyle === 'satelite' ? '#38bdf8' : '#0369a1'}
                    fontFamily="system-ui, sans-serif"
                  >
                    Entrega de aguas: Confluencia Q. Altavista (San Pablo)
                  </text>
                </g>
              )}

              {/* Comprehensive Hydrographic Network Layer: rendered ONLY when viewing the integral Red Comuna 70 map */}
              {currentMap.id === 'red-comuna-70' && (
                <g id="comuna-70-network-branches">
                  {COMUNA_70_QUEBRADAS_NETWORK.map((branch) => {
                    const isSelected = selectedBranchId === branch.id;
                    return (
                      <g
                        key={branch.id}
                        onClick={() => setSelectedBranchId(isSelected ? null : branch.id)}
                        className="cursor-pointer group"
                      >
                        {/* Outer Glow */}
                        <path
                          d={branch.pathD}
                          fill="none"
                          stroke={branch.glowColor}
                          strokeWidth={isSelected ? branch.strokeWidth + 8 : branch.strokeWidth + 3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={isSelected ? 0.95 : mapStyle === 'satelite' ? 0.45 : 0.35}
                        />

                        {/* Core Stream */}
                        <path
                          d={branch.pathD}
                          fill="none"
                          stroke={mapStyle === 'satelite' ? branch.glowColor : branch.color}
                          strokeWidth={branch.strokeWidth}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={isSelected ? 1 : 0.9}
                        />

                        {/* Water flow dashes */}
                        <path
                          d={branch.pathD}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeDasharray="8, 16"
                          strokeLinecap="round"
                          className="animate-pulse"
                          opacity={0.8}
                        />

                        {/* Interactive Clickable Badge at branch label position */}
                        <g transform={`translate(${branch.labelX}, ${branch.labelY})`}>
                          <rect
                            x="-8"
                            y="-11"
                            width={branch.name.length * 6.6 + 26}
                            height="20"
                            rx="5"
                            fill={isSelected ? '#0284c7' : mapStyle === 'satelite' ? '#04150b' : '#ffffff'}
                            stroke={isSelected ? '#38bdf8' : branch.color}
                            strokeWidth={isSelected ? 2 : 1.2}
                            className="shadow-sm transition-transform group-hover:scale-105"
                          />
                          <circle
                            cx="2"
                            cy="-1"
                            r="3.5"
                            fill={
                              branch.status === 'seguro'
                                ? '#10b981'
                                : branch.status === 'alerta_amarilla'
                                ? '#f59e0b'
                                : '#ef4444'
                            }
                          />
                          <text
                            x="11"
                            y="3"
                            fontSize="10"
                            fontWeight={isSelected ? '900' : '700'}
                            fill={isSelected ? '#ffffff' : mapStyle === 'satelite' ? '#ffffff' : '#0f172a'}
                            fontFamily="system-ui, sans-serif"
                          >
                            {branch.name}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Topographic Landmarks & Community Sectors with their RESPECTIVE NAMES */}
              <g id="landmarks">
                {currentMap.landmarks.map((lm, idx) => {
                  const isDrogueria = lm.text.includes('DROGUERÍA');
                  const isUdeM = lm.text.includes('Universidad de Medellín');
                  const isAltos = lm.text.includes('ALTOS DEL CASTILLO');
                  const isStreet = lm.text.startsWith('Calle');
                  const isSelected = selectedLandmark?.text === lm.text;

                  return (
                    <g
                      key={`lm-${idx}`}
                      className="cursor-pointer group select-none transition-transform hover:scale-[1.02]"
                      onClick={() => {
                        setSelectedLandmark(lm);
                        setSelectedSensor(null);
                        setSelectedEvacPoint(null);
                        setSelectedBranchId(null);
                        setShowMapsEmbedInCard(false);
                      }}
                    >
                      <title>Clic para abrir y mirar {lm.text} en Google Maps</title>

                      {/* Selection Ring */}
                      {isSelected && (
                        <circle
                          cx={lm.x}
                          cy={lm.y}
                          r="15"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeDasharray="4 3"
                          className="animate-spin"
                        />
                      )}

                      {mapStyle === 'satelite' ? (
                        <>
                          {/* Satellite Mode Pins & Pills */}
                          {isDrogueria ? (
                            <>
                              <circle cx={lm.x} cy={lm.y} r="8" fill="#ef4444" opacity="0.4" className="animate-ping" />
                              <circle cx={lm.x} cy={lm.y} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                              <circle cx={lm.x} cy={lm.y} r="2" fill="#ffffff" />
                            </>
                          ) : isUdeM ? (
                            <>
                              <circle cx={lm.x} cy={lm.y} r="8" fill="#0284c7" opacity="0.4" className="animate-ping" />
                              <circle cx={lm.x} cy={lm.y} r="6.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                              <polygon points={`${lm.x},${lm.y-3} ${lm.x+3},${lm.y} ${lm.x},${lm.y+3} ${lm.x-3},${lm.y}`} fill="#ffffff" />
                            </>
                          ) : isAltos ? (
                            <circle cx={lm.x} cy={lm.y} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          ) : isStreet ? (
                            <circle cx={lm.x} cy={lm.y} r="3" fill="#94a3b8" />
                          ) : (
                            <circle cx={lm.x} cy={lm.y} r="3.5" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
                          )}

                          <rect
                            x={lm.x + 8}
                            y={lm.y - 11}
                            width={lm.text.length * 7.2 + 16}
                            height="22"
                            rx="5"
                            fill={
                              isDrogueria
                                ? '#450a0a'
                                : isUdeM
                                ? '#082f49'
                                : isAltos
                                ? '#1e293b'
                                : isStreet
                                ? '#0f172a'
                                : '#031208'
                            }
                            stroke={
                              isSelected
                                ? '#38bdf8'
                                : isDrogueria
                                ? '#ef4444'
                                : isUdeM
                                ? '#38bdf8'
                                : isAltos
                                ? '#f59e0b'
                                : isStreet
                                ? '#64748b'
                                : '#10b981'
                            }
                            strokeWidth={isSelected ? '2.5' : isDrogueria || isUdeM || isAltos ? '1.5' : '0.8'}
                            opacity="0.95"
                          />
                          <text
                            x={lm.x + 16}
                            y={lm.y + 4}
                            fontSize={lm.fontSize || 11.5}
                            fontWeight={isDrogueria || isUdeM || isAltos ? '900' : lm.bold ? '800' : '600'}
                            fill={
                              isDrogueria
                                ? '#fecaca'
                                : isUdeM
                                ? '#bae6fd'
                                : isAltos
                                ? '#fef08a'
                                : isStreet
                                ? '#cbd5e1'
                                : '#ffffff'
                            }
                            fontFamily="system-ui, sans-serif"
                          >
                            {lm.text}
                          </text>
                        </>
                      ) : (
                        <>
                          {/* Standard Map Mode Pins & Pills */}
                          {isDrogueria ? (
                            <>
                              <circle cx={lm.x} cy={lm.y} r="7.5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                              <circle cx={lm.x} cy={lm.y} r="2.5" fill="#ffffff" />
                            </>
                          ) : isUdeM ? (
                            <>
                              <circle cx={lm.x} cy={lm.y} r="7.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                              <polygon points={`${lm.x},${lm.y-3} ${lm.x+3},${lm.y} ${lm.x},${lm.y+3} ${lm.x-3},${lm.y}`} fill="#ffffff" />
                            </>
                          ) : isAltos ? (
                            <circle cx={lm.x} cy={lm.y} r="4.5" fill="#b45309" stroke="#ffffff" strokeWidth="1.5" />
                          ) : isStreet ? (
                            <circle cx={lm.x} cy={lm.y} r="3" fill="#64748b" />
                          ) : (
                            <circle cx={lm.x} cy={lm.y} r="3.5" fill={lm.color || '#0284c7'} />
                          )}

                          <rect
                            x={lm.x + 8}
                            y={lm.y - 11}
                            width={lm.text.length * 7.2 + 14}
                            height="20"
                            rx="4"
                            fill={
                              isDrogueria
                                ? '#fef2f2'
                                : isUdeM
                                ? '#f0f9ff'
                                : isAltos
                                ? '#fffbeb'
                                : isStreet
                                ? '#f8fafc'
                                : '#ffffff'
                            }
                            stroke={
                              isSelected
                                ? '#0284c7'
                                : isDrogueria
                                ? '#dc2626'
                                : isUdeM
                                ? '#0284c7'
                                : isAltos
                                ? '#b45309'
                                : isStreet
                                ? '#94a3b8'
                                : '#cbd5e1'
                            }
                            strokeWidth={isSelected ? '2.5' : isDrogueria || isUdeM || isAltos ? '1.5' : '0.8'}
                            opacity="0.96"
                          />
                          <text
                            x={lm.x + 15}
                            y={lm.y + 3.5}
                            fontSize={lm.fontSize || 12}
                            fontWeight={isDrogueria || isUdeM || isAltos ? '800' : lm.bold ? '700' : '600'}
                            fill={
                              isDrogueria
                                ? '#b91c1c'
                                : isUdeM
                                ? '#0369a1'
                                : isAltos
                                ? '#92400e'
                                : isStreet
                                ? '#475569'
                                : lm.color || '#1e293b'
                            }
                            fontFamily="system-ui, sans-serif"
                          >
                            {lm.text}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Evacuation Safe Point Marker (Layer 2: Evacuación) */}
              {activeLayers.evacuacion && (
                <g
                  id="evacuation-point"
                  className="cursor-pointer group"
                  onClick={() => setSelectedEvacPoint(currentMap.evacuationPoint)}
                >
                  {/* Pulse aura */}
                  <circle
                    cx={currentMap.evacuationPoint.x}
                    cy={currentMap.evacuationPoint.y}
                    r="20"
                    fill="#10b981"
                    opacity="0.25"
                    className="animate-ping"
                  />
                  {/* Outer circle */}
                  <circle
                    cx={currentMap.evacuationPoint.x}
                    cy={currentMap.evacuationPoint.y}
                    r="14"
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  {/* Evacuation icon symbol (Flag / Star) */}
                  <path
                    d={`M ${currentMap.evacuationPoint.x - 4} ${currentMap.evacuationPoint.y + 6} L ${
                      currentMap.evacuationPoint.x - 4
                    } ${currentMap.evacuationPoint.y - 6} L ${currentMap.evacuationPoint.x + 5} ${
                      currentMap.evacuationPoint.y - 2
                    } L ${currentMap.evacuationPoint.x - 4} ${currentMap.evacuationPoint.y + 1} Z`}
                    fill="#ffffff"
                  />
                  {/* Text label */}
                  <rect
                    x={currentMap.evacuationPoint.x - 100}
                    y={currentMap.evacuationPoint.y + 18}
                    width="200"
                    height="24"
                    rx="6"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x={currentMap.evacuationPoint.x}
                    y={currentMap.evacuationPoint.y + 34}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    ★ {currentMap.evacuationPoint.name.toUpperCase()}
                  </text>
                </g>
              )}

              {/* SIATA Telemetry Sensors (Layer 3: Sensores) */}
              {activeLayers.sensores &&
                currentMap.sensors.map((sensor) => {
                  const isSelected = selectedSensor?.id === sensor.id;
                  const markerBg =
                    sensor.status === 'critico'
                      ? '#ef4444'
                      : sensor.status === 'advertencia'
                      ? '#f59e0b'
                      : '#10b981';

                  return (
                    <g
                      key={sensor.id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedSensor(sensor)}
                    >
                      {/* Pulse if alert */}
                      {sensor.status !== 'normal' && (
                        <circle
                          cx={sensor.x}
                          cy={sensor.y}
                          r="18"
                          fill={markerBg}
                          opacity="0.3"
                          className="animate-ping"
                        />
                      )}
                      {/* Sensor Outer Pill / Circle */}
                      <circle
                        cx={sensor.x}
                        cy={sensor.y}
                        r={isSelected ? '12' : '10'}
                        fill={markerBg}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx={sensor.x}
                        cy={sensor.y}
                        r="3"
                        fill="#ffffff"
                      />
                      {/* Sensor Label Badge with sensor name & level */}
                      <rect
                        x={sensor.x - 55}
                        y={sensor.y - 28}
                        width="110"
                        height="18"
                        rx="5"
                        fill="#0f172a"
                        stroke={mapStyle === 'satelite' ? '#38bdf8' : '#334155'}
                        strokeWidth="1"
                        opacity="0.94"
                      />
                      <text
                        x={sensor.x}
                        y={sensor.y - 15}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                        fill="#ffffff"
                      >
                        {sensor.name} · {sensor.level.toFixed(2)}m
                      </text>
                    </g>
                  );
                })}

              {/* Real-time Incident Alert Callout if available */}
              {currentMap.incidentAlert && (
                <g id="incident-banner">
                  <rect
                    x={currentMap.incidentAlert.x - 140}
                    y={currentMap.incidentAlert.y - 20}
                    width="280"
                    height="32"
                    rx="8"
                    fill={currentMap.incidentAlert.severity === 'danger' ? '#991b1b' : '#0f766e'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={currentMap.incidentAlert.x}
                    y={currentMap.incidentAlert.y + 1}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#ffffff"
                  >
                    ⚠️ {currentMap.incidentAlert.text}
                  </text>
                </g>
              )}
            </svg>

            {/* Sensor Detail Floating Card if clicked */}
            {selectedSensor && (
              <div className="absolute bottom-4 right-4 z-30 bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedSensor.status === 'critico'
                          ? 'bg-rose-500 animate-pulse'
                          : selectedSensor.status === 'advertencia'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    ></span>
                    <span className="font-bold text-xs">{selectedSensor.code} · {selectedSensor.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedSensor(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Nivel Actual</span>
                    <span className="text-base font-black text-cyan-400">{selectedSensor.level.toFixed(2)} m</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Cota Desborde</span>
                    <span className="text-base font-black text-rose-400">{selectedSensor.maxLevel.toFixed(2)} m</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elevación:</span>
                    <span className="font-mono">{selectedSensor.elevation} msnm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Red Hidrológica:</span>
                    <span className="font-mono text-emerald-400">SIATA Oficial</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tendencia:</span>
                    <span className="font-semibold text-amber-300">{selectedSensor.trend}</span>
                  </div>
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-center gap-2">
                  <a
                    href={getPointGoogleMapsUrl(selectedSensor.googleMapsQuery || `${selectedSensor.name}, Altavista, Medellín`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    title="Abrir ubicación de la estación en Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en Maps</span>
                  </a>
                  <a
                    href={getPointGoogleMapsUrl(selectedSensor.googleMapsQuery || `${selectedSensor.name}, Altavista, Medellín`, true)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Ver en Satélite"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>
              </div>
            )}

            {/* Quebrada Branch Floating Detail Card if clicked */}
            {selectedBranchId && (() => {
              const branch = COMUNA_70_QUEBRADAS_NETWORK.find((b) => b.id === selectedBranchId);
              if (!branch) return null;
              return (
                <div className="absolute top-16 left-4 z-30 bg-slate-900/95 text-white p-4 rounded-2xl border border-sky-500 shadow-2xl max-w-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: branch.color }} />
                      <span className="font-bold text-xs text-white">{branch.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedBranchId(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
                        Sectores y Veredas de Paso:
                      </span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed font-medium">
                        {branch.veredasPassed}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.googleMapsRef)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver en Google Maps</span>
                      </a>
                      <button
                        onClick={() => {
                          const targetId = branch.id.includes('altavista')
                            ? 'altavista'
                            : branch.id.includes('picacha')
                            ? 'la-picacha'
                            : branch.id.includes('buenavista')
                            ? 'buenavista'
                            : branch.id.includes('canada')
                            ? 'la-canada'
                            : 'red-comuna-70';
                          handleSelectQuebrada(targetId);
                          setSelectedBranchId(null);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                      >
                        Enfocar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Evacuation Point Floating Card if clicked */}
            {selectedEvacPoint && (
              <div className="absolute bottom-4 left-20 z-30 bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-700 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs">{selectedEvacPoint.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedEvacPoint(null)}
                    className="p-1 rounded-lg text-emerald-300 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-emerald-100 space-y-1.5">
                  <p>📍 {selectedEvacPoint.address}</p>
                  <p>👥 Capacidad estimada: <strong className="text-white">{selectedEvacPoint.capacity} personas</strong></p>
                  <p className="text-[11px] text-emerald-300">📞 {selectedEvacPoint.contact}</p>
                </div>
                <div className="pt-2.5 mt-2 border-t border-emerald-800/80 flex items-center gap-2">
                  <a
                    href={getPointGoogleMapsUrl(selectedEvacPoint.googleMapsQuery || `${selectedEvacPoint.name}, ${selectedEvacPoint.address}, Medellín`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en Maps</span>
                  </a>
                  <a
                    href={getPointGoogleMapsDirectionsUrl(selectedEvacPoint.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-bold flex items-center gap-1"
                    title="Ruta de evacuación en Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ruta</span>
                  </a>
                </div>
              </div>
            )}

            {/* Landmark Floating Detail Card when clicked */}
            {selectedLandmark && (
              <div className="absolute bottom-4 right-4 z-30 bg-slate-900/95 text-white p-4 sm:p-5 rounded-2xl border border-sky-500 shadow-2xl max-w-sm sm:max-w-md backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-3 mb-2.5 pb-2.5 border-b border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-900/70 text-blue-300 border border-blue-700/60">
                          {selectedLandmark.category || 'Punto de Interés'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {currentMap.name}
                        </span>
                      </div>
                      <h4 className="font-black text-sm sm:text-base text-white mt-1 leading-snug">
                        {selectedLandmark.text}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLandmark(null);
                      setShowMapsEmbedInCard(false);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Cerrar detalle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedLandmark.description && (
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed font-normal">
                    {selectedLandmark.description}
                  </p>
                )}

                {/* Direct Google Maps Action Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={getPointGoogleMapsUrl(selectedLandmark.googleMapsQuery || selectedLandmark.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-900/40"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en Google Maps</span>
                    </a>

                    <a
                      href={getPointGoogleMapsUrl(selectedLandmark.googleMapsQuery || selectedLandmark.text, true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                      title="Ver en vista satelital de Google Maps"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Satélite</span>
                    </a>

                    <a
                      href={getPointGoogleMapsDirectionsUrl(selectedLandmark.googleMapsQuery || selectedLandmark.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1 transition-all"
                      title="Trazar ruta para llegar en Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ruta</span>
                    </a>
                  </div>

                  {/* Embedded interactive map toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowMapsEmbedInCard((prev) => !prev)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-between transition-colors border border-slate-700/60 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Map className="w-3 h-3 text-sky-400" />
                        <span>{showMapsEmbedInCard ? 'Ocultar mapa embebido' : 'Mirar en mapa embebido aquí'}</span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMapsEmbedInCard ? 'rotate-180' : ''}`} />
                    </button>

                    {showMapsEmbedInCard && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                        <iframe
                          title={`Mapa de ${selectedLandmark.text}`}
                          src={getPointGoogleMapsEmbedUrl(selectedLandmark.googleMapsQuery || selectedLandmark.text)}
                          className="w-full h-48 border-0"
                          loading="lazy"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Topographic and Hydro-geomorphological Characteristics Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500">Rango de Cota</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 font-mono">
                {currentMap.elevationRange}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500">Longitud del Cauce</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 font-mono">
                {currentMap.riverLengthKm} km
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500">Pendiente Media</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 font-mono">
                {currentMap.averageSlope}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500">Área de Cuenca</div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 font-mono">
                {currentMap.basinAreaHa} Ha
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hydro-telemetry status & Specific Evacuation Directives for THIS Quebrada */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quebrada Level & Capacity Gauge Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-slate-700" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Nivel en Quebrada {currentMap.name}
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                SIATA
              </span>
            </div>

            {/* Current Level Big Numbers */}
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
                  {currentMap.currentLevel.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-500 ml-1">m</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500 block">Umbral de Desborde</span>
                <span className="text-sm font-bold font-mono text-rose-600">
                  {currentMap.maxThreshold.toFixed(2)} m
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentMap.fillingPercentage > 75
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                    : currentMap.fillingPercentage > 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${currentMap.fillingPercentage}%` }}
              ></div>
            </div>

            {/* Telemetry rows */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Margen de Seguridad:
                </span>
                <span className="font-bold font-mono text-slate-900">{currentMap.marginCm} cm libres</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  Comportamiento:
                </span>
                <span className="font-bold text-amber-700">{currentMap.trendText}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-slate-400" />
                  Tramo más Vulnerable:
                </span>
                <span className="font-bold text-slate-800 text-right">{currentMap.criticalSector}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Lluvia en Cuenca Alta:
                </span>
                <span className="font-bold font-mono text-slate-900">{currentMap.rainIntensity}</span>
              </div>
            </div>
          </div>

          {/* Specific Emergency Protocol for Inhabitants of this Quebrada */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Instrucciones: Quebrada {currentMap.name}
                </h3>
                <p className="text-[11px] text-slate-400">Directrices para los habitantes de esta ribera</p>
              </div>
            </div>

            <div className="space-y-3">
              {currentMap.specificInstructions.map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{item.title}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Evacuation Point Highlight */}
            <div className="mt-5 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Punto de Evacuación Asignado</span>
              </div>
              <div className="text-xs font-black text-white">{currentMap.evacuationPoint.name}</div>
              <div className="text-[11px] text-emerald-200 mt-0.5">{currentMap.evacuationPoint.address}</div>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={getPointGoogleMapsUrl(currentMap.evacuationPoint.googleMapsQuery || `${currentMap.evacuationPoint.name}, ${currentMap.evacuationPoint.address}, Medellín`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Punto en Maps</span>
                </a>
                <a
                  href={getPointGoogleMapsDirectionsUrl(currentMap.evacuationPoint.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Trazar ruta de evacuación"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Ruta</span>
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex items-center gap-3">
              {onOpenReportModal && (
                <button
                  onClick={onOpenReportModal}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reportar en esta Quebrada</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Hydrographic Network of Comuna 70 (Altavista) with Google Maps Georeferencing */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-black text-[11px] uppercase tracking-wider">
                Comuna 70 · Altavista
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Cartografía Oficial & Google Maps
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Red Hidrográfica y Sectores de Paso · Comuna 70
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Georreferenciación precisa de las microcuencas que atraviesan las 9 veredas del Corregimiento de Altavista, verificadas con la red hidrográfica de Medellín.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleSelectQuebrada('red-comuna-70')}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 text-cyan-400" />
              <span>Ver Red Completa en Visor</span>
            </button>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Corregimiento+Altavista+Medellin+Quebradas"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Comuna 70 en Google Maps</span>
            </a>
          </div>
        </div>

        {/* Informative Verification Callout */}
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs text-blue-950 space-y-1">
            <div className="font-bold text-blue-900">
              Verificación y Corrección Geográfica de la Quebrada Las Cañadas
            </div>
            <p className="text-blue-800 leading-relaxed">
              La Quebrada Las Cañadas nace en la Vereda La Esperanza Alta (cota 2,180 msnm), desciende por el sector de ladera El Chispero, cruza la vía de acceso y el puente peatonal de la Calle 18A y desemboca en la margen derecha de la Quebrada Altavista a la altura de la Vereda San Pablo. El visor satelital y estándar refleja fielmente este trazado junto con todas las cuencas vecinas.
            </p>
          </div>
        </div>

        {/* Quebradas Grid with direct Google Maps routes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMUNA_70_QUEBRADAS_NETWORK.map((item) => {
            const isSelected = selectedBranchId === item.id || selectedCuencaId === item.id.replace('-main', '').replace('-branch', '');
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/30'
                    : 'bg-slate-50/60 hover:bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'seguro'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'alerta_amarilla'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status === 'seguro' ? 'Normal' : item.status === 'alerta_amarilla' ? 'Vigilancia' : 'Crítico'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                      Recorrido y Sectores:
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-slate-200/80">
                      {item.veredasPassed}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => {
                      const targetId = item.id.includes('altavista')
                        ? 'altavista'
                        : item.id.includes('picacha')
                        ? 'la-picacha'
                        : item.id.includes('buenavista')
                        ? 'buenavista'
                        : item.id.includes('canada')
                        ? 'la-canada'
                        : item.id.includes('guayabala')
                        ? 'la-guayabala'
                        : item.id.includes('pelon')
                        ? 'el-pelon'
                        : item.id.includes('buga')
                        ? 'buga-barcino'
                        : item.id.includes('ana-diaz')
                        ? 'ana-diaz'
                        : 'red-comuna-70';
                      handleSelectQuebrada(targetId);
                      setSelectedBranchId(null);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-slate-600" />
                    <span>Desplegar solo esta zona</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.googleMapsRef)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    title={`Abrir ${item.name} en Google Maps`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Maps Quick Points Explorer Modal */}
      {showMapsQuickList && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <MapPin className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      Directorio de Puntos · Google Maps
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Puntos de la Quebrada {currentMap.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setShowMapsQuickList(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Basin Switcher Filter Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-slate-500 shrink-0">Cambiar Cuenca:</span>
              {Object.values(QUEBRADAS_MAP_DATA).map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuebrada(q.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCuencaId === q.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {q.name}
                </button>
              ))}
            </div>

            {/* Modal Body - Scrollable Points List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Section 1: Landmarks & Points of Interest */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Sitios de Referencia y Veredas ({currentMap.landmarks.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Haz clic en "Abrir en Google Maps" para ver la ubicación exacta
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMap.landmarks.map((lm, idx) => {
                    const isDrogueria = lm.text.includes('DROGUERÍA');
                    const isUdeM = lm.text.includes('Universidad de Medellín');

                    return (
                      <div
                        key={`modal-lm-${idx}`}
                        className={`p-4 rounded-2xl bg-white border transition-all hover:shadow-md flex flex-col justify-between ${
                          isDrogueria
                            ? 'border-red-300 ring-2 ring-red-500/10'
                            : isUdeM
                            ? 'border-sky-300 ring-2 ring-sky-500/10'
                            : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isDrogueria
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : isUdeM
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {lm.category || 'Punto de Interés'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              Pin #{idx + 1}
                            </span>
                          </div>

                          <h5 className="font-black text-sm text-slate-900 leading-snug">
                            {lm.text}
                          </h5>

                          {lm.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {lm.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <a
                            href={getPointGoogleMapsUrl(lm.googleMapsQuery || lm.text)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir en Maps</span>
                          </a>

                          <a
                            href={getPointGoogleMapsUrl(lm.googleMapsQuery || lm.text, true)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            title="Ver en satélite"
                          >
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLandmark(lm);
                              setSelectedSensor(null);
                              setSelectedEvacPoint(null);
                              setShowMapsQuickList(false);
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                            title="Ubicar en el mapa de la app"
                          >
                            Ubicar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: SIATA Sensors */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-amber-600" />
                  <span>Estaciones y Sensores Telemétricos SIATA ({currentMap.sensors.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMap.sensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                            {sensor.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sensor.status === 'critico'
                                ? 'bg-rose-100 text-rose-800'
                                : sensor.status === 'advertencia'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {sensor.status.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="font-black text-sm text-slate-900 mt-1">
                          {sensor.name}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Elevación: {sensor.elevation} msnm · Nivel: {sensor.level.toFixed(2)} m
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                        <a
                          href={getPointGoogleMapsUrl(sensor.googleMapsQuery || `${sensor.name}, Altavista, Medellín`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir en Maps</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSensor(sensor);
                            setSelectedLandmark(null);
                            setSelectedEvacPoint(null);
                            setShowMapsQuickList(false);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Ubicar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Safe Evacuation Point */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Punto Seguro de Evacuación Asignado</span>
                </h4>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Zona Segura Comunitaria
                    </span>
                    <h5 className="font-black text-sm text-emerald-950 mt-1">
                      {currentMap.evacuationPoint.name}
                    </h5>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      📍 {currentMap.evacuationPoint.address} · Capacidad: {currentMap.evacuationPoint.capacity} personas
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={getPointGoogleMapsUrl(currentMap.evacuationPoint.googleMapsQuery || `${currentMap.evacuationPoint.name}, ${currentMap.evacuationPoint.address}, Medellín`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en Maps</span>
                    </a>
                    <a
                      href={getPointGoogleMapsDirectionsUrl(currentMap.evacuationPoint.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cómo Llegar</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                💡 Puedes hacer clic en cualquiera de las etiquetas sobre el mapa interactivo para ver su ficha y abrir en Google Maps.
              </span>
              <button
                onClick={() => setShowMapsQuickList(false)}
                className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer self-end sm:self-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
