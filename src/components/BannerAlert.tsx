import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Activity, CloudRain, AlertTriangle } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useCuenca } from '../context/CuencaContext';
import { getSiataWeatherMode } from '../data/siataTelemetryService';

interface BannerAlertProps {
  onOpenRecommendations?: () => void;
  showRecommendationsButton?: boolean;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({
  onOpenRecommendations,
  showRecommendationsButton = false
}) => {
  const { t, language } = useThemeLanguage();
  const { isRaining } = useCuenca();
  const [secondsAgo, setSecondsAgo] = useState(6);

  // Smoothly progressing real-time sync heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 45 ? 4 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bgClasses = isRaining
    ? 'bg-amber-800 dark:bg-amber-950 text-white border-y border-amber-700 dark:border-amber-900 shadow-xs'
    : 'bg-emerald-800 dark:bg-emerald-950 text-white border-y border-emerald-700 dark:border-emerald-900 shadow-xs';

  return (
    <div className={`${bgClasses} transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded-lg bg-white/20 shrink-0 mt-0.5 sm:mt-0">
            {isRaining ? (
              <CloudRain className="w-4 h-4 text-amber-200 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
            )}
          </div>
          <div className="leading-snug">
            <span className="font-extrabold tracking-wide uppercase">
              {isRaining
                ? (language === 'en' ? 'SIATA ALERT: ACTIVE PRECIPITATION RECORDED' : 'ALERTA SIATA: PRECIPITACIÓN EN TIEMPO REAL REGISTRADA')
                : t('status.normal_title')}
            </span>
            <span className="mx-2 hidden sm:inline opacity-60">·</span>
            <span className="opacity-95 font-medium">
              {isRaining
                ? (language === 'en'
                    ? 'Active rainfall detected by SIATA rain gauges in upper Comuna 70. River levels fluctuating in real time.'
                    : 'Precipitación activa registrada por sensores SIATA en la cuenca alta de la Comuna 70. Niveles en monitoreo dinámico continuo.')
                : t('status.normal_desc')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-7 sm:pl-0">
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider bg-black/25 px-2.5 py-1 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>
              {language === 'en' ? `SYNCED ${secondsAgo}S AGO` : `SINCRONIZADO HACE ${secondsAgo}S`}
            </span>
          </div>

          {showRecommendationsButton && onOpenRecommendations && (
            <button
              onClick={onOpenRecommendations}
              className="font-bold underline underline-offset-2 hover:text-emerald-200 flex items-center gap-1 transition-colors text-xs sm:text-sm cursor-pointer"
            >
              <span>{t('status.view_recommendations')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
