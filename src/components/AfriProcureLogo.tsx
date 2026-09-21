import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  className?: string;
  theme?: 'dark' | 'light';
}

export const AfriProcureLogo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  theme = 'light',
}) => {
  // Dimension mapping
  const iconDimensions = {
    sm: { box: 'w-7 h-7', svg: 28, stroke: 1.8 },
    md: { box: 'w-10 h-10', svg: 40, stroke: 2 },
    lg: { box: 'w-12 h-12', svg: 48, stroke: 2.2 },
    xl: { box: 'w-16 h-16', svg: 64, stroke: 2.5 },
  }[size];

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  }[size];

  const subtextSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  // The bespoke SVG mark:
  // Features:
  // 1. Structural octagonal shield polygon with precision chamfers (Statutory Armor / Integrity).
  // 2. Twin soaring infrastructure pylons forming the letter 'A' and bridge suspension cable arcs.
  // 3. Golden procurement audit balance pivot & verified keystone at apex.
  // 4. Subtle mathematical grid lines denoting quantity surveying rigor.
  const LogoIcon = (
    <div
      className={`relative ${iconDimensions.box} rounded-xl shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200 group shadow-md shadow-amber-950/10 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-stone-900 via-stone-950 to-black ring-1 ring-amber-500/40'
          : 'bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 ring-1 ring-stone-800'
      }`}
    >
      {/* Dynamic Golden Ambient Glow inside icon */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-400/20 pointer-events-none" />

      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%] relative z-10"
      >
        <defs>
          {/* Gold metallic gradient for keystone and balance beam */}
          <linearGradient id="apGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Platinum / Emerald statutory gradient */}
          <linearGradient id="apEmeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Clean Steel Gradient */}
          <linearGradient id="apSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Subtle drop shadow filter for high-stakes authority */}
          <filter id="apGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#F59E0B" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Statutory Hexagonal Perimeter with chamfered geometry */}
        <path
          d="M24 3 L40 9.5 V24 C40 33.5 33.2 41.8 24 45 C14.8 41.8 8 33.5 8 24 V9.5 L24 3 Z"
          stroke="url(#apGoldGradient)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        />

        {/* Subtle interior radar grid circle for forensic auditing */}
        <circle
          cx="24"
          cy="24"
          r="14"
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="2 3"
          className="opacity-50"
        />

        {/* Architecture Pylons: Left Pylon of 'A' */}
        <path
          d="M15 35 L23 13 H25 L33 35"
          stroke="url(#apSteelGradient)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pylon Foundation Footings */}
        <path
          d="M13 35 H18 M30 35 H35"
          stroke="url(#apGoldGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Bridge Suspension Deck / Cross-Beam of 'A' (Represents the CPA Valuation Balance Bar) */}
        <path
          d="M18.5 27 H29.5"
          stroke="url(#apGoldGradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter="url(#apGlow)"
        />

        {/* Apex Keystone & Sovereign Verification Diamond */}
        <path
          d="M24 10 L27 14 L24 18 L21 14 Z"
          fill="url(#apGoldGradient)"
        />

        {/* Central Vertical Plumb Line (FIDIC / Statutory True-Cost Centerline) */}
        <path
          d="M24 18 V27"
          stroke="#FDE047"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Integrity Point: Green Statutory Assurance Node */}
        <circle
          cx="24"
          cy="31.5"
          r="2"
          fill="url(#apEmeraldGradient)"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {LogoIcon}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
        theme === 'dark'
          ? 'bg-stone-900/90 border-stone-800 text-stone-100'
          : 'bg-white border-stone-200 text-stone-900 shadow-xs'
      } ${className}`}>
        {LogoIcon}
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-xs tracking-tight text-stone-900">
            Afri<span className="text-amber-600 font-black">Procure</span>™
          </span>
          <span className="text-[9px] text-stone-500 font-mono font-medium leading-none">
            BPP • FIDIC Red 13.8 Compliant
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Mark Variant
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {LogoIcon}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`${textSizeClasses} font-black tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            Afri<span className="text-amber-600">Procure</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 border border-amber-500/30 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Edition
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`${subtextSizeClasses} text-stone-500 font-medium tracking-tight hidden sm:block`}>
            National Infrastructure Price Adjustment & Statutory Procurement OS
          </span>
          <span className="hidden md:inline-block text-stone-300">•</span>
          <span className="hidden md:inline-block text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            FIDIC 13.8 & PPA 2007
          </span>
        </div>
      </div>
    </div>
  );
};
