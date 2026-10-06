import React from 'react';

interface CalligraphyNameProps {
  size?: 'hero' | 'xl' | 'lg' | 'md' | 'sm' | 'inline';
  showSeal?: boolean;
  align?: 'center' | 'left' | 'right';
  className?: string;
  honorific?: string;
  subtitle?: string;
  nameClassName?: string;
  name?: string;
}

/**
 * Renders the English name "John Alan Whittle" with authentic traditional
 * Chinese calligraphy directly underneath: 約翰 · 艾倫 · 惠特爾
 * Designed with high reverence, incorporating Kung Fu and Reiki energy aesthetics.
 */
export const CalligraphyName: React.FC<CalligraphyNameProps> = ({
  size = 'md',
  showSeal = true,
  align = 'center',
  className = '',
  honorific,
  subtitle,
  nameClassName = 'text-red-700 dark:text-red-400',
  name = 'John Alan Whittle',
}) => {
  const alignClass = {
    center: 'items-center text-center',
    left: 'items-start text-left',
    right: 'items-end text-right',
  }[align];

  const sizeStyles = {
    hero: {
      english: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-wider font-semibold',
      chinese: 'text-3xl sm:text-4xl md:text-5xl font-calligraphy tracking-widest mt-1.5',
      seal: 'w-10 h-10 text-xs',
      honorific: 'text-xs sm:text-sm tracking-[0.25em]',
    },
    xl: {
      english: 'text-2xl sm:text-3xl font-serif tracking-wider font-semibold',
      chinese: 'text-2xl sm:text-3xl font-calligraphy tracking-widest mt-1',
      seal: 'w-8 h-8 text-[11px]',
      honorific: 'text-xs tracking-[0.2em]',
    },
    lg: {
      english: 'text-xl sm:text-2xl font-serif tracking-wide font-medium',
      chinese: 'text-xl sm:text-2xl font-calligraphy tracking-wider mt-0.5',
      seal: 'w-7 h-7 text-[10px]',
      honorific: 'text-[11px] tracking-[0.18em]',
    },
    md: {
      english: 'text-lg sm:text-xl font-serif tracking-wide font-medium',
      chinese: 'text-lg sm:text-xl font-calligraphy tracking-wide mt-0.5',
      seal: 'w-6 h-6 text-[9px]',
      honorific: 'text-[10px] tracking-[0.15em]',
    },
    sm: {
      english: 'text-base font-serif tracking-normal font-medium',
      chinese: 'text-base font-calligraphy tracking-normal mt-0.5',
      seal: 'w-5 h-5 text-[8px]',
      honorific: 'text-[9px] tracking-[0.12em]',
    },
    inline: {
      english: 'text-sm font-serif font-medium',
      chinese: 'text-sm font-calligraphy mt-0',
      seal: 'w-4 h-4 text-[7px]',
      honorific: 'text-[8px] tracking-[0.1em]',
    },
  }[size];

  return (
    <div className={`inline-flex flex-col ${alignClass} ${className}`}>
      {honorific && (
        <span className={`uppercase font-sans font-medium text-purple-400/90 dark:text-purple-300 mb-1.5 ${sizeStyles.honorific}`}>
          {honorific}
        </span>
      )}

      {/* English Name - John Alan Whittle */}
      <span className={`${nameClassName} ${sizeStyles.english} transition-colors`}>
        {name}
      </span>

      {/* Chinese Calligraphy directly underneath */}
      <div className="flex items-center gap-2.5 mt-0.5">
        <span
          className={`font-calligraphy text-emerald-600 dark:text-emerald-400 tracking-widest ${sizeStyles.chinese} drop-shadow-sm select-none`}
          lang="zh-Hant"
          title="約翰 · 艾倫 · 惠特爾 (Yuēhàn · Àilún · Huìtè'ěr)"
        >
          約翰 · 艾倫 · 惠特爾
        </span>

        {/* Traditional Vermilion Ink Seal Stamp (印章) */}
        {showSeal && (
          <div
            className={`inline-flex items-center justify-center rounded-sm border border-red-700/80 bg-red-800/90 text-amber-100 font-calligraphy shadow-sm select-none ${sizeStyles.seal}`}
            title="Seal of Reverence & Life Energy (气 / 道)"
          >
            <span className="leading-none transform -rotate-1">道氣</span>
          </div>
        )}
      </div>

      {subtitle && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
          {subtitle.split('John Alan Whittle').map((part, index, parts) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && <span className="text-red-700 dark:text-red-400">John Alan Whittle</span>}
            </React.Fragment>
          ))}
        </span>
      )}
    </div>
  );
};
