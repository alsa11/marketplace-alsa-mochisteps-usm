import React from 'react';

interface MochiLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'dark' | 'footer';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const MochiLogo: React.FC<MochiLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  onClick,
}) => {
  const sizeMap = {
    sm: { icon: 34, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 46, text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 60, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 84, text: 'text-4xl', sub: 'text-sm' },
  };

  const { icon: iconSize, text: textSize, sub: subSize } = sizeMap[size];

  // SVG representation of the ribbon 'M' cradling a chic cream flat shoe with heart accent
  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-sm transition-transform duration-300 hover:scale-105"
    >
      <defs>
        <linearGradient id="mochiRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f38ba8" />
          <stop offset="50%" stopColor="#e26d8d" />
          <stop offset="100%" stopColor="#c84d6e" />
        </linearGradient>
        <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fff2eb" />
        </linearGradient>
      </defs>

      {/* Background circle badge for clarity */}
      <circle cx="60" cy="60" r="56" fill={variant === 'footer' || variant === 'dark' ? '#3c2921' : '#fdeef1'} />
      <circle cx="60" cy="60" r="54" stroke={variant === 'footer' || variant === 'dark' ? '#6b4f43' : '#fad4dd'} strokeWidth="1.5" />

      {/* Main ribbon 'M' structure */}
      {/* Left sweep */}
      <path
        d="M28 78 C25 64 30 45 44 34 C54 26 62 38 52 54 C46 63 38 72 34 82 C33 84 30 83 28 78 Z"
        fill="url(#mochiRibbonGrad)"
      />
      {/* Right sweep */}
      <path
        d="M58 48 C66 32 78 28 88 38 C96 46 95 65 92 78 C90 83 85 83 84 80 C82 72 82 58 76 50 C70 42 62 44 58 48 Z"
        fill="url(#mochiRibbonGrad)"
      />

      {/* Elegant Flatshoe nestled inside the ribbon 'M' */}
      <path
        d="M38 68 C44 52 55 46 66 45 C75 44 78 48 76 56 C74 64 68 70 54 72 C45 73 40 71 38 68 Z"
        fill="url(#shoeGrad)"
        stroke="#e26d8d"
        strokeWidth="1.2"
      />
      {/* Inner shoe insole contour */}
      <path
        d="M44 65 C48 55 56 50 64 49 C70 48 72 52 70 57 C66 63 60 67 50 68 Z"
        fill="#f8d7df"
        opacity="0.9"
      />
      {/* Mini Bow on the flatshoe toe */}
      <path
        d="M68 53 C66 51 64 53 66 55 C67 56 69 55 68 53 Z"
        fill="#d65b7d"
      />
      <path
        d="M72 54 C74 52 75 54 74 56 C73 57 71 56 72 54 Z"
        fill="#d65b7d"
      />
      <circle cx="70" cy="54.5" r="1.4" fill="#a63957" />

      {/* Small fluttering heart at top right of M */}
      <path
        d="M93 32 C93 29.5 95 28 97.5 28 C99.5 28 101 29.5 101 31.5 C101 34.5 97.5 37 97 37.5 C96.5 37 93 34.5 93 32 Z"
        fill="#e26d8d"
      />
      {/* Motion droplets */}
      <circle cx="103" cy="35" r="1.2" fill="#e26d8d" opacity="0.8" />

      {/* Tiny heart beneath the M */}
      <path
        d="M58 84 C58 82 59.5 81 61 81 C62.5 81 63.5 82 63.5 83.5 C63.5 85.5 61.5 87 61 87.5 C60.5 87 58 85.5 58 84 Z"
        fill="#d65b7d"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div onClick={onClick} className={`inline-flex items-center cursor-pointer ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  // Footer/Dark variant matching Screenshot 2026-10-14 104621.png
  if (variant === 'footer' || variant === 'dark') {
    return (
      <div onClick={onClick} className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
        <div className="w-12 h-12 rounded-full bg-[#3c2921] border border-[#5a4237] flex items-center justify-center p-1.5 shadow-inner">
          <LogoIcon />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xl tracking-wider text-white">
              MOCHI STEPS
            </span>
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20 uppercase">
              OFFICIAL
            </span>
          </div>
          <span className="text-xs text-[#d1b9b1] font-medium tracking-wide">
            Langkah Cantik, Gaya Menarik
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
    >
      <LogoIcon />
      <div className="flex flex-col">
        <span
          className={`font-heading font-extrabold ${textSize} tracking-wide text-[#b44865] group-hover:text-[#9e3a54] transition-colors`}
        >
          MOCHİSTEPS
        </span>
        {variant === 'full' && (
          <span
            className={`font-medium ${subSize} tracking-[0.2em] text-[#c9748b] uppercase -mt-0.5 flex items-center gap-1.5`}
          >
            <span className="h-[1px] w-2.5 bg-[#e8a3b5]" />
            STEP INTO YOUR STYLE
            <span className="h-[1px] w-2.5 bg-[#e8a3b5]" />
          </span>
        )}
      </div>
    </div>
  );
};
