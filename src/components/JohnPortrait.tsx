import React, { useState } from 'react';

interface JohnPortraitProps {
  size?: 'hero' | 'lg' | 'md' | 'sm' | 'avatar' | 'inline';
  className?: string;
  showFrame?: boolean;
  showSeal?: boolean;
  altText?: string;
}

export const JOHN_PHOTO_SRC = '/images/john-alan-whittle.jpg';

export const JohnPortrait: React.FC<JohnPortraitProps> = ({
  size = 'md',
  className = '',
  showFrame = true,
  showSeal = true,
  altText = 'John Alan Whittle - Smiling in memory',
}) => {
  const [imageLoaded, setImageLoaded] = useState(true);

  const sizeClasses = {
    hero: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64',
    lg: 'w-36 h-36 sm:w-44 sm:h-44',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    sm: 'w-16 h-16 sm:w-20 sm:h-20',
    avatar: 'w-10 h-10 sm:w-11 sm:h-11',
    inline: 'w-8 h-8',
  }[size];

  const frameClasses = showFrame
    ? 'rounded-full border-2 border-amber-600/60 shadow-xl shadow-purple-950/40 p-1 bg-gradient-to-tr from-neutral-900 via-amber-950/40 to-neutral-900'
    : 'rounded-full';

  return (
    <div className={`relative inline-block group ${className}`}>
      {/* Subtle glowing energy halo */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600/30 via-amber-500/20 to-emerald-500/30 blur-sm -z-10 group-hover:from-purple-600/50 group-hover:to-emerald-500/50 transition-all duration-500" />

      {/* Portrait Container */}
      <div className={`relative overflow-hidden ${sizeClasses} ${frameClasses} flex items-center justify-center bg-neutral-900`}>
        {imageLoaded ? (
          <img
            src={JOHN_PHOTO_SRC}
            alt={altText}
            onError={() => setImageLoaded(false)}
            className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 hover:scale-105"
            loading="eager"
          />
        ) : (
          /* Reverent Eastern Ancestral Tablet Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 text-neutral-300 p-2 text-center select-none border border-amber-700/30 rounded-full">
            <span className="text-xl sm:text-2xl mb-0.5 filter drop-shadow">☯️</span>
            <span className="font-calligraphy text-lg sm:text-2xl text-amber-300 font-bold tracking-wider">
              約翰
            </span>
            <span className="text-[10px] sm:text-xs font-serif text-red-700 dark:text-red-400 font-medium tracking-wide mt-0.5 leading-tight">
              John Alan Whittle
            </span>
            <span className="font-calligraphy text-[9px] text-emerald-400/90 mt-0.5">
              道氣長存
            </span>
          </div>
        )}

        {/* Traditional red seal stamp watermark in corner */}
        {showSeal && (size === 'hero' || size === 'lg' || size === 'md') && (
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded border border-red-700/80 bg-red-800/90 text-amber-100 font-calligraphy text-[9px] px-1 py-0.5 shadow select-none leading-none pointer-events-none"
            title="Seal of Reverence & Qi (道氣)"
          >
            道氣
          </div>
        )}

      </div>
    </div>
  );
};
