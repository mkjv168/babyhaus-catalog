'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';
import { ShareButton } from './ShareButton';

interface QuickViewProduct {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  sku: string | null;
  stockStatus: string;
}

interface ProductQuickViewProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const stockLabel =
    product.stockStatus === 'instock'
      ? 'In Stock'
      : product.stockStatus === 'preorder'
      ? 'Pre-Order'
      : 'Out of Stock';

  const stockClass =
    product.stockStatus === 'instock'
      ? 'bg-green-50 text-green-600'
      : product.stockStatus === 'preorder'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-red-50 text-red-600';

  const telegramMessage = encodeURIComponent(
    `Hi Baby Haus, I am interested in ordering: ${product.name}${product.price ? ` ($${product.price.toFixed(2)})` : ''}. Please confirm availability.`
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-[#faf8f5] rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-[#e8e4df]" />
        </div>

        {/* Header with close */}
        <div className="flex items-center justify-between px-5 pb-2">
          <h2 className="text-sm font-bold text-[#7a7a7a] uppercase tracking-wide">Quick View</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f1ec] text-[#7a7a7a] hover:bg-[#e8e4df] transition-colors"
            aria-label="Close quick view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Image */}
          <div className="aspect-square relative bg-[#f5f1ec] rounded-2xl overflow-hidden border border-[#e8e4df] mb-4">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full"
            />
          </div>

          {/* Info */}
          <p className="text-[#d4a574] text-xs font-bold tracking-wide uppercase mb-1">
            {product.brand || product.category}
          </p>
          <h3 className="text-xl font-bold text-[#2d2d2d] mb-2 leading-tight">{product.name}</h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-[#d4a574]">
              {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockClass}`}>
              {stockLabel}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-[#7a7a7a] leading-relaxed mb-4 line-clamp-4">
              {product.description}
            </p>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-[#b0aba5] mb-4">SKU: {product.sku}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 mb-3">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                brand: product.brand,
                category: product.category,
                stockStatus: product.stockStatus,
              }}
              variant="detail"
            />
            <a
              href={`https://t.me/narote?text=${telegramMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#d4a574] text-white font-bold rounded-2xl hover:bg-[#c49464] transition-colors text-center shadow-sm text-base"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Order via Telegram
            </a>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div onClick={(e) => e.stopPropagation()}>
              <ShareButton productId={product.id} productName={product.name} />
            </div>
            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="text-sm font-semibold text-[#d4a574] hover:text-[#c49464] transition-colors inline-flex items-center gap-1"
            >
              View Full Details
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
