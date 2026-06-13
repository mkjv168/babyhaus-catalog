'use client';

import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number | null;
  imageUrl: string | null;
  stockStatus: string;
  featured: boolean;
}

interface CompactProductCardProps {
  product: Product;
}

export function CompactProductCard({ product }: CompactProductCardProps) {
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

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#e8e4df] transition-all duration-200 active:scale-[0.98] hover:shadow-md hover:border-[#d4a574]/30">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square bg-[#f5f1ec]">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="rounded-t-2xl"
          />
          {product.featured && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#d4a574] text-white rounded-full">
              Featured
            </span>
          )}
        </div>
        <div className="p-3 pb-2">
          <p className="text-[#d4a574] text-[10px] font-bold tracking-wide uppercase mb-1">
            {product.brand || product.category}
          </p>
          <h3 className="text-sm font-bold text-[#2d2d2d] group-hover:text-[#d4a574] transition-colors line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[#d4a574] font-bold text-sm">
              {product.price ? `$${product.price.toFixed(2)}` : 'Ask'}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stockClass}`}>
              {stockLabel}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <AddToCartButton product={product} variant="card" />
      </div>
    </div>
  );
}
