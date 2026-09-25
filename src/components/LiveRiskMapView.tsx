import React, { useState, useEffect } from 'react';
import { RealisticGisMap } from './RealisticGisMap';
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
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function getUserSectorCoordinates(sectorName?: string): { cuencaId: string; x: number; y: number; label: string } {
  if (!sectorName) return { cuencaId: 'altavista', x: 450, y: 310, label: 'Sector General Altavista' };
  const lower = sectorName.toLowerCase();
  if (lower.includes('aguas frías') || lower.includes('aguas frias')) {
    return { cuencaId: 'la-picacha', x: 320, y: 345, label: 'Vereda Aguas Frías' };
  }
  if (lower.includes('morro plan')) {
    return { cuencaId: 'la-picacha', x: 260, y: 280, label: 'Sector Morro Plan' };
  }
  if (lower.includes('brisas')) {
    return { cuencaId: 'la-picacha', x: 440, y: 360, label: 'Puente Las Brisas (Calle 30)' };
  }
  if (lower.includes('manea') || lower.includes('violetas')) {
    return { cuencaId: 'la-manea', x: 380, y: 250, label: 'Sector Las Violetas / Q. La Manea' };
  }
  if (lower.includes('esperanza') || lower.includes('chispero')) {
    return { cuencaId: 'la-canada', x: 380, y: 310, label: 'Vereda La Esperanza / El Chispero' };
  }
  if (lower.includes('morro') || lower.includes('corazón') || lower.includes('corazon')) {
    return { cuencaId: 'buenavista', x: 360, y: 300, label: 'Vereda El Corazón - El Morro' };
  }
  if (lower.includes('ladrillera') || lower.includes('san judas')) {
    return { cuencaId: 'buenavista', x: 460, y: 330, label: 'Sector Ladrilleras San Judas' };
  }
  if (lower.includes('manzanillo')) {
    return { cuencaId: 'la-guayabala', x: 380, y: 350, label: 'Vereda San José del Manzanillo' };
  }
  if (lower.includes('jardín') || lower.includes('jardin')) {
    return { cuencaId: 'la-guayabala', x: 490, y: 340, label: 'Vereda El Jardín' };
  }
  if (lower.includes('buga') || lower.includes('patio bonito')) {
    return { cuencaId: 'altavista', x: 290, y: 230, label: 'Vereda Buga - Patio Bonito' };
  }
  if (lower.includes('san pablo')) {
    return { cuencaId: 'altavista', x: 430, y: 320, label: 'Vereda San Pablo (Calle 18)' };
  }
  return { cuencaId: 'altavista', x: 480, y: 330, label: sectorName };
}

interface LiveRiskMapViewProps {
  initialCuencaId?: string;
  onOpenReportModal?: () => void;
}

