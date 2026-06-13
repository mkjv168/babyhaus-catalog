'use client';

import { useState } from 'react';

const PALETTE = [
  '#d4a574',
  '#e8b89d',
  '#c9b8d4',
  '#a8d5ba',
  '#f5b5a4',
  '#a4c8e1',
  '#e8c4a0',
  '#b8d4e3',
];

function getColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const bg = getColor(alt || 'Baby');
    const initials = getInitials(alt || 'Baby Haus');
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: bg }}
      >
        <span className="text-white font-bold text-3xl tracking-wider drop-shadow-sm">
          {initials || '👶'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover w-full h-full ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
