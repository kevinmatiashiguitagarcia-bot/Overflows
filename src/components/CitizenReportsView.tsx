import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  CitizenReportRecord,
  ReportMediaItem,
  getStoredReports,
  createCitizenReport,
  approveCitizenReport,
  rejectCitizenReport,
  deleteCitizenReport
} from '../data/reportsService';
import {
  MessageSquareWarning,
  Camera,
  Video,
  Upload,
  AlertTriangle,
  CheckCircle2,
  X,
  FileCheck,
  Send,
  MapPin,
  Waves,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  Check,
  Ban,
  Trash2,
  ExternalLink
} from 'lucide-react';

export const CitizenReportsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, language } = useThemeLanguage();
  const isAdmin = currentUser?.role === 'administrador';

  // Form states
  const [level, setLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('al_puente');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<ReportMediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Admin filter tab
  const [adminTab, setAdminTab] = useState<'pendientes' | 'aprobados' | 'todos'>('pendientes');

  // Reports state (NO mock reports, starts clean from storage)
  const [reports, setReports] = useState<CitizenReportRecord[]>(() => getStoredReports());

  // Listen to window event for cross-component sync
  useEffect(() => {
    const handleSync = () => {
      setReports(getStoredReports());
    };
    window.addEventListener('overflows_reports_updated', handleSync);
    return () => window.removeEventListener('overflows_reports_updated', handleSync);
  }, []);

  // Handle file uploads (image / video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setValidationError(null);
    const newMediaList: ReportMediaItem[] = [];

    (Array.from(files) as File[]).forEach((file: File) => {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');

      if (!isImage && !isVideo) {
        setValidationError('Solo se permiten archivos de imagen (JPG, PNG) o video (MP4, MOV).');
        return;
      }

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const url = URL.createObjectURL(file);

      newMediaList.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url,
        size: `${sizeMb} MB`
      });
    });

    setAttachments((prev) => [...prev, ...newMediaList]);
    e.target.value = ''; // Reset input
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // MANDATORY REQUIREMENT: Photos and videos are mandatory
    if (attachments.length === 0) {
      setValidationError(t('reports.media_required'));
      return;
    }

    if (!description.trim()) {
      setValidationError(t('reports.desc_label'));
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      createCitizenReport({
        userName: currentUser?.name || 'Vecino Residente',
        userRole: currentUser?.role || 'habitante',
        userEmail: currentUser?.email,
        sector: currentUser?.barrioSector || 'Sector Residencial Altavista',
        quebrada: 'Cuenca Altavista / La Picacha',
        level,
        description,
        media: attachments
      });

      setReports(getStoredReports());
      setIsSubmitting(false);
      setDescription('');
      setAttachments([]);
      setSubmitFeedback(t('reports.pending_approval_notice'));
      setTimeout(() => setSubmitFeedback(null), 8000);
    }, 600);
  };

  const handleApprove = (id: string) => {
    approveCitizenReport(id);
    setReports(getStoredReports());
  };

  const handleReject = (id: string) => {
    rejectCitizenReport(id);
    setReports(getStoredReports());
  };

  const handleDelete = (id: string) => {
    deleteCitizenReport(id);
    setReports(getStoredReports());
  };

  // Filtered reports for views
  const pendingReports = reports.filter((r) => r.status === 'pendiente_aprobacion');
  const approvedReports = reports.filter((r) => r.status === 'aprobado');
  const userPendingReports = reports.filter(
    (r) => r.status === 'pendiente_aprobacion' && currentUser && r.userName === currentUser.name
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-red-600/30 text-red-400 border border-red-500/40">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {t('reports.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {t('reports.subtitle')}
            </p>
          </div>
        </div>

        {/* Sector Restriction Indicator */}
        <div className="mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              {t('reports.zone_restricted')} <strong className="text-white">{currentUser?.barrioSector || 'Sector Residencial'}</strong>
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-xs">
            Sector Validado
          </span>
        </div>
      </div>

      {/* Admin Moderation Panel (Exclusively visible to administrators) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-xs uppercase">
                  Rol Administrador
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {t('reports.admin_moderation_title')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('reports.admin_moderation_desc')}
              </p>
            </div>

            {/* Admin Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setAdminTab('pendientes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'pendientes'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Pendientes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-xs font-mono">
                  {pendingReports.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('aprobados')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  adminTab === 'aprobados'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Aprobados</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-xs font-mono">
                  {approvedReports.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'todos'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Todos ({reports.length})
              </button>
            </div>
          </div>

          {/* Admin Moderation Queue */}
          {(() => {
            const listToDisplay =
              adminTab === 'pendientes'
                ? pendingReports
                : adminTab === 'aprobados'
                ? approvedReports
                : reports;

            if (listToDisplay.length === 0) {
              return (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  No hay reportes en la sección de {adminTab}.
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {listToDisplay.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {report.userName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({report.sector})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            report.status === 'aprobado'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : report.status === 'rechazado'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse'
                          }`}
                        >
                          {report.status === 'aprobado'
                            ? 'Aprobado y Público'
                            : report.status === 'rechazado'
                            ? 'Rechazado'
                            : 'Pendiente de Moderación'}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto font-mono">
                          {report.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {report.description}
                      </p>

                      {/* Attachments preview */}
                      {report.media && report.media.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {report.media.map((m) => (
                            <div
                              key={m.id}
                              className="relative group rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 w-16 h-16 bg-black flex items-center justify-center shrink-0"
                            >
                              {m.type === 'video' ? (
                                <video src={m.url} className="w-full h-full object-cover" />
                              ) : (
                                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                              )}
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                          <span className="text-xs text-slate-500 font-semibold">
                            {report.media.length} archivo(s) de evidencia adjunta
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {report.status !== 'aprobado' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(report.id)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobar y Publicar</span>
                        </button>
                      )}

                      {report.status !== 'rechazado' && (
                        <button
                          type="button"
                          onClick={() => handleReject(report.id)}
                          className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* User Submission Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t('reports.new_button')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Los reportes pasan por revisión y validación previa del equipo de alerta temprana antes de ser visibles a la comunidad.
            </p>
          </div>
        </div>

        {submitFeedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-start gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{submitFeedback}</span>
          </div>
        )}

        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* River Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
              {t('reports.level_label')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLevel('bajo_muro')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  level === 'bajo_muro'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="font-extrabold text-xs">Bajo Muro (Normal)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Flujo normal sin riesgo aparente
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLevel('al_puente')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  level === 'al_puente'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="font-extrabold text-xs">Nivel al Puente</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Agua rozando o alcanzando estribos
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLevel('desbordada')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  level === 'desbordada'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="font-extrabold text-xs">Desbordada / Creciente</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Agua rebasando márgenes o vías
                </div>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {t('reports.desc_label')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reports.desc_placeholder')}
              rows={3}
              required
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:outline-hidden resize-none"
            />
          </div>

          {/* MANDATORY MULTIMEDIA ATTACHMENTS (FOTOS Y VIDEOS) */}
          <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-slate-800/60 border-2 border-dashed border-red-300 dark:border-red-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#8B0000] dark:text-red-400" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  {t('reports.attach_files')} <span className="text-[#8B0000]">* (Obligatorio)</span>
                </span>
              </div>
              <span className="text-xs font-bold text-red-700 dark:text-red-400">
                Fotos o Videos
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Para garantizar la veracidad del monitoreo hidrológico, es obligatorio subir al menos una foto o video del cauce.
            </p>

            <div className="flex items-center gap-3">
              <label className="py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-2xs">
                <Upload className="w-4 h-4" />
                <span>Seleccionar Foto o Video</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-500 font-mono">
                {attachments.length} archivo(s) adjunto(s)
              </span>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 h-24 flex items-center justify-center"
                  >
                    {att.type === 'video' ? (
                      <video src={att.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-black/60">
                        {att.type === 'video' ? 'Video' : 'Foto'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                      title="Eliminar archivo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || attachments.length === 0}
            className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
              attachments.length > 0 && !isSubmitting
                ? 'bg-[#8B0000] hover:bg-[#720000]'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-75'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? t('reports.submitting') : t('reports.submit_button')}</span>
          </button>
        </form>
      </div>

      {/* User's Own Pending Reports Notification */}
      {userPendingReports.length > 0 && !isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
            <Clock className="w-4 h-4" />
            <span>Tus reportes en proceso de moderación administrativa ({userPendingReports.length})</span>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200">
            Has enviado reportes que están siendo revisados por el administrador antes de ser visibles públicamente en la comunidad.
          </p>
        </div>
      )}

      {/* Public Verified Community Reports Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Reportes Aprobados y Verificados</span>
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500">
            {approvedReports.length} verificados
          </span>
        </div>

        {approvedReports.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t('reports.empty_title')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t('reports.empty_desc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvedReports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                      {report.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {report.userName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{report.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('reports.approved_badge')}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {report.timestamp}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {report.description}
                </p>

                {/* Evidence thumbnails */}
                {report.media && report.media.length > 0 && (
                  <div className="flex items-center gap-2.5 pt-1 overflow-x-auto">
                    {report.media.map((item) => (
                      <div
                        key={item.id}
                        className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 w-24 h-24 bg-black shrink-0"
                      >
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
