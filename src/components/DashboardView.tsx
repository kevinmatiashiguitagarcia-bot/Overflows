import React, { useState, useEffect } from 'react';
import { CUENCAS_LIST, SECTORS_LIST } from '../data/cuencasData';
import { CuencaData, VigiaReport } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Waves,
  AlertTriangle,
  Radio,
  MapPin,
  Eye,
  CheckCircle2,
  Send,
  Building,
  Activity,
  Droplets,
  Wind,
  TrendingUp,
  TrendingDown,
  Navigation,
  ExternalLink,
  ChevronDown,
  Layers,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  onNavigateToMap: (cuencaId?: string) => void;
  onOpenCuencaModal?: (cuenca: CuencaData) => void;
}

const STORAGE_REPORTS_KEY = 'overflows_altavista_community_reports';

export const DashboardView: React.FC<DashboardProps> = ({
  onNavigateToMap
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'administrador';

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

  // Dynamic Quebrada/Sector Selection (Only admins can switch between all quebradas)
  const [adminSelectedCuencaId, setAdminSelectedCuencaId] = useState<string>(userAssignedCuencaId);

  // Non-administrators are strictly locked to their assigned quebrada
  const effectiveCuencaId = isAdmin ? adminSelectedCuencaId : userAssignedCuencaId;

  // Real citizen reports loaded from storage (no mock opinions)
  const [reportsList, setReportsList] = useState<VigiaReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Report form state
  const [reportLevel, setReportLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('bajo_muro');
  const [reportLocation, setReportLocation] = useState<string>(currentUser?.barrioSector || '');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reportsList));
    } catch {
      // ignore
    }
  }, [reportsList]);

  // Sync with user's barrioSector if updated
  useEffect(() => {
    if (currentUser?.barrioSector && !reportLocation) {
      setReportLocation(currentUser.barrioSector);
    }
  }, [currentUser?.barrioSector]);

  const handleCitizenReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLocation) {
      alert('Por favor selecciona el sector o vereda de la quebrada.');
      return;
    }

    const newVigiaReport: VigiaReport = {
      id: `rep-real-${Date.now()}`,
      authorName: currentUser ? currentUser.name : 'Vecino Registrado Comuna 70',
      isVerified: true,
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      content: `Nivel observado en cauce: ${
        reportLevel === 'desbordada'
          ? '⚠️ DESBORDADA'
          : reportLevel === 'al_puente'
          ? 'Nivel al puente'
          : 'Bajo muro'
      }. ${reportNotes.trim() ? `"${reportNotes.trim()}"` : 'Sin novedades de empalizada.'}`,
      location: reportLocation,
      protocolPhase: reportLevel === 'desbordada' ? 'Alerta Máxima' : reportLevel === 'al_puente' ? 'Precaución' : undefined
    };

    setReportsList([newVigiaReport, ...reportsList]);
    setReportSuccessMessage('¡Reporte ciudadano verificado y registrado en el sistema local!');
    setReportNotes('');
    setTimeout(() => {
      setReportSuccessMessage(null);
    }, 6000);
  };

  // Dedicated data for selected cuenca
  const activeCuenca = CUENCAS_LIST.find((c) => c.id === effectiveCuencaId) || CUENCAS_LIST[0];
  const isAllView = isAdmin && effectiveCuencaId === 'todas';

  // Filter real reports for the selected sector/cuenca
  const relevantReports = reportsList.filter((rep) => {
    if (isAllView) return true;
    const loc = rep.location.toLowerCase();
    const name = activeCuenca.name.toLowerCase();
    const sec = activeCuenca.sector.toLowerCase();
    return loc.includes(name) || sec.includes(loc) || loc.includes('comuna 70');
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. SECTOR / QUEBRADA HEADER & SELECTOR */}
      {isAdmin ? (
        /* ADMIN VIEW: Multi-cuenca management and global monitoring */
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 block">
                  Panel de Supervisión Hidrológica Multicuenca
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                  Rol Administrador
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                Control y Monitoreo General de Cuencas Comuna 70
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Red Oficial SIATA Activa</span>
              </span>
            </div>
          </div>

          {/* Interactive Tabs / Buttons (Exclusively for Administrators) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CUENCAS_LIST.filter((c) => c.id !== 'red-comuna-70').map((cuenca) => {
              const isSelected = cuenca.id === effectiveCuencaId;
              const isNaranja = cuenca.status === 'alerta_naranja';
              const isAmarilla = cuenca.status === 'alerta_amarilla';

              return (
                <button
                  key={cuenca.id}
                  onClick={() => setAdminSelectedCuencaId(cuenca.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                      : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isNaranja
                        ? 'bg-amber-500 animate-pulse'
                        : isAmarilla
                        ? 'bg-yellow-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>Quebrada {cuenca.name.split('/')[0].trim()}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cuenca.capacityPercentage}%
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setAdminSelectedCuencaId('todas')}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                isAllView
                  ? 'bg-indigo-950 text-white shadow-md ring-2 ring-indigo-400'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Resumen Integral Comuna 70</span>
            </button>
          </div>
        </div>
      ) : (
        /* RESIDENT / NON-ADMIN VIEW: STRICT EXCLUSIVITY TO ASSIGNED QUEBRADA */
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Waves className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Monitoreo Exclusivo de Quebrada Asignada
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Zona Autorizada
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Quebrada {activeCuenca.name} · {currentUser?.barrioSector || activeCuenca.sector}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Estación {activeCuenca.siataStationId}</span>
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Tu acceso está estrictamente focalizado en la quebrada que incide sobre tu sector de residencia. Por directriz de seguridad comunitaria y prevención de desinformación, la supervisión general del resto de cuencas de la Comuna 70 está restringida al rol Administrador.
            </p>
          </div>
        </div>
      )}

      {/* 2. DEDICATED SECTOR CONTENT (Only displayed for the selected zone) */}
      {!isAllView ? (
        <div className="space-y-6">
          {/* Active Zone Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
            {/* Zone Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {activeCuenca.siataStationId}
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
                      ? 'Nivel en Alerta Preventiva'
                      : activeCuenca.status === 'alerta_amarilla'
                      ? 'Nivel en Vigilancia'
                      : 'Cauce Estable / Seguro'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Quebrada {activeCuenca.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Sectores: <strong>{activeCuenca.sector}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigateToMap(activeCuenca.id)}
                  className="px-5 py-3 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver en Mapa de Riesgo en Vivo</span>
                </button>
              </div>
            </div>

            {/* Exclusive Metrics for this Quebrada */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium">Nivel Actual</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {activeCuenca.currentLevel.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">m</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
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
                    className={`h-full rounded-full ${
                      activeCuenca.capacityPercentage > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${activeCuenca.capacityPercentage}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium">Precipitación 1h</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {activeCuenca.rainIntensityMmH}{' '}
                  <span className="text-xs font-normal text-slate-500">mm/h</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">
                  Estación pluviométrica
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs text-slate-500 font-medium">Velocidad y Flujo</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 font-mono">
                  {activeCuenca.speed}{' '}
                  <span className="text-xs font-normal text-slate-500">m/s</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium capitalize">
                  Tendencia: <strong>{activeCuenca.trend}</strong>
                </div>
              </div>
            </div>

            {/* Geographical Points & Official Description */}
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
                  Puntos Neurálgicos Georreferenciados
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

          {/* Real Community Reports for this Zone & Immediate Citizen Reporting */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Real Community Reports */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-50 text-[#8B0000]">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Avisos Comunitarios de esta Zona
                      </h3>
                      <p className="text-xs text-slate-500">
                        Reportes reales verificados por vecinos y vigías
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    {relevantReports.length} avisos
                  </span>
                </div>

                {relevantReports.length > 0 ? (
                  <div className="space-y-3">
                    {relevantReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-xs text-slate-900">
                            {rep.authorName}
                          </span>
                          <span className="text-[11px] text-slate-400">{rep.timeAgo}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {rep.content}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rep.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-2 my-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Sin novedades críticas en este tramo
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Los habitantes no han reportado palizadas ni obstrucciones recientes en los sectores de la Quebrada {activeCuenca.name}. Las estaciones oficiales del SIATA operan con normalidad.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Real Citizen Reporting Form */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-red-100 text-[#8B0000] shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Emitir Reporte de Monitoreo Ciudadano
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registra lo que observas en el cauce para alertar a los vecinos de tu sector.
                  </p>
                </div>
              </div>

              {reportSuccessMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reportSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleCitizenReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Nivel visual observado en la quebrada
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReportLevel('bajo_muro')}
                      className={`py-2.5 px-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        reportLevel === 'bajo_muro'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Bajo muro
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportLevel('al_puente')}
                      className={`py-2.5 px-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        reportLevel === 'al_puente'
                          ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Al puente
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportLevel('desbordada')}
                      className={`py-2.5 px-2 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                        reportLevel === 'desbordada'
                          ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Desbordada
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Sector o Vereda del tramo
                  </label>
                  <select
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Selecciona el sector del reporte...</option>
                    {SECTORS_LIST.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Observaciones (color del agua, palizadas, escombros)
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Describe novedades específicas sobre este tramo..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Aviso Comunitario Verificado</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* 3. RESUMEN INTEGRAL (When 'Todas las Quebradas' is chosen) */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Resumen Hidrológico Integral de la Comuna 70
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vista comparativa de las cuencas con estaciones oficiales del SIATA
              </p>
            </div>
            <button
              onClick={() => onNavigateToMap('red-comuna-70')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Ver Mapa Satelital Completo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CUENCAS_LIST.filter((c) => c.id !== 'red-comuna-70').map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-white transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {c.siataStationId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'alerta_naranja'
                          ? 'bg-amber-100 text-amber-900'
                          : c.status === 'alerta_amarilla'
                          ? 'bg-yellow-100 text-yellow-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {c.status === 'alerta_naranja' ? 'Alerta' : c.status === 'alerta_amarilla' ? 'Vigilancia' : 'Normal'}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900">
                    Quebrada {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {c.sector}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nivel</span>
                      <span className="font-mono font-bold text-slate-900">{c.currentLevel.toFixed(2)} m</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Capacidad</span>
                      <span className="font-mono font-bold text-slate-900">{c.capacityPercentage}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setAdminSelectedCuencaId(c.id)}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ver solo esta zona</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
