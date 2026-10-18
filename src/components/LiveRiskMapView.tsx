import React, { useState, useEffect } from 'react';
import { RealisticGisMap, MapActiveLayers, MapTargetCoordinate } from './RealisticGisMap';
import { CUENCAS_LIST } from '../data/cuencasData';
import { GIS_QUEBRADAS } from '../data/gisQuebradasData';
import {
  QUEBRADAS_MAP_DATA,
  COMUNA_70_QUEBRADAS_NETWORK,
  QuebradaEvacuationPoint,
  QuebradaLandmark,
  getPointGoogleMapsUrl,
  getPointGoogleMapsDirectionsUrl
} from '../data/quebradaMapsData';
import {
  Layers,
  MapPin,
  Send,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Compass,
  Mountain,
  Gauge,
  Clock,
  TrendingUp,
  X,
  ExternalLink,
  Navigation,
  Crosshair
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

  // Available cuencas: Exclude any La Esperanza / Las Cañadas block
  const filteredCuencas = CUENCAS_LIST.filter(
    (c) => c.id !== 'la-canada'
  );

  // Determine starting cuenca id, safeguarding against eliminated items
  const getSafeCuencaId = (id?: string) => {
    if (!id || id === 'la-canada') return 'altavista';
    return id;
  };

  const effectiveDefaultCuencaId = isAdmin
    ? getSafeCuencaId(initialCuencaId || userSectorInfo.cuencaId)
    : getSafeCuencaId(userSectorInfo.cuencaId);

  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(effectiveDefaultCuencaId);

  // Streamlined active layers: Strictly Flood and Evacuation (SIATA stations removed)
  const [activeLayers, setActiveLayers] = useState<MapActiveLayers>({
    inundacion: true,
    evacuacion: true
  });

  const [selectedEvacPoint, setSelectedEvacPoint] = useState<QuebradaEvacuationPoint | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<QuebradaLandmark | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [showMapsQuickList, setShowMapsQuickList] = useState<boolean>(false);
  const [mapTargetCoordinate, setMapTargetCoordinate] = useState<MapTargetCoordinate | null>(null);

  useEffect(() => {
    if (isAdmin) {
      if (initialCuencaId && initialCuencaId !== 'la-canada') {
        setSelectedCuencaId(initialCuencaId);
      } else if (userSectorInfo.cuencaId && userSectorInfo.cuencaId !== 'la-canada') {
        setSelectedCuencaId(userSectorInfo.cuencaId);
      } else {
        setSelectedCuencaId('altavista');
      }
    } else {
      setSelectedCuencaId(getSafeCuencaId(userSectorInfo.cuencaId));
    }
    setSelectedEvacPoint(null);
    setSelectedLandmark(null);
    setSelectedBranchId(null);
  }, [initialCuencaId, userSectorInfo.cuencaId, isAdmin]);

  // Actual active cuenca ID (enforcing non-admin restriction and safe fallback)
  const rawActiveId = isAdmin ? selectedCuencaId : (userSectorInfo.cuencaId || 'altavista');
  const activeCuencaId = rawActiveId === 'la-canada' ? 'altavista' : rawActiveId;

  // Retrieve dedicated data for selected quebrada
  const currentMap = QUEBRADAS_MAP_DATA[activeCuencaId] || QUEBRADAS_MAP_DATA['altavista'] || QUEBRADAS_MAP_DATA['la-picacha'];
  const cuencaMeta = filteredCuencas.find((c) => c.id === activeCuencaId) || filteredCuencas[0];

  const handleSelectQuebrada = (id: string) => {
    if (!isAdmin) return;
    if (id === 'la-canada') return;
    setSelectedCuencaId(id);
    setSelectedEvacPoint(null);
    setSelectedLandmark(null);
    setSelectedBranchId(null);
  };

  // Filter out La Esperanza from network list to keep clean
  const filteredNetwork = COMUNA_70_QUEBRADAS_NETWORK.filter(
    (item) => item.id !== 'canadas-branch' && !item.name.toLowerCase().includes('esperanza')
  );

  return (
    <div className="space-y-6 pb-12 transition-colors">
      {/* 1. Header Toolbar: Cuenca Selector & Streamlined Layers Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        {isAdmin ? (
          /* Multi-cuenca Selector for Administrators */
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Microcuencas:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                Admin
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filteredCuencas.map((cuenca) => {
                const isSelected = cuenca.id === activeCuencaId;
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
                    title={isNetworkView ? 'Ver red integral' : `Desplegar zona de Quebrada ${cuenca.name}`}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? isNetworkView
                          ? 'bg-indigo-950 dark:bg-indigo-900 text-white shadow-xs ring-2 ring-indigo-400'
                          : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs ring-2 ring-slate-900/20 dark:ring-white/20'
                        : isNetworkView
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${statusColor} ${
                        cuenca.status !== 'seguro' ? 'animate-pulse' : ''
                      }`}
                    ></span>
                    <span>{isNetworkView ? 'Red Completa' : `Quebrada ${cuenca.name}`}</span>
                    <span
                      className={`text-[11px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        isSelected
                          ? isNetworkView
                            ? 'bg-indigo-900 text-indigo-200'
                            : 'bg-slate-800 dark:bg-slate-200 text-slate-300 dark:text-slate-800'
                          : isNetworkView
                          ? 'bg-indigo-200/80 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200'
                          : 'bg-slate-200/90 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cuenca.capacityPercentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Resident Assigned Cuenca Display */
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                <Compass className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cuenca Asignada
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    Monitoreo Activo
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Quebrada {cuencaMeta.name} · {userSectorInfo.label}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Right: Principal Relevant Layers Only (Área Inundación & Puntos Seguros) */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-wrap">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Capas del Mapa:</span>

          {/* Layer: Área Inundación */}
          <button
            type="button"
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, inundacion: !prev.inundacion }))
            }
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeLayers.inundacion
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-black border ${
                activeLayers.inundacion ? 'bg-white text-blue-700 border-white' : 'border-slate-400'
              }`}
            >
              {activeLayers.inundacion ? '✓' : ''}
            </span>
            <span>Área Inundación</span>
          </button>

          {/* Layer: Puntos Seguros */}
          <button
            type="button"
            onClick={() =>
              setActiveLayers((prev) => ({ ...prev, evacuacion: !prev.evacuacion }))
            }
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeLayers.evacuacion
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-black border ${
                activeLayers.evacuacion ? 'bg-white text-emerald-700 border-white' : 'border-slate-400'
              }`}
            >
              {activeLayers.evacuacion ? '✓' : ''}
            </span>
            <span>Puntos Seguros</span>
          </button>
        </div>
      </div>

      {/* 2. Main Grid: Fluid GIS Map Canvas + Hydrological Telemetry & Protocol Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Expanded, Fluid Interactive Map Canvas */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-colors">
          {/* Header of Map Card */}
          <div className="px-5 py-4 bg-slate-900 dark:bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-semibold">
                  {currentMap.id === 'red-comuna-70'
                    ? 'RED HIDROGRÁFICA COMUNA 70'
                    : `ZONA Y CAUCE: QUEBRADA ${currentMap.name.toUpperCase()}`}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                {currentMap.basinTitle}
              </h2>
            </div>

            <div className="shrink-0 flex items-center gap-2 flex-wrap">
              {/* Quick Points Explorer */}
              <button
                type="button"
                onClick={() => setShowMapsQuickList(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Explorar puntos clave y sitios de referencia del sector"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-200" />
                <span>Puntos Clave</span>
                <span className="px-1.5 py-0.2 rounded bg-blue-700 text-[10px] font-mono">
                  {currentMap.landmarks.length}
                </span>
              </button>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border ${currentMap.riskBadge.bg} ${currentMap.riskBadge.color} ${currentMap.riskBadge.border}`}
              >
                {currentMap.riskBadge.label}
              </span>
            </div>
          </div>

          {/* Leaflet GIS Map Canvas (Full Fluid Space, No SIATA markers, No Centrar button) */}
          <div className="p-3 bg-slate-100 dark:bg-slate-950/60 transition-colors">
            <RealisticGisMap
              quebradaId={activeCuencaId}
              isAdmin={isAdmin}
              userSectorName={userSectorInfo.label}
              activeLayers={activeLayers}
              targetCoordinate={mapTargetCoordinate}
            />
          </div>
        </div>

        {/* Right Column: Recommendations & Protocol + Single Verified Safe Evacuation Point */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Recomendaciones
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Sector Quebrada {currentMap.name} · Directrices Preventivas
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                Hiperlocal
              </span>
            </div>

            {/* Dynamic, hyperlocal recommendations based strictly on the current basin */}
            <div className="space-y-3">
              {currentMap.specificInstructions.map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-2xl bg-slate-800/80 dark:bg-slate-900/80 border border-slate-700/80 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30 font-mono">
                    {item.step}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{item.title}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Single, non-redundant authoritative Safe Point for this basin */}
            <div className="mt-5 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zona Segura de Evacuación</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 font-bold border border-emerald-700">
                  GPS Verificado
                </span>
              </div>

              <div className="text-xs font-black text-white">{currentMap.evacuationPoint.name}</div>
              <div className="text-[11px] text-emerald-200 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{currentMap.evacuationPoint.address}</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">
                Capacidad: {currentMap.evacuationPoint.capacity} personas · {currentMap.evacuationPoint.contact}
              </div>

              <div className="mt-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const evac = currentMap.evacuationPoint;
                    if (evac.lat && evac.lng) {
                      setMapTargetCoordinate({
                        lat: evac.lat,
                        lng: evac.lng,
                        label: evac.name,
                        zoom: 16
                      });
                    } else {
                      const gisData = GIS_QUEBRADAS[activeCuencaId] || GIS_QUEBRADAS['la-picacha'];
                      setMapTargetCoordinate({
                        lat: gisData.evacuationPoints[0]?.lat || gisData.center[0],
                        lng: gisData.evacuationPoints[0]?.lng || gisData.center[1],
                        label: evac.name,
                        zoom: 16
                      });
                    }
                  }}
                  className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  title="Centrar mapa interactivo en esta zona segura"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ubicar en Mapa</span>
                </button>

                <a
                  href={getPointGoogleMapsUrl(currentMap.evacuationPoint)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver en Maps</span>
                </a>

                <a
                  href={getPointGoogleMapsDirectionsUrl(currentMap.evacuationPoint)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Trazar ruta de evacuación hacia este punto"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Ruta</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hydrographic Network of Comuna 70 (Altavista) - Exclusively for Administrators */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-black text-[11px] uppercase tracking-wider">
                  Panel de Supervisión · Rol Administrador
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Cartografía Oficial & Red General
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Red Hidrográfica y Sectores de Paso · Comuna 70
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Georreferenciación de las microcuencas del Corregimiento de Altavista.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={getPointGoogleMapsUrl('Corregimiento Altavista')}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Comuna 70 en Google Maps</span>
              </a>
            </div>
          </div>

          {/* Quebradas Grid with direct Google Maps routes (clean without La Esperanza block) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNetwork.map((item) => {
              const isSelected = selectedBranchId === item.id || selectedCuencaId === item.id.replace('-main', '').replace('-branch', '');
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 ring-2 ring-sky-400/30'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.name}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'seguro'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : item.status === 'alerta_amarilla'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {item.status === 'seguro' ? 'Normal' : item.status === 'alerta_amarilla' ? 'Vigilancia' : 'Crítico'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                        Recorrido y Sectores:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        {item.veredasPassed}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      onClick={() => {
                        const targetId = item.id.includes('altavista')
                          ? 'altavista'
                          : item.id.includes('picacha')
                          ? 'la-picacha'
                          : item.id.includes('buenavista')
                          ? 'buenavista'
                          : item.id.includes('guayabala')
                          ? 'la-guayabala'
                          : item.id.includes('pelon')
                          ? 'el-pelon'
                          : item.id.includes('buga')
                          ? 'buga-barcino'
                          : item.id.includes('ana-diaz')
                          ? 'ana-diaz'
                          : 'altavista';
                        handleSelectQuebrada(targetId);
                        setSelectedBranchId(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Crosshair className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>Ver en visor</span>
                    </button>

                    <a
                      href={getPointGoogleMapsUrl(item.googleMapsRef || item.name)}
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
      )}

      {/* Google Maps Quick Points Explorer Modal (Clean: Landmarks & Safe Points Only) */}
      {showMapsQuickList && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <MapPin className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      Directorio de Puntos
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Puntos de Referencia: Quebrada {currentMap.name}
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Sitios de Referencia y Puntos Clave ({currentMap.landmarks.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Haga clic en &quot;Ubicar&quot; para centrar el mapa GIS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentMap.landmarks.map((lm, idx) => (
                  <div
                    key={`modal-lm-${idx}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {lm.category || 'Punto de Interés'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{idx + 1}
                        </span>
                      </div>

                      <h5 className="font-black text-sm text-slate-900 dark:text-white leading-snug">
                        {lm.text}
                      </h5>

                      {lm.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {lm.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <a
                        href={getPointGoogleMapsUrl(lm)}
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
                          setSelectedLandmark(lm);
                          setSelectedEvacPoint(null);
                          setShowMapsQuickList(false);
                          // Centrar dinámicamente el mapa en las coordenadas de ese sector
                          if (lm.lat && lm.lng) {
                            setMapTargetCoordinate({
                              lat: lm.lat,
                              lng: lm.lng,
                              label: lm.text,
                              zoom: 16
                            });
                          } else {
                            const gisData = GIS_QUEBRADAS[activeCuencaId] || GIS_QUEBRADAS['la-picacha'];
                            setMapTargetCoordinate({
                              lat: gisData.center[0],
                              lng: gisData.center[1],
                              label: lm.text,
                              zoom: 16
                            });
                          }
                        }}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 flex items-center gap-1"
                      >
                        <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Ubicar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Directorio georreferenciado de la cuenca activa.</span>
              <button
                onClick={() => setShowMapsQuickList(false)}
                className="py-2 px-5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
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
