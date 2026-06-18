'use client';

import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';
import { ShareButton } from './ShareButton';

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

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description?: string | null;
  imageUrl: string | null;
  featured: boolean;
  images?: ProductImageData[];
  variants: ProductVariant[];
}

interface CompactProductCardProps {
  product: Product;
  onQuickView?: () => void;
  compact?: boolean;
}

function minPrice(variants: ProductVariant[]): number | null {
  const prices = variants.map(v => v.price).filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

function maxPrice(variants: ProductVariant[]): number | null {
  const prices = variants.map(v => v.price).filter((p): p is number => p !== null);
  return prices.length > 0 ? Math.max(...prices) : null;
}

function aggregateStock(variants: ProductVariant[]): string {
  if (variants.some(v => v.stockStatus === 'instock')) return 'instock';
  if (variants.some(v => v.stockStatus === 'preorder')) return 'preorder';
  return 'outofstock';
}

export function CompactProductCard({ product, onQuickView, compact = false }: CompactProductCardProps) {
  const stockStatus = aggregateStock(product.variants);
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

  const lowPrice = minPrice(product.variants);
  const highPrice = maxPrice(product.variants);
  const priceDisplay = lowPrice !== null
    ? (highPrice !== null && highPrice > lowPrice
      ? `From $${lowPrice.toFixed(2)}`
      : `$${lowPrice.toFixed(2)}`)
    : 'Ask';

  const handleCardClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && onQuickView) {
      e.preventDefault();
      onQuickView();
    }
  };

  return (
    <div className={compact
      ? "group bg-white rounded-xl sm:rounded-3xl overflow-hidden border border-[#F0E6DD] transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-pink-200/50 hover:border-[#FF6B9D]/30 relative"
      : "group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#F0E6DD] transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-pink-200/50 hover:border-[#FF6B9D]/30 relative"
    }>
      <Link
        href={`/product/${product.id}`}
        prefetch={true}
        className="block"
        onClick={handleCardClick}
      >
        <div className={compact
          ? "relative aspect-[4/3] sm:aspect-square bg-[#FFF9F5] rounded-t-xl sm:rounded-t-3xl"
          : "relative aspect-square bg-[#FFF9F5] rounded-t-2xl sm:rounded-t-3xl"
        }>
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={compact
              ? "(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 20vw"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            }
            className={compact
              ? "rounded-t-xl sm:rounded-t-3xl"
              : "rounded-t-2xl sm:rounded-t-3xl"
            }
          />
          {product.featured && (
            <span className={compact
              ? "absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#FF6B9D] via-[#F5A623] to-[#4CAF50] text-white rounded-full z-10"
              : "absolute top-2 left-2 sm:top-2 sm:left-2 px-2 sm:px-2 py-0.5 text-[10px] sm:text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#FF6B9D] via-[#F5A623] to-[#4CAF50] text-white rounded-full z-10"
            }>
              ✨ Featured
            </span>
          )}
        </div>
        <div className={compact
          ? "p-2 sm:p-3 sm:pb-2"
          : "p-3 sm:p-3 sm:pb-2"
        }>
          <div className={compact
            ? "flex items-center gap-1 mb-1 overflow-hidden"
            : "flex items-center gap-1 mb-1 overflow-hidden sm:gap-1.5"
          }>
            <p className={compact
              ? "min-w-0 truncate text-[#FF6B9D] text-[9px] sm:text-[10px] font-bold tracking-wide uppercase"
              : "min-w-0 truncate text-[#FF6B9D] text-[10px] sm:text-[10px] font-bold tracking-wide uppercase"
            }>
              {product.brand || product.category}
            </p>
            {product.variants.length > 1 && (
              <span className={compact
                ? "shrink-0 whitespace-nowrap text-[8px] sm:text-[9px] font-bold text-[#7a7a7a] bg-[#f5f1ec] px-1 sm:px-1.5 py-0 rounded-full"
                : "shrink-0 whitespace-nowrap text-[9px] sm:text-[9px] font-bold text-[#7a7a7a] bg-[#f5f1ec] px-1.5 sm:px-1.5 py-0 rounded-full"
              }>
                {product.variants.length} options
              </span>
            )}
          </div>
          <h3 className={compact
            ? "text-xs sm:text-sm font-bold text-[#2D2D2D] group-hover:text-[#FF6B9D] transition-colors line-clamp-2 leading-snug mb-1.5 sm:mb-2 min-h-[1.75rem] sm:min-h-[2.5rem]"
            : "text-sm sm:text-sm font-bold text-[#2D2D2D] group-hover:text-[#FF6B9D] transition-colors line-clamp-2 leading-snug mb-2 sm:mb-2 min-h-[2.5rem] sm:min-h-[2.5rem]"
          }>
            {product.name}
          </h3>
          <div className={compact
            ? "flex items-center justify-between gap-1 mb-1.5 sm:mb-2"
            : "flex items-center justify-between gap-1 mb-2 sm:mb-2"
          }>
            <span className={compact
              ? "text-[#FF6B9D] font-bold text-xs sm:text-sm"
              : "text-[#FF6B9D] font-bold text-sm sm:text-sm"
            }>
              {priceDisplay}
            </span>
            <div className="flex items-center gap-1">
              <span className={compact
                ? `text-[9px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-0 sm:py-0.5 rounded-full ${stockClass}`
                : `text-[10px] sm:text-[10px] font-semibold px-1.5 sm:px-1.5 py-0.5 sm:py-0.5 rounded-full ${stockClass}`
              }>
                {stockLabel}
              </span>
              <div className={compact ? "hidden sm:block" : "block sm:block"} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <ShareButton productId={product.id} productName={product.name} />
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className={compact
        ? "hidden sm:block px-2 pb-2 sm:px-3 sm:pb-3"
        : "block sm:block px-3 pb-3 sm:px-3 sm:pb-3"
      }>
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
          variant="card"
        />
      </div>
    </div>
  );
}
