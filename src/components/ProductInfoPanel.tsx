'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ProductVariantSelector } from './ProductVariantSelector';
import { AddToCartButton } from './AddToCartButton';
import { ShareButton } from './ShareButton';

interface Variant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  stockStatus: string;
  stockQuantity: number;
}

interface ProductInfoPanelProps {
  product: {
    id: string;
    name: string;
    brand: string | null;
    category: string;
    imageUrl: string | null;
  };
  variants: Variant[];
}

export function ProductInfoPanel({ product, variants }: ProductInfoPanelProps) {
  const [selectedId, setSelectedId] = useState(() => {
    const inStock = variants.find((v) => v.stockStatus === 'instock');
    return inStock?.id ?? variants[0]?.id ?? '';
  });

  const selected = useMemo(
    () => variants.find((v) => v.id === selectedId) ?? variants[0],
    [variants, selectedId]
  );

  const stockLabel =
    selected?.stockStatus === 'instock'
      ? 'In Stock'
      : selected?.stockStatus === 'preorder'
      ? 'Pre-Order'
      : 'Out of Stock';

  const stockClass =
    selected?.stockStatus === 'instock'
      ? 'bg-green-50 text-green-600'
      : selected?.stockStatus === 'preorder'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-red-50 text-red-600';

  const telegramMessage = encodeURIComponent(
    `Hi Baby Haus, I am interested in ordering: ${product.name} - ${selected?.name}${
      selected?.price ? ` ($${selected.price.toFixed(2)})` : ''
    }. Please confirm availability.`
  );

  return (
    <div className="flex flex-col">
      <p className="text-[#FF6B9D] text-xs font-bold tracking-wide uppercase mb-1">
        {product.brand || product.category}
      </p>
      <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{product.name}</h1>

      {variants.length > 1 && (
        <ProductVariantSelector
          variants={variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}

      <div className="mb-4 flex items-center flex-wrap gap-2">
        <span className="text-2xl md:text-3xl font-bold text-[#FF6B9D]">
          {selected?.price ? `$${selected.price.toFixed(2)}` : 'Ask for Price'}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stockClass}`}>
          {stockLabel}
        </span>
        {selected?.sku && (
          <span className="text-[10px] text-[#7a7a7a] font-mono bg-[#f5f1ec] px-2 py-0.5 rounded">
            SKU: {selected.sku}
          </span>
        )}
        <ShareButton productId={product.id} productName={product.name} className="ml-auto" />
      </div>

      <div className="flex flex-col gap-2 mb-5">
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            brand: product.brand,
            category: product.category,
            variants: variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: v.price,
              stockStatus: v.stockStatus,
              stockQuantity: v.stockQuantity,
            })),
          }}
          selectedVariantId={selectedId}
          variant="detail"
        />
        <a
          href={`https://t.me/narote?text=${telegramMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF6B9D] text-white font-bold rounded-2xl hover:bg-[#E85A8A] transition-colors text-center shadow-sm text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Order via Telegram
        </a>
        {selected?.stockStatus !== 'outofstock' && (
          <Link
            href={`/order/${product.id}?variantId=${selected?.id}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-[#F0E6DD] text-[#2D2D2D] font-semibold rounded-2xl hover:border-[#FF6B9D] hover:text-[#FF6B9D] transition-colors text-center bg-white/60"
          >
            Submit Order Request
          </Link>
        )}
      </div>
    </div>
  );
}
