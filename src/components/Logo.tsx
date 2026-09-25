import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
  showSlogan?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'light',
  showSlogan = false
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8', text: 'text-sm', sub: 'text-[10px]' },
    md: { img: 'w-10 h-10', text: 'text-base', sub: 'text-[11px]' },
    lg: { img: 'w-14 h-14', text: 'text-lg', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-xl', sub: 'text-xs' }
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Circular Emblem */}
      <div
        className={`relative ${dim.img} rounded-full overflow-hidden shrink-0 border-2 border-amber-500/40 shadow-md bg-black flex items-center justify-center group`}
      >
        <img
          src="/overflows_logo.jpg"
          alt="Overflows - Antes del riesgo, está Overflows"
          className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (e.currentTarget.src !== '/overflows_logo.png') {
              e.currentTarget.src = '/overflows_logo.png';
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider uppercase ${
                variant === 'dark' ? 'text-white' : 'text-slate-950'
              } ${dim.text}`}
            >
              OVERFLOWS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>

          <span
            className={`font-semibold tracking-tight ${
              variant === 'dark' ? 'text-cyan-400' : 'text-amber-800'
            } ${dim.sub}`}
          >
            {showSlogan
              ? 'Antes del riesgo, está Overflows'
              : 'Comuna 70 · Alerta Temprana'}
          </span>
        </div>
      )}
    </div>
  );
};

