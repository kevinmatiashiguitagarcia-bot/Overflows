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
  Lock
} from 'lucide-react';
import { SECTORS_LIST } from '../data/cuencasData';
import { useAuth } from '../context/AuthContext';
import { VigiaReport } from '../types';

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
  const isAdmin = currentUser?.role === 'administrador';
  const userSector = currentUser?.barrioSector || SECTORS_LIST[0];

  const [level, setLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('al_puente');
  const [sector, setSector] = useState(userSector);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: 'image' | 'video'; url: string }[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setValidationError(null);
    const newItems: { id: string; name: string; type: 'image' | 'video'; url: string }[] = [];

    (Array.from(files) as File[]).forEach((file: File) => {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (isImage || isVideo) {
        newItems.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: isVideo ? 'video' : 'image',
          url: URL.createObjectURL(file)
        });
      }
    });

    setAttachments((prev) => [...prev, ...newItems]);
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
      setValidationError('Es obligatorio adjuntar al menos una fotografía o video del cauce.');
      return;
    }

    if (!notes.trim()) {
      setValidationError('Por favor describe la situación observada en el cauce.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const STORAGE_REPORTS_KEY = 'overflows_altavista_community_reports';
      const newVigiaReport: VigiaReport = {
        id: `report-${Date.now()}`,
        authorName: currentUser?.name || 'Habitante Altavista',
        authorRole: currentUser?.role || 'habitante',
        isVerified: true,
        timestamp: new Date().toISOString(),
        timeAgo: 'Justo ahora',
        content: `[Nivel: ${
          level === 'desbordada' ? 'Desbordada' : level === 'al_puente' ? 'Al puente' : 'Bajo muro'
        }] ${notes.trim()}`,
        location: sector,
        imageAttached: attachments.length > 0,
        imageUrl: attachments[0]?.url,
        protocolPhase: level === 'desbordada' ? 'Alerta Máxima' : level === 'al_puente' ? 'Precaución' : undefined
      };

      try {
        const stored = localStorage.getItem(STORAGE_REPORTS_KEY);
        const list = stored ? JSON.parse(stored) : [];
        localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify([newVigiaReport, ...list]));
      } catch (err) {
        console.warn('Could not store report in localStorage:', err);
      }

      setSubmitting(false);
      onReportSubmitted(`Reporte verificado con evidencia fotográfica para ${sector}. La Red de Vigías fue notificada.`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-[#8B0000]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Reportar Tramo Crítico
              </h2>
              <p className="text-xs text-slate-500">
                Restringido estrictamente a su sector residencial asignado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Sector strictly limited to user residence */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Sector Autorizado</span>
              {!isAdmin && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Bloqueado a su residencia
                </span>
              )}
            </label>
            {isAdmin ? (
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden"
              >
                {SECTORS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{userSector}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Nivel observado en el cauce
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLevel('bajo_muro')}
                className={`p-2.5 rounded-xl text-center border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  level === 'bajo_muro'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Waves className="w-4 h-4 text-emerald-600" />
                <span>Bajo muro</span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('al_puente')}
                className={`p-2.5 rounded-xl text-center border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  level === 'al_puente'
                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Building className="w-4 h-4 text-amber-600" />
                <span>Al puente</span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('desbordada')}
                className={`p-2.5 rounded-xl text-center border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  level === 'desbordada'
                    ? 'border-rose-600 bg-rose-50 text-rose-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Desbordada</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detalles (empalizadas, ramas, arrastre de sedimentos)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe lo que estás observando con precisión..."
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden resize-none"
            />
          </div>

          {/* Mandatory Multimedia Evidence */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-600" />
                <span>Fotos o Videos (Obligatorio)</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {attachments.length === 0 ? 'Requerido' : `${attachments.length} archivo(s)`}
              </span>
            </div>

            <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-700">Adjuntar foto o video del cauce</span>
              <span className="text-[10px] text-slate-400">JPG, PNG, MP4 (Obligatorio)</span>
            </label>

            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {attachments.map((a) => (
                  <div key={a.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900 group">
                    {a.type === 'image' ? (
                      <img src={a.url} alt={a.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Video className="w-5 h-5 text-emerald-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(a.id)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || attachments.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ${
                attachments.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#8B0000] hover:bg-[#720000] text-white cursor-pointer'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Verificando...' : 'Enviar Reporte Inmediato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
