import React from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface DataPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({ isOpen, onClose }) => {
  const { language } = useThemeLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                {language === 'en'
                  ? 'Personal Data Protection Policy'
                  : 'Política de Tratamiento de Datos Personales'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {language === 'en'
                  ? 'Pursuant to Statutory Law 1581 of 2012 (Habeas Data) & Digital Privacy Standards'
                  : 'Conforme a la Ley 1581 de 2012 (Habeas Data) y Estándares de Privacidad Digital'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={language === 'en' ? 'Close policy' : 'Cerrar política'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
              {language === 'en'
                ? <>At <strong>Overflows Altavista</strong> community safety and privacy is our paramount priority. Your information is strictly used to safeguard lives through early hydrological warnings.</>
                : <>En <strong>Overflows Altavista</strong> la privacidad y seguridad de la comunidad es una prioridad. Su información se utiliza estrictamente para salvaguardar vidas mediante alertas hidrológicas tempranas.</>}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#8B0000]" />
              <span>{language === 'en' ? '1. Data Controller' : '1. Responsable del Tratamiento'}</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 pl-5">
              {language === 'en'
                ? <>The Community Hydrological Safeguard & Monitoring System <strong>Overflows Altavista</strong> (Comuna 70, Medellín, Antioquia), with operational residence in the Corregimiento of Altavista.</>
                : <>El Sistema de Salvaguarda y Monitoreo Hidrológico Comunitario <strong>Overflows Altavista</strong> (Comuna 70 de Medellín, Antioquia), con domicilio operativo en el corregimiento de Altavista.</>}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#8B0000]" />
              <span>{language === 'en' ? '2. Data Collected' : '2. Datos Objeto de Tratamiento'}</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 pl-5 mb-2">
              {language === 'en'
                ? 'The following basic data points are requested for registration in the system:'
                : 'Para su registro en el sistema se solicitan los siguientes datos básicos:'}
            </p>
            <ul className="list-disc list-inside pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
              <li>{language === 'en' ? 'Full name of the resident.' : 'Nombre completo del habitante.'}</li>
              <li>{language === 'en' ? 'Contact email address.' : 'Dirección de correo electrónico de contacto.'}</li>
              <li>{language === 'en' ? 'Sector, area, or river stretch of residence in Comuna 70 (Altavista).' : 'Sector, vereda o tramo de residencia en la Comuna 70 (Altavista).'}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#8B0000]" />
              <span>{language === 'en' ? '3. Specific Purposes' : '3. Finalidades Específicas del Tratamiento'}</span>
            </h3>
            <ul className="list-disc list-inside pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs">
              <li>
                <strong>{language === 'en' ? 'Early Hydrological Warning:' : 'Alerta Temprana Hidrológica:'}</strong>{' '}
                {language === 'en'
                  ? 'Immediate notifications to residents before flash floods or river overflows based on SIATA readings and citizen reports.'
                  : 'Notificación inmediata a habitantes ante crecientes súbitas o desbordamiento de las quebradas según lecturas SIATA y reportes ciudadanos.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Preventive Evacuation:' : 'Evacuación Preventiva:'}</strong>{' '}
                {language === 'en'
                  ? 'Guidance to designated safe meeting points in your area in case of orange or red alert.'
                  : 'Envío de indicaciones hacia los puntos de encuentro seguros de su vereda en caso de alerta naranja o roja.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Report Verification:' : 'Verificación de Reportes Comunitarios:'}</strong>{' '}
                {language === 'en'
                  ? 'Ensuring photographic or video notices regarding stream conditions carry verified authorship.'
                  : 'Permitir que los avisos fotográficos sobre el estado del cauce cuenten con autoría verificada.'}
              </li>
              <li>
                <strong>{language === 'en' ? 'Non-commercialization:' : 'No Comercialización:'}</strong>{' '}
                {language === 'en'
                  ? 'Your data will NEVER be sold, shared, or used for advertising, political, or commercial purposes.'
                  : 'Sus datos NUNCA serán vendidos, cedidos ni usados para fines publicitarios, electorales ni comerciales.'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#8B0000]" />
              <span>{language === 'en' ? '4. Rights of the Data Subject (Habeas Data)' : '4. Derechos del Titular (Habeas Data)'}</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 pl-5 mb-2">
              {language === 'en'
                ? 'Under Statutory Law 1581 of 2012, you have the right to:'
                : 'De acuerdo con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013, usted tiene derecho a:'}
            </p>
            <ul className="list-disc list-inside pl-5 space-y-1.5 text-slate-600 dark:text-slate-400 text-xs">
              <li>{language === 'en' ? 'Know, update, and rectify your personal data at any time.' : 'Conocer, actualizar y rectificar sus datos personales en cualquier momento.'}</li>
              <li>{language === 'en' ? 'Request proof of the authorization granted during registration.' : 'Solicitar prueba de la autorización otorgada al momento del registro.'}</li>
              <li>
                <strong>{language === 'en' ? 'Right to Total Erasure:' : 'Derecho de Supresión (Eliminación Total):'}</strong>{' '}
                {language === 'en'
                  ? 'Revoke consent and permanently delete your account and all stored data via the account menu with security verification.'
                  : 'Revocar la autorización y solicitar la eliminación definitiva de su cuenta y todos sus datos almacenados a través del menú de usuario con verificación de seguridad.'}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Understood & Accept' : 'Entendido y Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};
