'use client';

import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';
import { ShareButton } from './ShareButton';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description?: string | null;
  price: number | null;
  imageUrl: string | null;
  sku?: string | null;
  stockStatus: string;
  featured: boolean;
}

interface CompactProductCardProps {
  product: Product;
  onQuickView?: () => void;
}

export function CompactProductCard({ product, onQuickView }: CompactProductCardProps) {
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

  const handleCardClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && onQuickView) {
      e.preventDefault();
      onQuickView();
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#F0E6DD] transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-pink-200/50 hover:border-[#FF6B9D]/30 relative">
      <Link
        href={`/product/${product.id}`}
        prefetch={true}
        className="block"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square bg-[#FFF9F5] rounded-t-3xl">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="rounded-t-3xl"
          />
          {product.featured && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#FF6B9D] via-[#F5A623] to-[#4CAF50] text-white rounded-full z-10">
              ✨ Featured
            </span>
          )}
        </div>
        <div className="p-3 pb-2">
          <p className="text-[#FF6B9D] text-[10px] font-bold tracking-wide uppercase mb-1">
            {product.brand || product.category}
          </p>
          <h3 className="text-sm font-bold text-[#2D2D2D] group-hover:text-[#FF6B9D] transition-colors line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[#FF6B9D] font-bold text-sm">
              {product.price ? `$${product.price.toFixed(2)}` : 'Ask'}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stockClass}`}>
              {stockLabel}
            </span>
          </div>
          <div
            className="flex items-center justify-end"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <ShareButton productId={product.id} productName={product.name} />
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} />
      </div>
      <div className="px-3 pb-3">
        <AddToCartButton product={product} variant="card" />
      </div>
    </div>
  );
}
