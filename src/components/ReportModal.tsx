import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Waves,
  Building,
  ShieldCheck,
  Camera,
  Video,
  Upload,
  MapPin,
  Lock,
  Loader2,
  Sparkles
} from 'lucide-react';
import { SECTORS_LIST } from '../data/cuencasData';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { createCitizenReport, getQuebradaBySector } from '../data/reportsService';
import {
  validateReportEnvironmentImage,
  validateReportTextNLP,
  EXACT_AI_IMAGE_REJECTION_MSG,
  EXACT_AI_IMAGE_REJECTION_MSG_EN
} from '../utils/reportAiValidator';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted
}) => {
  const { currentUser } = useAuth();
  const { t, language } = useThemeLanguage();
  const isAdmin = currentUser?.role === 'administrador';
  const userSector = currentUser?.barrioSector || SECTORS_LIST[0];

  const [level, setLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('al_puente');
  const [sector, setSector] = useState(userSector);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: 'image' | 'video'; url: string }[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validatingMedia, setValidatingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setValidationError(null);
    setValidatingMedia(true);

    const fileList = Array.from(files) as File[];
    const validItems: { id: string; name: string; type: 'image' | 'video'; url: string }[] = [];

    for (const file of fileList) {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');

      if (!isImage && !isVideo) {
        setValidationError(t('reports.formats_hint', 'Solo se permiten imágenes (JPG, PNG) o videos (MP4).'));
        continue;
      }

      if (isImage) {
        // AI Vision Validation in background
        try {
          const aiResult = await validateReportEnvironmentImage(file);
          if (!aiResult.isValid) {
            setValidationError(language === 'en' ? EXACT_AI_IMAGE_REJECTION_MSG_EN : EXACT_AI_IMAGE_REJECTION_MSG);
            continue; // Reject this file
          }
        } catch {
          // Fallback allow if canvas error occurs
        }
      }

      validItems.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url: URL.createObjectURL(file)
      });
    }

    setValidatingMedia(false);
    if (validItems.length > 0) {
      setAttachments((prev) => [...prev, ...validItems]);
    }
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Mandatory photo/video verification
    if (attachments.length === 0) {
      setValidationError(t('reports.media_required'));
      return;
    }

    if (!notes.trim()) {
      setValidationError(t('reports.fill_required_notes', 'Por favor describe la situación observada en el cauce.'));
      return;
    }

    // 1. NLP Text Moderation & Filtering
    const nlpResult = validateReportTextNLP(notes);

    // If vulgar words detected -> BLOCK SUBMISSION IMMEDIATELY
    if (!nlpResult.isClean) {
      setValidationError(t('reports.ai_vulgar_text_err'));
      return;
    }

    setSubmitting(true);
    const targetQuebrada = getQuebradaBySector(sector);

    setTimeout(() => {
      // If ambiguous or lacks hydrological context, mark as special review
      const isSpecialReview = nlpResult.requiresSpecialReview;

      createCitizenReport({
        userName: currentUser?.name || 'Vecino Registrado',
        userRole: currentUser?.role || 'habitante',
        userEmail: currentUser?.email,
        sector,
        quebrada: targetQuebrada,
        level,
        description: notes.trim(),
        media: attachments,
        status: isSpecialReview ? 'requiere_revision_especial' : 'pendiente_aprobacion'
      });

      setSubmitting(false);

      if (isSpecialReview) {
        onReportSubmitted(t('reports.ai_ambiguous_text_notice'));
      } else {
        onReportSubmitted(t('reports.pending_approval_notice'));
      }
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-[#8B0000] dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t('reports.report_critical_segment')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('reports.restricted_to_residence')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Sector strictly limited to user residence */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t('reports.authorized_sector')}</span>
              {!isAdmin && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {t('reports.locked_to_residence')}
                </span>
              )}
            </label>
            {isAdmin ? (
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden"
              >
                {SECTORS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{userSector}</span>
              </div>
            )}
          </div>

          {/* Level selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('reports.level_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLevel('bajo_muro')}
                className={`p-2.5 rounded-xl text-center border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  level === 'bajo_muro'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Waves className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('reports.level_bajo_muro')}</span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('al_puente')}
                className={`p-2.5 rounded-xl text-center border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  level === 'al_puente'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t('reports.level_al_puente')}</span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('desbordada')}
                className={`p-2.5 rounded-xl text-center border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  level === 'desbordada'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{t('reports.level_desbordada')}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('reports.details_label')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('reports.details_placeholder')}
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden resize-none"
            />
          </div>

          {/* Mandatory Multimedia Evidence with AI Vision Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>
                  {t('reports.photos_or_videos')} <span className="text-rose-600 font-extrabold">{t('reports.mandatory_tag')}</span>
                </span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {attachments.length === 0 ? t('reports.required_badge') : `${attachments.length} ${t('reports.attached_files_count')}`}
              </span>
            </div>

            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={validatingMedia}
                className="sr-only"
              />
              {validatingMedia ? (
                <div className="flex flex-col items-center justify-center py-1 text-cyan-600 dark:text-cyan-400">
                  <Loader2 className="w-5 h-5 animate-spin mb-1" />
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('reports.ai_validating_image')}
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('reports.drag_drop_hint')}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {t('reports.formats_hint')}
                  </span>
                </>
              )}
            </label>

            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {attachments.map((a) => (
                  <div key={a.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-900 group">
                    {a.type === 'image' ? (
                      <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Video className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(a.id)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 cursor-pointer"
                      title={t('reports.admin_delete_file')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {t('reports.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || validatingMedia || attachments.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ${
                attachments.length === 0 || validatingMedia
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-[#8B0000] hover:bg-[#720000] text-white cursor-pointer'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? t('reports.verifying') : t('reports.submit_immediate')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
