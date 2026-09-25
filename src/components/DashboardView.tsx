import React from 'react';
import { CUENCAS_LIST } from '../data/cuencasData';
import { GIS_QUEBRADAS } from '../data/gisQuebradasData';
import { CuencaData } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Waves,
  MapPin,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Compass,
  PhoneCall,
  Camera,
  Navigation,
  ArrowRight,
  Droplets,
  Wind,
  Home,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useSiataRealtime } from '../context/SiataRealtimeContext';

interface DashboardProps {
  selectedCuencaId?: string;
  onNavigateToMap: (cuencaId?: string) => void;
  onOpenCuencaModal?: (cuenca: CuencaData) => void;
  onNavigateToReports?: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  selectedCuencaId,
  onNavigateToMap,
  onNavigateToReports
}) => {
  const { currentUser } = useAuth();
  const { cuencas, weather, overallAlertLevel, lastSyncTime } = useSiataRealtime();

  // Compute user assigned cuenca ID based on sector
  const userAssignedCuencaId = React.useMemo(() => {
    if (currentUser?.barrioSector) {
      const s = currentUser.barrioSector.toLowerCase();
      if (s.includes('aguas frías') || s.includes('aguas frias') || s.includes('morro plan') || s.includes('picacha') || s.includes('brisas')) return 'la-picacha';
      if (s.includes('esperanza') || s.includes('chispero') || s.includes('cañada')) return 'la-canada';
      if (s.includes('morro') || s.includes('corazón') || s.includes('corazon') || s.includes('buenavista') || s.includes('san judas')) return 'buenavista';
      if (s.includes('manzanillo') || s.includes('jardín') || s.includes('jardin') || s.includes('guayabala')) return 'la-guayabala';
    }
    return 'altavista';
  }, [currentUser?.barrioSector]);

  // Strictly isolated to the assigned / selected cuenca (NO SWITCHING TO OTHER QUEBRADAS)
  const effectiveCuencaId = selectedCuencaId || userAssignedCuencaId;
  const cuencasSource = cuencas && cuencas.length > 0 ? cuencas : CUENCAS_LIST;
  const activeCuenca = cuencasSource.find((c) => c.id === effectiveCuencaId) || cuencasSource[0];
  const gisData = GIS_QUEBRADAS[activeCuenca.id] || GIS_QUEBRADAS['altavista'];

  const stationCode = activeCuenca.siataStationId.replace('SIATA-', 'EST-');
  const isSafe = activeCuenca.status === 'seguro';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. SECTOR / QUEBRADA HEADER: STRICTLY ISOLATED TO ASSIGNED QUEBRADA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Waves className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Red Hidrológica Comuna 70 · Altavista
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Telemetría en Tiempo Real</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 flex items-center gap-2 flex-wrap">
                <span>Quebrada {activeCuenca.name}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 font-sans">
                  <Home className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sector Asignado: {currentUser?.barrioSector || activeCuenca.sector}</span>
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              Sincronizado: <strong className="text-slate-800 font-mono">{lastSyncTime || 'En tiempo real'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED HYDRAULIC & METEOROLOGICAL CARD FOR THIS QUEBRADA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
        {/* Card Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {stationCode}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  activeCuenca.status === 'alerta_naranja'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : activeCuenca.status === 'alerta_amarilla'
                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {activeCuenca.status === 'alerta_naranja'
                  ? 'Alerta Preventiva: Aumento de caudal'
                  : activeCuenca.status === 'alerta_amarilla'
                  ? 'Vigilancia Preventiva: Flujo activo'
                  : 'Cauce Estable / Tranquilidad Hidrológica'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Monitoreo Hidrológico de Quebrada {activeCuenca.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Sectores bajo vigilancia: <strong>{activeCuenca.sector}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToMap(activeCuenca.id)}
              className="px-5 py-3 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver en Mapa de Riesgo en Vivo</span>
            </button>
          </div>
        </div>

        {/* 4-Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Nivel Actual del Cauce</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
              {activeCuenca.currentLevel.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">m</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Cota máx: {activeCuenca.maxThreshold.toFixed(2)} m
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Capacidad del Cauce</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
              {activeCuenca.capacityPercentage}
              <span className="text-xs font-normal text-slate-500">%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeCuenca.capacityPercentage > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(activeCuenca.capacityPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Precipitación 1h</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
              {activeCuenca.rainIntensityMmH}{' '}
              <span className="text-xs font-normal text-slate-500">mm/h</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {activeCuenca.rainIntensityMmH < 2 ? 'Tiempo seco / Despejado' : 'Lluvia registrada'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Velocidad y Flujo</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
              {activeCuenca.speed}{' '}
              <span className="text-xs font-normal text-slate-500">m/s</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 font-medium capitalize">
              Tendencia: <strong>{activeCuenca.trend}</strong>
            </div>
          </div>
        </div>

        {/* Basin Details & Critical Points */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Descripción Oficial del Cauce
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {activeCuenca.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Puntos Neurálgicos Georreferenciados en este Tramo
            </h3>
            <ul className="space-y-2">
              {activeCuenca.criticalPoints.map((pt, idx) => (
                <li
                  key={idx}
                  className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. EVACUATION POINTS & SAFE ZONES SPECIFIC TO THIS QUEBRADA */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Puntos de Encuentro Seguro y Rutas de Evacuación
              </h3>
              <p className="text-xs text-slate-500">
                Zonas altas designadas para la comunidad de Quebrada {activeCuenca.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gisData?.evacuationPoints?.map((evac) => (
            <div
              key={evac.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    Zona Segura
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    Capacidad: {evac.capacity} pers.
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mt-2">
                  {evac.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {evac.address}
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Ruta Segura:</span>
                  <span className="text-slate-600 text-[11px] leading-relaxed">{evac.safeRoute}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Enlace:</span>
                <span className="font-mono font-bold text-slate-800">{evac.contact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. EMERGENCY PROTOCOL & CITIZEN REPORTS DIRECT ACCESS BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emergency Helplines */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Líneas Directas de Emergencia
                </h3>
                <p className="text-xs text-slate-500">
                  Atención prioritaria para el Corregimiento de Altavista
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              En caso de creciente súbita, obstrucción por empalizada o alerta roja, comunícate de inmediato con las entidades de socorro:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergencias Medellín</span>
                <span className="text-xl font-black text-slate-900 font-mono">123</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Policía, Bomberos y DAGRD</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuerpo de Bomberos</span>
                <span className="text-xl font-black text-slate-900 font-mono">119</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Estación Guayabal / Belén</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Citizen Reports Notice (pointing to independent sidebar section) */}
        <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Módulo de Reportes Ciudadanos
                </h3>
                <p className="text-xs text-slate-400">
                  Sección independiente en la barra lateral izquierda
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Los reportes comunitarios están centralizados en su sección exclusiva con validación de tu sector residencial ({currentUser?.barrioSector || 'Altavista'}) y con adjunto obligatorio de fotos o videos para evitar falsas alarmas.
            </p>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-slate-200 mb-4">
              <div className="flex items-center gap-2 font-bold text-white mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Exigencia de Evidencia Fotográfica y Video</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Solo se publican reportes respaldados con archivos multimedia para garantizar la tranquilidad comunitaria.
              </p>
            </div>
          </div>

          {onNavigateToReports && (
            <button
              onClick={onNavigateToReports}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Ir a la Sección de Reportes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
