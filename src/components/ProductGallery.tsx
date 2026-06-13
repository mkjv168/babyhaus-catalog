'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/components/ProductImage';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square relative bg-[#FFF9F5] rounded-2xl overflow-hidden border border-[#F0E6DD]">
        <span className="text-6xl flex items-center justify-center h-full">👶</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-square relative bg-[#FFF9F5] rounded-2xl overflow-hidden border border-[#F0E6DD]">
        <ProductImage src={images[0]} alt={productName} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square relative bg-[#FFF9F5] rounded-2xl overflow-hidden border border-[#F0E6DD]">
        <ProductImage src={images[activeIndex]} alt={`${productName} - Photo ${activeIndex + 1}`} className="w-full h-full" />
        {/* Image counter */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((url, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
              index === activeIndex 
                ? 'border-[#FF6B9D] ring-2 ring-[#FF6B9D]/20' 
                : 'border-[#F0E6DD] hover:border-[#b0b0b0]'
            }`}
          >
            <Image
              src={url}
              alt={`${productName} thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
