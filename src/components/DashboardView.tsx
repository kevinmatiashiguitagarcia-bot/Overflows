import React, { useState, useEffect } from 'react';
import { CUENCAS_LIST, SECTORS_LIST } from '../data/cuencasData';
import { CuencaData } from '../types';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  CitizenReportRecord,
  getStoredReports,
  createCitizenReport,
  ReportMediaItem
} from '../data/reportsService';
import {
  Waves,
  AlertTriangle,
  Radio,
  MapPin,
  CheckCircle2,
  Send,
  Activity,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
  Compass,
  ArrowRight,
  Camera,
  Upload,
  X
} from 'lucide-react';

interface DashboardProps {
  onNavigateToMap: (cuencaId?: string) => void;
  onOpenCuencaModal?: (cuenca: CuencaData) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  onNavigateToMap
}) => {
  const { currentUser } = useAuth();
  const { t, language } = useThemeLanguage();
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
  const [showCompactList, setShowCompactList] = useState<boolean>(false);

  // Non-administrators are strictly locked to their assigned quebrada
  const effectiveCuencaId = isAdmin ? adminSelectedCuencaId : userAssignedCuencaId;

  // Real citizen reports loaded from shared moderated storage (no mock opinions)
  const [reportsList, setReportsList] = useState<CitizenReportRecord[]>(() => getStoredReports());

  // Report form state in dashboard
  const [reportLevel, setReportLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('bajo_muro');
  const [reportLocation, setReportLocation] = useState<string>(currentUser?.barrioSector || '');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportAttachments, setReportAttachments] = useState<ReportMediaItem[]>([]);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync reports
  useEffect(() => {
    const handleSync = () => {
      setReportsList(getStoredReports());
    };
    window.addEventListener('overflows_reports_updated', handleSync);
    return () => window.removeEventListener('overflows_reports_updated', handleSync);
  }, []);

  // Sync with user's barrioSector if updated
  useEffect(() => {
    if (currentUser?.barrioSector) {
      setReportLocation(currentUser.barrioSector);
    }
  }, [currentUser?.barrioSector]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setReportError(null);
    const newItems: ReportMediaItem[] = [];

    (Array.from(files) as File[]).forEach((file: File) => {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (isImage || isVideo) {
        newItems.push({
          id: `file-dash-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: isVideo ? 'video' : 'image',
          url: URL.createObjectURL(file)
        });
      }
    });

    setReportAttachments((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const handleCitizenReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);

    // Mandatory photo/video verification
    if (reportAttachments.length === 0) {
      setReportError(t('reports.media_required'));
      return;
    }

    if (!reportNotes.trim()) {
      setReportError(t('reports.desc_label'));
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      createCitizenReport({
        userName: currentUser?.name || 'Vecino Registrado',
        userRole: currentUser?.role || 'habitante',
        userEmail: currentUser?.email,
        sector: reportLocation || currentUser?.barrioSector || 'Sector Residencial',
        quebrada: activeCuenca.name,
        level: reportLevel,
        description: reportNotes,
        media: reportAttachments
      });

      setReportsList(getStoredReports());
      setIsSubmitting(false);
      setReportSuccessMessage(t('reports.pending_approval_notice'));
      setReportNotes('');
      setReportAttachments([]);
      setTimeout(() => {
        setReportSuccessMessage(null);
      }, 7000);
    }, 600);
  };

  // Dedicated data for selected cuenca
  const activeCuenca = CUENCAS_LIST.find((c) => c.id === effectiveCuencaId) || CUENCAS_LIST[0];
  const isAllView = isAdmin && effectiveCuencaId === 'todas';

  // Only approved reports appear in the community feed
  const approvedReports = reportsList.filter((rep) => rep.status === 'aprobado');

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Toolbar (Admin Multi-cuenca vs Non-Admin Exclusive) */}
      {isAdmin ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Panel de Supervisión Hidrológica Multicuenca
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                  Rol Administrador
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                Control y Monitoreo General de Cuencas Comuna 70
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t('status.normal') || 'Normalidad'}</span>
              </span>
            </div>
          </div>

          {/* Interactive Tabs / Buttons (Exclusively for Administrators) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CUENCAS_LIST.filter((c) => c.id !== 'red-comuna-70').map((cuenca) => {
              const isSelected = cuenca.id === effectiveCuencaId;
              return (
                <button
                  key={cuenca.id}
                  onClick={() => setAdminSelectedCuencaId(cuenca.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md ring-2 ring-slate-900/20'
                      : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Quebrada {cuenca.name.split('/')[0].trim()}</span>
                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
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
                  : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Resumen Integral Comuna 70</span>
            </button>
          </div>
        </div>
      ) : (
        /* RESIDENT / NON-ADMIN VIEW: COMPACT OVERVIEW DRAWER + ASSIGNED STREAM */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#8B0000] to-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Waves className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('nav.dashboard')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    {t('status.normal') || 'Normal'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Quebrada {activeCuenca.name} · {currentUser?.barrioSector || activeCuenca.sector}
                </h2>
              </div>
            </div>

            {/* Compact List Toggle Button */}
            <button
              type="button"
              onClick={() => setShowCompactList(!showCompactList)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto border border-slate-200 dark:border-slate-700"
            >
              <Layers className="w-4 h-4 text-[#8B0000] dark:text-red-400" />
              <span>Panorama de Quebradas Comuna 70</span>
              {showCompactList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Compact Quebradas Overview (Drawer without saturating the screen) */}
          {showCompactList && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider">
                  Listado Resumido de Quebradas Comuna 70 (Altavista)
                </span>
                <span>Todas en condición normal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {CUENCAS_LIST.filter((c) => c.id !== 'red-comuna-70').map((c) => {
                  const isCurrent = c.id === effectiveCuencaId;
                  return (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-white dark:bg-slate-900 border-[#8B0000] ring-1 ring-[#8B0000]/30 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {c.name.split('/')[0]}
                        </span>
                        <span className="text-xs px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {c.capacityPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {c.sector}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DEDICATED SECTOR CONTENT */}
      {!isAllView ? (
        <div className="space-y-6">
          {/* Active Zone Main Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
            {/* Zone Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {activeCuenca.siataStationId}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {t('status.normal') || 'Normalidad Hidrológica'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  Quebrada {activeCuenca.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Sectores: <strong>{activeCuenca.sector}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onNavigateToMap(activeCuenca.id)}
                  className="px-5 py-3 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-red-200" />
                  <span>{t('nav.map')}</span>
                </button>
              </div>
            </div>

            {/* Gauges & Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase block">
                  Cota Actual de Nivel
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {activeCuenca.currentLevel.toFixed(2)} m
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  Umbral máximo: {activeCuenca.maxThreshold.toFixed(2)} m
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase block">
                  Capacidad Utilizada
                </span>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {activeCuenca.capacityPercentage}%
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${activeCuenca.capacityPercentage}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase block">
                  Margen de Seguridad Libre
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {activeCuenca.margin} cm
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-bold">
                  Condición estable y segura
                </span>
              </div>
            </div>
          </div>

          {/* Citizen Community Reports in Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Community Feed */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Reportes Ciudadanos Verificados
                  </h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  {approvedReports.length} verificados
                </span>
              </div>

              {approvedReports.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  {t('reports.empty_desc')}
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedReports.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {r.userName} ({r.sector})
                        </span>
                        <span className="font-mono text-slate-400">{r.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {r.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Quick Reporting Form */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Send className="w-5 h-5 text-[#8B0000] dark:text-red-400" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Reportar Novedad en mi Sector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sujeto a verificación previa del equipo administrativo
                  </p>
                </div>
              </div>

              {reportSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {reportSuccessMessage}
                </div>
              )}

              {reportError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                  {reportError}
                </div>
              )}

              <form onSubmit={handleCitizenReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Nivel Observado
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setReportLevel('bajo_muro')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        reportLevel === 'bajo_muro'
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Bajo muro
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportLevel('al_puente')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        reportLevel === 'al_puente'
                          ? 'bg-amber-50 dark:bg-amber-950 border-amber-500 text-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Al puente
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportLevel('desbordada')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        reportLevel === 'desbordada'
                          ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-800'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Desbordada
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Observaciones
                  </label>
                  <textarea
                    rows={2}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Describe novedades específicas..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                {/* File Attachment (Mandatory) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Foto o Video Obligatorio *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="py-2 px-3 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Adjuntar Archivo</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-500 font-mono">
                      {reportAttachments.length} adjunto(s)
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar para Aprobación</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* 3. RESUMEN INTEGRAL (ADMIN) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Resumen Hidrológico Integral de la Comuna 70
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Red oficial SIATA Comuna 70 · Todas las cuencas en nivel seguro
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
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {c.siataStationId}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Normal
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Quebrada {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {c.sector}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-slate-400 text-xs block">Nivel</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{c.currentLevel.toFixed(2)} m</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Capacidad</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{c.capacityPercentage}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setAdminSelectedCuencaId(c.id)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
