import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  CheckCircle2,
  Waves,
  Building,
  ShieldCheck
} from 'lucide-react';
import { SECTORS_LIST } from '../data/cuencasData';
import { useAuth } from '../context/AuthContext';

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
  const [level, setLevel] = useState<'bajo_muro' | 'al_puente' | 'desbordada'>('al_puente');
  const [sector, setSector] = useState(SECTORS_LIST[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onReportSubmitted(`Reporte registrado para ${sector}. La Red de Vigías fue notificada.`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-in zoom-in-95">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-[#8B0000]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Reportar Tramo Crítico
              </h2>
              <p className="text-xs text-slate-500">
                Aviso prioritario al centro de control comunitario
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
              Sector o tramo en Altavista
            </label>
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
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detalles (empalizadas, ramas, arrastre de sedimentos)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe lo que estás observando..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Enviando...' : 'Enviar Reporte Inmediato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
