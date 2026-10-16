import React, { useState, useEffect } from 'react';
import { Clock, Radio, Activity } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

interface LiveClockProps {
  variant?: 'header' | 'card' | 'badge';
  showSeconds?: boolean;
  className?: string;
}

export const LiveClock: React.FC<LiveClockProps> = ({
  variant = 'header',
  showSeconds = true,
  className = ''
}) => {
  const { language, t } = useThemeLanguage();
  const [now, setNow] = useState<Date>(() => new Date());
  const [syncElapsedSeconds, setSyncElapsedSeconds] = useState<number>(0);

  // High precision natural flowing timer - updates every 1000ms fluidly
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      setSyncElapsedSeconds((prev) => {
        // Natural cycling for telemetry heartbeat (resets every 30s to simulate live ping)
        if (prev >= 29) return 0;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const locale = language === 'en' ? 'en-US' : 'es-CO';

  const formattedDate = now.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: true
  });

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white font-mono text-xs border border-slate-700/80 shadow-xs ${className}`}>
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
        <span className="font-bold tracking-wider">{formattedTime}</span>
        <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
          (UTC-5)
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs ${className}`}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8B0000] dark:text-red-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('clock.title') || 'Hora Oficial Medellín'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{t('clock.live') || 'En Vivo'}</span>
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="font-mono font-black text-2xl text-slate-900 dark:text-white tracking-tight">
            <span>{hours}</span>
            <span className="animate-pulse">:</span>
            <span>{minutes}</span>
            {showSeconds && (
              <>
                <span className="animate-pulse">:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{seconds}</span>
              </>
            )}
            <span className="text-xs font-sans font-semibold text-slate-500 ml-1.5">
              {now.getHours() >= 12 ? 'p. m.' : 'a. m.'}
            </span>
          </div>

          <div className="text-right text-xs text-slate-500 dark:text-slate-400 capitalize">
            {formattedDate}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-sans">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('clock.sync') || 'Sincronización SIATA:'}</span>
          </span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {language === 'en' ? `Updated ${syncElapsedSeconds}s ago` : `Hace ${syncElapsedSeconds}s`}
          </span>
        </div>
      </div>
    );
  }

  // Default 'header' variant
  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 transition-colors ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <div className="flex items-center gap-1.5 font-mono">
        <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span className="font-bold text-slate-900 dark:text-white">
          {hours}:{minutes}
        </span>
        {showSeconds && (
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            :{seconds}
          </span>
        )}
        <span className="text-xs font-sans text-slate-500 dark:text-slate-400 ml-0.5">
          {now.getHours() >= 12 ? 'PM' : 'AM'}
        </span>
      </div>
    </div>
  );
};
