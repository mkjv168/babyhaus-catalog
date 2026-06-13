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
      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
      : product.stockStatus === 'preorder'
      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
      : 'bg-red-500/10 text-red-400 border border-red-500/20';

  const handleCardClick = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && onQuickView) {
      e.preventDefault();
      onQuickView();
    }
  };

  return (
    <div className="group bg-[#141414] rounded-2xl overflow-hidden border border-white/5 transition-all duration-200 active:scale-[0.98] hover:shadow-lg hover:shadow-pink-500/10 hover:border-white/10 relative">
      <Link
        href={`/product/${product.id}`}
        prefetch={true}
        className="block"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square bg-[#0a0a0a]">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="rounded-t-2xl"
          />
          {product.featured && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#FF4D9F] via-[#FFB347] to-[#39FF14] text-white rounded-full z-10">
              Featured
            </span>
          )}
        </div>
        <div className="p-3 pb-2">
          <p className="text-gradient text-[10px] font-bold tracking-wide uppercase mb-1">
            {product.brand || product.category}
          </p>
          <h3 className="text-sm font-bold text-[#ffffff] group-hover:text-[#FF4D9F] transition-colors line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-gradient font-bold text-sm">
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