export const LiveRiskMapView: React.FC<LiveRiskMapViewProps> = ({
  initialCuencaId,
  onOpenReportModal
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'administrador';
  const userSectorInfo = getUserSectorCoordinates(currentUser?.barrioSector);

  // If not admin, strictly locked to user's assigned cuenca
  const effectiveDefaultCuencaId = isAdmin
    ? (initialCuencaId || userSectorInfo.cuencaId || 'altavista')
    : (userSectorInfo.cuencaId || 'altavista');

  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(effectiveDefaultCuencaId);
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
    if (isAdmin) {
      if (initialCuencaId) {
        setSelectedCuencaId(initialCuencaId);
      } else if (userSectorInfo.cuencaId) {
        setSelectedCuencaId(userSectorInfo.cuencaId);
      }
    } else {
      setSelectedCuencaId(userSectorInfo.cuencaId || 'altavista');
    }
    setSelectedSensor(null);
    setSelectedEvacPoint(null);
    setSelectedLandmark(null);
    setSelectedBranchId(null);
    setShowMapsEmbedInCard(false);
    setZoomLevel(1);
  }, [initialCuencaId, userSectorInfo.cuencaId, isAdmin]);

  // Actual active cuenca ID (enforcing non-admin restriction)
  const activeCuencaId = isAdmin ? selectedCuencaId : (userSectorInfo.cuencaId || 'altavista');

  // Retrieve dedicated data for selected quebrada
  const currentMap = QUEBRADAS_MAP_DATA[activeCuencaId] || QUEBRADAS_MAP_DATA['la-picacha'];
  const cuencaMeta = CUENCAS_LIST.find((c) => c.id === activeCuencaId) || CUENCAS_LIST[0];

  const handleSelectQuebrada = (id: string) => {
    if (!isAdmin) return; // Non-admins cannot browse other cuencas
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
      {/* User Assigned Sector Focus Banner */}
      {currentUser?.barrioSector && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-sky-950">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600"></span>
            </span>
            <div>
              <div className="font-extrabold text-sky-950 text-sm flex items-center gap-1.5">
                <span>Tu Ubicación Residencial: {currentUser.barrioSector}</span>
              </div>
              <p className="text-sky-700 text-xs mt-0.5">
                El mapa se ha centrado en tu zona de residencia bajo la red de la Quebrada {currentMap.name}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              handleSelectQuebrada(userSectorInfo.cuencaId);
              handleRecenter();
            }}
            className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs self-start sm:self-auto"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Centrar en mi Sector</span>
          </button>
        </div>
      )}

      {/* 1. Dedicated Quebrada Indicator Bar (Strictly Isolated to Selected / Assigned Quebrada) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Monitoreo Hidrológico de Quebrada
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Zona Exclusiva
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Quebrada {cuencaMeta.name} · {userSectorInfo.label}
              </h3>
            </div>
          </div>
        </div>

        {/* Right: Layer Toggles and Google Maps Link */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 flex-wrap">
          <span className="text-slate-400 font-medium">Capas:</span>

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
          <div className="bg-sky-50 border-b border-sky-200/90 px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-sky-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse shrink-0"></span>
              <span>
                Visualizando <strong>únicamente la zona y el cauce</strong> de la <strong>Quebrada {currentMap.name}</strong> ({currentMap.elevationRange}).
              </span>
            </div>
          </div>

          {/* Realistic GIS Map: Google Maps & Satellite, Urban Streets & Risk Colors */}
          <div className="p-3 bg-slate-100">
            <RealisticGisMap
              quebradaId={activeCuencaId}
              isAdmin={isAdmin}
              userSectorName={userSectorInfo.label}
            />
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

      {/* 3. Tramos y Puntos Georreferenciados de la Quebrada Seleccionada */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-black text-[11px] uppercase tracking-wider">
                Georreferenciación Local
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Puntos de Monitoreo en Terreno
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Sensores y Puntos Clave de Quebrada {currentMap.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Microcuenca de {currentMap.name} ({currentMap.elevationRange}). Red de estaciones pluviométricas y de nivel, sitios de referencia comunitaria y cotas altas.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Quebrada ${currentMap.name}, Altavista, Medellín`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Quebrada en Google Maps</span>
            </a>
          </div>
        </div>

        {/* Sensory and Landmark Points Grid for THIS Quebrada */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentMap.sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                    {sensor.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Sensor Telemétrico
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{sensor.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Cota topográfica: <strong>{sensor.elevation} msnm</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Nivel registrado:</span>
                <span className="font-bold text-slate-900">{sensor.level.toFixed(2)} m / {sensor.maxLevel.toFixed(2)} m</span>
              </div>
            </div>
          ))}

          {currentMap.landmarks.slice(0, 3).map((lm, idx) => (
            <div
              key={`lm-card-${idx}`}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    Referencia Local
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{lm.text}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {lm.description || 'Punto comunitario verificado en el trazado de la quebrada.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-400">
                Comuna 70 · Altavista
              </div>
            </div>
          ))}
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
