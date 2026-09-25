import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  Inbox,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import {
  SentEmail,
  getStoredEmails,
  markEmailAsRead,
  maskEmail
} from '../services/emailService';

interface EmailInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
  onApplyCode?: (code: string) => void;
}

export const EmailInboxModal: React.FC<EmailInboxModalProps> = ({
  isOpen,
  onClose,
  targetEmail,
  onApplyCode
}) => {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmail | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen, targetEmail]);

  useEffect(() => {
    const handleEmailEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SentEmail>;
      if (customEvent.detail) {
        setEmails((prev) => [customEvent.detail, ...prev]);
        if (!selectedEmail) {
          setSelectedEmail(customEvent.detail);
        }
      }
    };

    window.addEventListener('overflows_email_received', handleEmailEvent);
    return () => {
      window.removeEventListener('overflows_email_received', handleEmailEvent);
    };
  }, [selectedEmail]);

  const loadEmails = () => {
    const all = getStoredEmails();
    const filtered = targetEmail
      ? all.filter((e) => e.to.toLowerCase() === targetEmail.toLowerCase())
      : all;
    setEmails(filtered);
    if (filtered.length > 0) {
      setSelectedEmail(filtered[0]);
      markEmailAsRead(filtered[0].id);
    } else {
      setSelectedEmail(null);
    }
  };

  const handleSelect = (email: SentEmail) => {
    setSelectedEmail(email);
    markEmailAsRead(email.id);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseCode = (code: string) => {
    if (onApplyCode) {
      onApplyCode(code);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8B0000] flex items-center justify-center text-white shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Bandeja de Correo Electrónico
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {targetEmail ? targetEmail : 'Todos los mensajes recibidos'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar bandeja"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Email List Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto max-h-48 md:max-h-none shrink-0">
            <div className="p-3 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Recibidos ({emails.length})</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                En vivo
              </span>
            </div>

            {emails.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No hay correos en esta bandeja aún.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {emails.map((e) => {
                  const isSelected = selectedEmail?.id === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => handleSelect(e)}
                      className={`w-full p-3 text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-white border-l-4 border-l-[#8B0000] shadow-xs'
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {e.from.split('<')[0].trim()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {e.date}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 truncate block">
                        {e.subject}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email Detail Viewer */}
          <div className="flex-1 p-5 overflow-y-auto bg-white flex flex-col">
            {selectedEmail ? (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Meta block */}
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-base font-extrabold text-slate-950 mb-1 leading-snug">
                    {selectedEmail.subject}
                  </h4>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>
                      <strong className="text-slate-700">De:</strong> {selectedEmail.from}
                    </p>
                    <p>
                      <strong className="text-slate-700">Para:</strong> {selectedEmail.to}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedEmail.date} (válido por {selectedEmail.expiresInMinutes} minutos)</span>
                    </p>
                  </div>
                </div>

                {/* Email Body text */}
                <div className="text-xs text-slate-700 space-y-3 leading-relaxed flex-1">
                  <p className="font-bold text-slate-900">
                    {selectedEmail.content.greeting}
                  </p>
                  <p>{selectedEmail.content.message}</p>

                  {/* Highlighted Verification Code in the email */}
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-center my-3">
                    <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block mb-1">
                      Tu Código de Verificación
                    </span>
                    <span className="font-mono text-3xl font-black tracking-widest text-[#8B0000] block py-1">
                      {selectedEmail.code}
                    </span>
                    <span className="text-[11px] text-amber-800/80 block mt-1">
                      Este código es confidencial y expira en 15 minutos.
                    </span>

                    <div className="flex items-center justify-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(selectedEmail.code)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>

                      {onApplyCode && (
                        <button
                          type="button"
                          onClick={() => handleUseCode(selectedEmail.code)}
                          className="px-4 py-1.5 rounded-xl bg-[#8B0000] hover:bg-[#720000] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Insertar en Formulario</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    {selectedEmail.content.securityWarning}
                  </p>
                </div>

                {/* Footer sign */}
                <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  {selectedEmail.content.footer}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Mail className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-bold text-slate-600">No has seleccionado ningún correo</p>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona un mensaje de la columna izquierda para leer su contenido.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mensajes de seguridad encriptados conforme a la Ley 1581 de 2012</span>
          </span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
