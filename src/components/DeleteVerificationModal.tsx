import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DeleteVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (message: string) => void;
}

export const DeleteVerificationModal: React.FC<DeleteVerificationModalProps> = ({
  isOpen,
  onClose,
  onDeleted
}) => {
  const { currentUser, deleteAccount } = useAuth();
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const expectedWord = 'ELIMINAR';
  const isMatch = confirmInput.trim().toUpperCase() === expectedWord;

  const handleConfirmDelete = () => {
    if (!isMatch) {
      setErrorMsg(`Debes escribir exactamente la palabra "${expectedWord}" para confirmar.`);
      return;
    }

    setIsDeleting(true);
    setTimeout(() => {
      const result = deleteAccount(currentUser.id);
      setIsDeleting(false);
      setConfirmInput('');
      setErrorMsg(null);
      onClose();
      onDeleted(result.message);
    }, 500);
  };

  const handleClose = () => {
    setConfirmInput('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-rose-200 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with warning icon */}
        <div className="p-5 sm:p-6 bg-rose-50 border-b border-rose-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                Acción Irreversible
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">
                Verificación de Eliminación de Cuenta
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
            title="Cancelar y cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Titular de la cuenta:</span>
            </div>
            <div className="pl-5 space-y-0.5 text-slate-600">
              <p><strong>Nombre:</strong> {currentUser.name}</p>
              <p><strong>Correo:</strong> {currentUser.email}</p>
              <p><strong>Teléfono:</strong> {currentUser.phone}</p>
              <p><strong>Sector:</strong> {currentUser.barrioSector}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <p className="font-bold text-slate-900">
              Al confirmar esta acción se ejecutará:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Supresión inmediata y definitiva de sus datos personales de los servidores.</li>
              <li>Revocación de la autorización de tratamiento de datos personales (Habeas Data).</li>
              <li>Cierre de sesión permanente y desvinculación de alertas comunitarias.</li>
            </ul>
          </div>

          {/* Verification Challenge */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Escriba <span className="font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-black">ELIMINAR</span> para verificar:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => {
                setConfirmInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Escribe ELIMINAR aquí..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 uppercase focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              autoFocus
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium mt-1.5">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={!isMatch || isDeleting}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isMatch && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminando cuenta...' : 'Eliminar Cuenta Definitivamente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
