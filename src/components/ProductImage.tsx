'use client';

import { useState } from 'react';
import Image from 'next/image';

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
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({ 
  src, 
  alt, 
  className = '', 
  fill = false,
  sizes,
  priority = false 
}: ProductImageProps) {
  const [error, setError] = useState(false);

  // Placeholder component
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

  // Use Next.js Image component for better performance
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || '(max-width: 768px) 50vw, 33vw'}
        className={`object-cover ${className}`}
        onError={() => setError(true)}
        priority={priority}
      />
    );
  }

  // For non-fill images, we need width and height
  // Default to a square aspect ratio
  return (
    <Image
      src={src}
      alt={alt}
      width={600}
      height={600}
      className={`object-cover w-full h-full ${className}`}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}