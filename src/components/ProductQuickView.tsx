'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';
import { ShareButton } from './ShareButton';
import { ProductVariantSelector } from './ProductVariantSelector';

interface ProductImageData {
  id: string;
  url: string;
  order: number;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  stockStatus: string;
  stockQuantity: number;
}

interface QuickViewProduct {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  imageUrl: string | null;
  images?: ProductImageData[];
  variants: ProductVariant[];
}

interface ProductQuickViewProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

function minPrice(variants: ProductVariant[]): number | null {
  const prices = variants.map(v => v.price).filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

function aggregateStock(variants: ProductVariant[]): string {
  if (variants.some(v => v.stockStatus === 'instock')) return 'instock';
  if (variants.some(v => v.stockStatus === 'preorder')) return 'preorder';
  return 'outofstock';
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState('');

  useEffect(() => {
    setCurrentImageIndex(0);
    if (product) {
      const inStock = product.variants.find((v) => v.stockStatus === 'instock');
      setSelectedVariantId(inStock?.id ?? product.variants[0]?.id ?? '');
    }
  }, [product?.id]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const allImages: string[] = [];
  if (product.imageUrl) allImages.push(product.imageUrl);
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (!allImages.includes(img.url)) {
        allImages.push(img.url);
      }
    });
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe && currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];

  const stockStatus = selectedVariant?.stockStatus ?? aggregateStock(product.variants);
  const stockLabel =
    stockStatus === 'instock'
      ? 'In Stock'
      : stockStatus === 'preorder'
      ? 'Pre-Order'
      : 'Out of Stock';

  const stockClass =
    stockStatus === 'instock'
      ? 'bg-green-50 text-green-600'
      : stockStatus === 'preorder'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-red-50 text-red-600';

  const displayPrice = selectedVariant?.price ?? minPrice(product.variants);
  const showPriceRange = product.variants.length > 1 && !selectedVariant?.price;

  const telegramMessage = encodeURIComponent(
    `Hi Baby Haus, I am interested in ordering: ${product.name}${
      selectedVariant && selectedVariant.name !== product.name ? ` - ${selectedVariant.name}` : ''
    }${displayPrice ? ` ($${displayPrice.toFixed(2)})` : ''}. Please confirm availability.`
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 rounded-full bg-[#F0E6DD]" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2">
          <h2 className="text-sm font-bold text-[#6B6B6B] uppercase tracking-wide">Quick View</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFF9F5] text-[#6B6B6B] hover:bg-[#F0E6DD] transition-colors"
            aria-label="Close quick view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="aspect-square relative bg-[#FFF9F5] rounded-2xl overflow-hidden border border-[#F0E6DD] mb-4">
            {allImages.length > 1 ? (
              <>
                <div 
                  className="relative w-full h-full flex transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {allImages.map((imageUrl, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                      <ProductImage
                        src={imageUrl}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-5'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <ProductImage
                src={allImages[0] || null}
                alt={product.name}
                className="w-full h-full"
              />
            )}
          </div>

          <p className="text-[#FF6B9D] text-xs font-bold tracking-wide uppercase mb-1">
            {product.brand || product.category}
          </p>
          <h3 className="text-xl font-bold text-[#2D2D2D] mb-2 leading-tight">{product.name}</h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-[#FF6B9D]">
              {displayPrice !== null ? `$${displayPrice.toFixed(2)}${showPriceRange ? '+' : ''}` : 'Ask for Price'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockClass}`}>
              {stockLabel}
            </span>
          </div>

          {product.variants.length > 1 && (
            <ProductVariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}

          {product.description && (
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4 line-clamp-4">
              {product.description}
            </p>
          )}

          <div className="flex flex-col gap-2 mb-3">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                brand: product.brand,
                category: product.category,
                variants: product.variants.map(v => ({
                  id: v.id,
                  name: v.name,
                  price: v.price,
                  stockStatus: v.stockStatus,
                  stockQuantity: v.stockQuantity,
                })),
              }}
              selectedVariantId={selectedVariantId}
              variant="detail"
            />
            <a
              href={`https://t.me/narote?text=${telegramMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF6B9D] text-white font-bold rounded-2xl hover:bg-[#E85A8A] transition-colors text-center shadow-sm text-base"
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
              className="text-sm font-semibold text-[#FF6B9D] hover:text-[#E85A8A] transition-colors inline-flex items-center gap-1"
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
