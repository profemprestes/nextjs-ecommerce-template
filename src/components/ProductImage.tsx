'use client';

import React, { useState } from 'react';
import { Shirt } from 'lucide-react';
import { isSafeImageUrl } from '@/lib/catalog-schema';

interface ProductImageProps {
  src?: string;
  alt: string;
  brand?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onStatusChange?: (status: 'loaded' | 'error') => void;
}

export function ProductImage({
  src,
  alt,
  brand,
  size = 'sm',
  className = '',
  onStatusChange,
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const cleanSrc = src?.trim() ?? '';
  const isSafe = Boolean(cleanSrc) && isSafeImageUrl(cleanSrc);
  const showFallback = !isSafe || failedSrc === cleanSrc;

  const iconSize = size === 'lg' ? 32 : size === 'md' ? 22 : 16;

  if (showFallback) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#F1F3F5] text-ink-2 border border-rule/80 select-none overflow-hidden ${className}`}
        aria-label={alt}
      >
        <Shirt size={iconSize} strokeWidth={1.6} className="text-ink-2" />
        {size !== 'sm' && (
          <span className="mt-1.5 text-[11px] font-medium text-ink-2 px-2 truncate max-w-full">
            {brand?.trim() || 'Sin imagen'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative bg-[#F1F3F5] overflow-hidden border border-rule/80 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cleanSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => onStatusChange?.('loaded')}
        onError={() => {
          setFailedSrc(cleanSrc);
          onStatusChange?.('error');
        }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
