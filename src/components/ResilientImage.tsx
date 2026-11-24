import { useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTone?: string;
  fallbackTitle?: string;
  loading?: 'eager' | 'lazy';
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTone = '#FDF8F6',
  fallbackTitle,
  loading = 'lazy',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
        style={{
          background: `radial-gradient(circle at 30% 25%, #FFFFFF 0%, ${fallbackTone} 65%, #EEDCE0 100%)`,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-12 h-12 mb-3 text-[#C59B27]"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
          <path
            d="M18 36 C24 22, 40 42, 46 26"
            stroke="#B76E79"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="32" r="5" fill="currentColor" opacity="0.8" />
        </svg>
        <span className="font-serif text-sm text-[#23191E] line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
