import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Building,
  ShieldAlert,
  Clock,
  Eye
} from 'lucide-react';

interface MediaAttachment {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: string;
}

interface CitizenReport {
  id: string;
  userName: string;
  userRole: string;
  sector: string;
  quebrada: string;
  level: 'bajo_muro' | 'al_puente' | 'desbordada';
  description: string;
  timestamp: string;
  media: MediaAttachment[];
  verified: boolean;
}

export const CitizenReportsView: React.FC = () => {
  const { currentUser } = useAuth();

  // Form states
  const [level, setLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('al_puente');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initial community reports (isolated to their general assigned area)
  const [reports, setReports] = useState<CitizenReport[]>([
    {
      id: 'rep-1',
      userName: 'Vigía Hidrológico Altavista',
      userRole: 'vigia',
      sector: currentUser?.barrioSector || 'Vereda Aguas Frías',
      quebrada: 'La Picacha / Altavista',
      level: 'al_puente',
      description: 'Aumento de sedimentos y palizadas pequeñas en la base del estribo occidental. Sin desbordamiento al momento.',
      timestamp: 'Hace 25 minutos',
      verified: true,
      media: [
        {
          id: 'm-1',
          name: 'evidencia_cauce_altavista.jpg',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60',
          size: '1.8 MB'
        }
      ]
    }
  ]);

  // Handle file uploads (image / video)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setValidationError(null);
    const newMediaList: MediaAttachment[] = [];

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
      setValidationError('Es obligatorio adjuntar al menos una foto o video del cauce para validar la veracidad del reporte comunitario.');
      return;
    }

    if (!description.trim()) {
      setValidationError('Por favor describe la situación observada en el cauce.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newReport: CitizenReport = {
        id: `rep-${Date.now()}`,
        userName: currentUser?.name || 'Vecino Residente',
        userRole: currentUser?.role || 'habitante',
        sector: currentUser?.barrioSector || 'Sector Residencial',
        quebrada: 'Zona Asignada',
        level,
        description,
        timestamp: 'Justo ahora',
        media: attachments,
        verified: true
      };

      setReports((prev) => [newReport, ...prev]);
      setIsSubmitting(false);
      setDescription('');
      setAttachments([]);
      setSubmitFeedback('¡Reporte ciudadano verificado y publicado con éxito! La red de vigías comunitarios ha sido alertada.');
      setTimeout(() => setSubmitFeedback(null), 5000);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-red-600/30 text-red-400 border border-red-500/40">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Reportes Ciudadanos de Alerta Temprana
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Notificación comunitaria inmediata con evidencia fotográfica y videográfica obligatoria.
            </p>
          </div>
        </div>

        {/* Sector Restriction Pill */}
        <div className="mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              Zona Restringida a su Residencia: <strong>{currentUser?.barrioSector || 'Sector Asignado'}</strong>
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[11px]">
            Sector Verificado
          </span>
        </div>
      </div>

      {submitFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{submitFeedback}</span>
        </div>
      )}

      {/* Main Report Creation Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#8B0000]" />
            <span>Emitir Nuevo Reporte del Cauce</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Solo para su sector asignado
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Level Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Nivel Observado en la Quebrada
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setLevel('bajo_muro')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold flex flex-col gap-1 transition-all cursor-pointer ${
                  level === 'bajo_muro'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-emerald-600" />
                  <span>Bajo Muro</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  Caudal dentro del lecho normal, sin desbordamiento.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('al_puente')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold flex flex-col gap-1 transition-all cursor-pointer ${
                  level === 'al_puente'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>Al Puente</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  Nivel rozando la base del puente o muros de contención.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLevel('desbordada')}
                className={`p-3 rounded-2xl text-left border text-xs font-bold flex flex-col gap-1 transition-all cursor-pointer ${
                  level === 'desbordada'
                    ? 'border-rose-600 bg-rose-50/80 text-rose-900 ring-2 ring-rose-600/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Desbordada</span>
                </div>
                <span className="text-[11px] font-normal text-slate-500">
                  Agua sobrepasando la orilla, inundación activa o palizada.
                </span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Descripción de lo Observado
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indica con precisión lo que ves: palizadas, ramas atascadas, aumento repentino de caudal, color del agua, etc."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden resize-none"
            />
          </div>

          {/* MANDATORY ATTACHMENT SECTION */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-600" />
                <span>Adjuntar Fotos o Videos (Obligatorio)</span>
              </label>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {attachments.length === 0 ? 'Falta Evidencia' : `${attachments.length} archivo(s)`}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Para garantizar que los avisos no contengan información falsa, es requisito indispensable subir al menos una fotografía o video tomado del cauce.
            </p>

            {/* Drop / Selector Area */}
            <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
                <Upload className="w-6 h-6 text-slate-500" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Haz clic para subir fotos o videos del cauce
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Formatos permitidos: JPG, PNG, MP4, MOV (Máx. 50 MB)
              </span>
            </label>

            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center shadow-xs"
                  >
                    {att.type === 'image' ? (
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-white gap-1">
                        <Video className="w-6 h-6 text-emerald-400" />
                        <span className="text-[10px] font-mono">Video</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                        title="Eliminar archivo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-1 left-1 right-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] text-white font-mono truncate">
                      {att.size}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              * Verificado por la Red de Vigías Comunitarios de Altavista
            </span>

            <button
              type="submit"
              disabled={isSubmitting || attachments.length === 0}
              className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                attachments.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#8B0000] hover:bg-[#720000] text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando y enviando...' : 'Publicar Reporte Inmediato'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Verified Reports Stream for this sector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Reportes Recientes en su Sector ({currentUser?.barrioSector || 'Altavista'})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {reports.length} reporte(s) verificado(s)
          </span>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {report.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{report.userName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {report.userRole === 'vigia' ? 'Vigía Acreditado' : 'Habitante'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {report.sector} · {report.timestamp}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                    report.level === 'desbordada'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : report.level === 'al_puente'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {report.level === 'desbordada'
                    ? 'Desbordamiento'
                    : report.level === 'al_puente'
                    ? 'Nivel al Puente'
                    : 'Caudal Normal'}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {report.description}
              </p>

              {/* Media gallery */}
              {report.media && report.media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {report.media.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative group"
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt="Evidencia del cauce"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white">
                          <Video className="w-6 h-6 text-emerald-400 mb-1" />
                          <span className="text-[10px] font-mono">Video Evidencia</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
