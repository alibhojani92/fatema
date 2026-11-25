interface BrandLogoProps {
  inverted?: boolean;
  compact?: boolean;
}

export function BrandLogo({ inverted = false, compact = false }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center ${compact ? 'gap-1.5 sm:gap-2.5' : 'gap-2.5'} whitespace-nowrap shrink-0 select-none`}>
      <svg
        viewBox="0 0 44 44"
        className={compact ? 'w-7 h-7 sm:w-9 sm:h-9 shrink-0' : 'w-10 h-10 shrink-0'}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fra-gold-swirl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D890" />
            <stop offset="50%" stopColor="#C59B27" />
            <stop offset="100%" stopColor="#9A7214" />
          </linearGradient>
          <linearGradient id="fra-rose-swirl" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B76E79" />
            <stop offset="100%" stopColor="#E4B5BD" />
          </linearGradient>
        </defs>
        <circle
          cx="22"
          cy="22"
          r="20"
          fill={inverted ? '#2F2228' : '#FDF8F6'}
          stroke="url(#fra-gold-swirl)"
          strokeWidth="1.75"
        />
        <path
          d="M9 28 C14 14, 29 33, 36 16"
          stroke="url(#fra-rose-swirl)"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.82"
        />
        <path
          d="M11 31 C18 20, 27 35, 35 22"
          stroke="url(#fra-gold-swirl)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <text
          x="22"
          y="28"
          textAnchor="middle"
          fontFamily="Playfair Display, Georgia, serif"
          fontSize="21"
          fontWeight="600"
          fill={inverted ? '#FDF8F6' : '#23191E'}
        >
          F
        </text>
      </svg>
      <span
        className={`font-serif font-semibold ${
          compact
            ? 'text-[12px] sm:text-lg tracking-[0.05em] sm:tracking-[0.12em]'
            : 'text-lg sm:text-xl tracking-[0.12em]'
        } ${inverted ? 'text-[#FDF8F6]' : 'text-[#23191E]'}`}
      >
        FATIMA RESIN ART
      </span>
    </span>
  );
}
