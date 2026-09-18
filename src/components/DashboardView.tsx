import React, { useState } from 'react';
import {
  CUENCAS_LIST,
  INITIAL_VIGIA_REPORTS,
  SECTORS_LIST
} from '../data/cuencasData';
import { CuencaData, VigiaReport, CitizenReportRecord } from '../types';
import {
  AlertTriangle,
  Radio,
  Video,
  Eye,
  TrendingUp,
  BatteryCharging,
  Gauge,
  Send,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Info,
  Droplets,
  Building,
  Waves,
  Calendar,
  Clock,
  Sparkles,
  Camera,
  Maximize2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigateToMap: (cuencaId?: string) => void;
  onOpenCuencaModal: (cuenca: CuencaData) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToMap,
  onOpenCuencaModal
}) => {
  const { currentUser } = useAuth();
  const [selectedCuencaFilter, setSelectedCuencaFilter] = useState<string>('todas');
  const [reportsList, setReportsList] = useState<VigiaReport[]>(INITIAL_VIGIA_REPORTS);

  // Citizen report form state
  const [reportLevel, setReportLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('bajo_muro');
  const [reportLocation, setReportLocation] = useState<string>('');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  const handleCitizenReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLocation) {
      alert('Por favor selecciona una ubicación aproximada de la quebrada.');
      return;
    }

    const newVigiaReport: VigiaReport = {
      id: `rep-citizen-${Date.now()}`,
      authorName: currentUser ? currentUser.name : 'Vecino de la comunidad',
      isVerified: true,
      timestamp: new Date().toISOString(),
      timeAgo: 'Justo ahora',
      content: `Nivel observado: ${
        reportLevel === 'desbordada'
          ? '⚠️ DESBORDADA'
          : reportLevel === 'al_puente'
          ? 'Nivel al puente'
          : 'Bajo muro'
      }. ${reportNotes ? `"${reportNotes}"` : 'Sin novedades adicionales reportadas.'}`,
      location: reportLocation,
      imageAttached: !!reportImage,
      imageUrl: reportImage || undefined,
      protocolPhase: reportLevel === 'desbordada' ? 'Alerta Crítica' : undefined
    };

    setReportsList([newVigiaReport, ...reportsList]);
    setReportSuccessMessage('¡Aviso verificado y publicado para toda la comunidad!');
    setReportNotes('');
    setReportImage(null);
    setTimeout(() => {
      setReportSuccessMessage(null);
    }, 6000);
  };

  const filteredCuencas =
    selectedCuencaFilter === 'todas'
      ? CUENCAS_LIST
      : CUENCAS_LIST.filter((c) => c.id === selectedCuencaFilter);

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: Hero Diagnostic & SIATA Live Camera Box */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: General Community Diagnostic Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>SISTEMA DE DETECCIÓN HIDROLÓGICA · COMUNA 70</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                Medellín, Antioquia
              </span>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-600 to-[#b43e12] text-white flex items-center justify-center shrink-0 shadow-md">
                <Waves className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  DIAGNÓSTICO GENERAL COMUNITARIO
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight mt-0.5">
                  PRECAUCIÓN EN CAUCES ALTOS
                </h1>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Saturación del suelo al 78% en sectores Buga y Ladrilleras. Crecientes lentas con
                  arrastre moderado de sedimentos.
                </p>
              </div>
            </div>

            {/* 3 Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 my-6">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center">
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  Precipitación 1h
                </div>
                <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                  38.4 <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
                <div className="text-[11px] sm:text-xs text-amber-800 font-medium truncate">
                  Nivel Promedio
                </div>
                <div className="text-lg sm:text-2xl font-black text-amber-800 mt-1">
                  Elevado
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center">
                <div className="text-[11px] sm:text-xs text-emerald-800 font-medium truncate">
                  Estaciones SIATA
                </div>
                <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-1 font-mono">
                  4 / 4
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToMap()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all group cursor-pointer"
            >
              <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Ver Mapa de Riesgo SIATA</span>
            </button>
          </div>
        </div>

        {/* Right: Authentic Hydrological Telemetry & SIATA Early Warning Panel */}
        <div className="lg:col-span-5 bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                NIVELES SIATA & REPORTES VECINALES
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-800/80">
              SIATA EN LÍNEA
            </span>
          </div>

          {/* Real Hydrological Telemetry Bars per Quebrada */}
          <div className="my-3 space-y-3">
            {CUENCAS_LIST.map((cuenca) => (
              <div
                key={cuenca.id}
                onClick={() => onNavigateToMap(cuenca.id)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                title={`Ver mapa individual de Quebrada ${cuenca.name}`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cuenca.status === 'seguro'
                          ? 'bg-emerald-500'
                          : cuenca.status === 'alerta_amarilla'
                          ? 'bg-amber-500'
                          : 'bg-rose-500 animate-pulse'
                      }`}
                    ></span>
                    <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                      Quebrada {cuenca.name}
                    </span>
                  </div>
                  <div className="font-mono text-xs">
                    <span
                      className={`font-bold ${
                        cuenca.status === 'seguro' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {cuenca.currentLevel.toFixed(2)}m
                    </span>
                    <span className="text-slate-500 text-[11px]"> / {cuenca.maxThreshold.toFixed(2)}m</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cuenca.status === 'seguro'
                        ? 'bg-emerald-500'
                        : 'bg-linear-to-r from-amber-500 to-rose-600'
                    }`}
                    style={{ width: `${cuenca.capacityPercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>SIATA: {cuenca.siataStationName}</span>
                  <span className="text-amber-400 font-semibold group-hover:underline">
                    Lluvia: {cuenca.rainIntensityMmH} mm/h
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Telemetry */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Telemetría Oficial SIATA Comuna 70</span>
            </div>
            <span>Actualización: 60s</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Inspección de Cuencas Directas Selector */}
      <section className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Inspección de Cuencas Directas
            </h2>
            <p className="text-xs text-slate-500">
              Seleccione una quebrada para desplegar métricas en tiempo real de su sector.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <select
            value={selectedCuencaFilter}
            onChange={(e) => setSelectedCuencaFilter(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-sm font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
          >
            <option value="todas">Todas las 4 Cuencas (General)</option>
            {CUENCAS_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                Quebrada {c.name} ({c.capacityPercentage}%)
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* SECTION 3: Monitoreo Hidrológico de las 4 Cuencas Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SENSORES DE NIVEL ULTRASÓNICO Y PLUVIÓMETROS COMUNITARIOS
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Monitoreo Hidrológico de las 4 Cuencas
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Seguro (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Precaución (50-75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Alerta Roja (&gt;75%)</span>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCuencas.map((cuenca) => {
            const isAlert = cuenca.capacityPercentage >= 50;
            return (
              <div
                key={cuenca.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                        cuenca.status === 'seguro'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{cuenca.status === 'seguro' ? 'Nivel Normal' : 'Alerta Hidrológica'}</span>
                    </span>

                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      SIATA {cuenca.siataStationId}
                    </span>
                  </div>

                  {/* Title & Sector */}
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {cuenca.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 truncate">
                    {cuenca.sector}
                  </p>

                  {/* Big Percentage & Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span
                        className={`text-3xl font-black font-mono ${
                          cuenca.status === 'seguro' ? 'text-emerald-700' : 'text-[#b43e12]'
                        }`}
                      >
                        {cuenca.capacityPercentage}%
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Nivel de Cota</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cuenca.status === 'seguro'
                            ? 'bg-emerald-500'
                            : 'bg-linear-to-r from-amber-500 to-[#b43e12]'
                        }`}
                        style={{ width: `${cuenca.capacityPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Community report status pill */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium">Reportes Ciudadanos:</span>
                      <span className="font-bold text-slate-800">{cuenca.communityStatus}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Lluvia SIATA: <strong className="text-slate-700 font-mono">{cuenca.rainIntensityMmH} mm/h</strong>
                    </div>
                  </div>

                  {/* Telemetry rows */}
                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Nivel actual:</span>
                      <span className="font-bold text-slate-800">{cuenca.currentLevel.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Cota máxima:</span>
                      <span className="font-bold text-slate-800">{cuenca.maxThreshold.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">Estación SIATA:</span>
                      <span className="text-slate-700 font-sans truncate max-w-[130px] font-semibold">{cuenca.siataStationName}</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <button
                  onClick={() => onOpenCuencaModal(cuenca)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Ver Ficha Cuenca</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Split Community Opinions & Instant Citizen Report */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Avisos Verificados */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-[#8B0000]">
                  <Radio className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Avisos Verificados
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Opiniones de la comunidad
              </span>
            </div>

            {/* Feed List */}
            <div className="space-y-4">
              {reportsList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {item.authorName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        · Opinión de la comunidad
                      </span>
                      {item.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Aviso verificado</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">
                      {item.timeAgo}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    &quot;{item.content}&quot;
                  </p>

                  {/* Attached photo preview - visible directly in the card */}
                  {item.imageUrl && (
                    <div
                      onClick={() => setSelectedImageModal(item.imageUrl!)}
                      className="mb-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 group cursor-pointer relative shadow-2xs"
                      title="Haz clic para ver la foto completa"
                    >
                      <img
                        src={item.imageUrl}
                        alt={`Evidencia en ${item.location}`}
                        className="w-full h-48 sm:h-52 object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent flex items-end p-2.5">
                        <div className="flex items-center justify-between w-full text-white text-xs">
                          <span className="flex items-center gap-1.5 font-medium bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>Foto adjunta en {item.location}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors">
                            <Maximize2 className="w-3 h-3" />
                            <span>Ver foto</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </span>
                    {item.protocolPhase && (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                        {item.protocolPhase}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Reporte Ciudadano Inmediato */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-red-100 text-[#8B0000] shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Reporte Ciudadano Inmediato
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sin registros ni contraseñas. Comparte lo que observas en la quebrada para mantener
                a toda la comunidad informada.
              </p>
            </div>
          </div>

          {reportSuccessMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reportSuccessMessage}</span>
            </div>
          )}

          <form onSubmit={handleCitizenReportSubmit} className="space-y-4">
            {/* 1: Level Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                ¿Cómo ve el nivel de la quebrada?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setReportLevel('bajo_muro')}
                  className={`py-3 px-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    reportLevel === 'bajo_muro'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Waves className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs">Bajo muro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportLevel('al_puente')}
                  className={`py-3 px-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    reportLevel === 'al_puente'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-600" />
                  <span className="text-xs">Al puente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportLevel('desbordada')}
                  className={`py-3 px-2 rounded-xl text-center border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    reportLevel === 'desbordada'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs">Desbordada</span>
                </button>
              </div>
            </div>

            {/* 2: Location Sector Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Ubicación aproximada
              </label>
              <select
                value={reportLocation}
                onChange={(e) => setReportLocation(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden cursor-pointer"
              >
                <option value="">Seleccione sector o vereda...</option>
                {SECTORS_LIST.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* 3: Obstruction note text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                ¿Qué observa en el tramo?
              </label>
              <input
                type="text"
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Ej: Palos acumulados cerca al puente o agua muy oscura con lodo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            {/* 4: Image attachment field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Adjuntar foto de la quebrada (opcional)
                </label>
                {reportImage && (
                  <button
                    type="button"
                    onClick={() => setReportImage(null)}
                    className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    Quitar foto
                  </button>
                )}
              </div>

              {reportImage ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-950 h-36 w-full shadow-xs">
                  <img
                    src={reportImage}
                    alt="Foto adjunta"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setReportImage(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    ✓ Foto lista para publicar
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer text-xs font-semibold text-slate-700">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>Tomar foto o subir desde tu dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setReportImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="shrink-0 text-slate-400">O usar foto de muestra:</span>
                    <button
                      type="button"
                      onClick={() => setReportImage('/quebrada_river_level.jpg')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Caudal en puente
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportImage('/quebrada_debris_channel.jpg')}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      Canal despejado
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Aviso Verificado</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Acceso libre para habitantes de Altavista · Sin registro previo</span>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION 5: Footer */}
      <footer className="mt-12 pt-8 border-t border-slate-200 text-slate-600 text-xs sm:text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-base font-extrabold text-[#8B0000] mb-2">
              Overflows Altavista
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Red comunitaria de alerta y respuesta temprana para la protección de vidas en la
              Comuna 70 ante crecientes súbitas de quebradas.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Líneas de Auxilio Directo</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="text-red-700 font-bold">📞 Emergencias Medellín:</span>
                <a href="tel:123" className="font-bold hover:underline">123</a>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-red-700 font-bold">🚒 Bomberos Medellín:</span>
                <a href="tel:119" className="font-bold hover:underline">119</a>
              </li>
              <li className="text-slate-500">
                Línea Comunitaria Altavista: 300 240 7070
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Monitoreo y Cuencas</h4>
            <ul className="space-y-1 text-xs text-slate-500">
              <li>Cuenca La Picacha</li>
              <li>Cuenca Altavista</li>
              <li>Cuenca Buenavista</li>
              <li>Cuenca La Cañada</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Institucional</h4>
            <ul className="space-y-1 text-xs">
              <li className="text-[#8B0000] hover:underline cursor-pointer">
                Portal de Transparencia Comunitaria
              </li>
              <li className="text-slate-600">Convenio SIATA · Alcaldía de Medellín</li>
              <li className="text-slate-600">DAGRD - Gestión del Riesgo Comunal</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            © 2026 Overflows Altavista - Comuna 70 Medellín. Todos los derechos reservados.
          </div>
          <div>Sistema de Salvaguarda y Monitoreo Hidrológico</div>
        </div>
      </footer>

      {/* Image Lightbox Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Foto de Evidencia · Quebrada de Altavista</span>
              </div>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedImageModal}
                alt="Evidencia ampliada"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Registro fotográfico ciudadano publicado en Avisos Verificados</span>
              <button
                onClick={() => setSelectedImageModal(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
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
