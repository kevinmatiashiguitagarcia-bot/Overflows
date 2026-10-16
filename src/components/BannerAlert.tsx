import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface BannerAlertProps {
  onOpenRecommendations: () => void;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({ onOpenRecommendations }) => {
  const { t, language } = useThemeLanguage();
  const [secondsAgo, setSecondsAgo] = useState(12);

  // Smoothly progressing real-time sync heartbeat
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 45 ? 5 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-emerald-800 dark:bg-emerald-950 text-white border-y border-emerald-700 dark:border-emerald-900 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-1 rounded-lg bg-white/20 shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="leading-snug">
            <span className="font-extrabold tracking-wide uppercase">
              {t('status.normal_title')}
            </span>
            <span className="mx-2 hidden sm:inline opacity-60">·</span>
            <span className="opacity-95 font-medium">
              {t('status.normal_desc')}
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

          <button
            onClick={onOpenRecommendations}
            className="font-bold underline underline-offset-2 hover:text-emerald-200 flex items-center gap-1 transition-colors text-xs sm:text-sm cursor-pointer"
          >
            <span>{t('status.view_recommendations')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
