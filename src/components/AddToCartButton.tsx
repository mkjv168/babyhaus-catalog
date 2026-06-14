'use client';

import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

interface VariantInfo {
  id: string;
  name: string;
  price: number | null;
  stockStatus: string;
  stockQuantity: number;
}

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    brand: string | null;
    category: string;
    variants?: VariantInfo[];
  };
  selectedVariantId?: string;
  variant?: 'card' | 'detail';
}

export function AddToCartButton({ product, selectedVariantId, variant = 'card' }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const targetVariant = useMemo(() => {
    if (selectedVariantId && product.variants && product.variants.length > 0) {
      return product.variants.find((v) => v.id === selectedVariantId) || null;
    }
    if (product.variants && product.variants.length > 0) {
      return product.variants.find((v) => v.stockStatus !== 'outofstock') || product.variants[0] || null;
    }
    return null;
  }, [product.variants, selectedVariantId]);

  const cartItem = items.find((i) => i.id === (targetVariant?.id ?? product.id));
  const cartQty = cartItem?.quantity ?? 0;

  const isOutOfStock = targetVariant ? targetVariant.stockStatus === 'outofstock' : true;
  const displayName = targetVariant && targetVariant.name !== product.name
    ? `${product.name} - ${targetVariant.name}`
    : product.name;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !targetVariant) return;

    addItem({
      id: targetVariant.id,
      productId: product.id,
      name: product.name,
      variantName: targetVariant.name,
      price: targetVariant.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      category: product.category,
      stockStatus: targetVariant.stockStatus,
    });

    toast.success(`${displayName} added to cart`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  if (variant === 'detail') {
    return (
      <button
        onClick={handleAdd}
        disabled={isOutOfStock}
        className={`inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-center shadow-sm transition-all active:scale-[0.98] w-full ${
          isOutOfStock
            ? 'bg-[#F0E6DD] text-[#A0A0A0] cursor-not-allowed'
            : added
            ? 'bg-green-500 text-white'
            : 'bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]'
        }`}
      >
        {isOutOfStock ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Out of Stock
          </>
        ) : added ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Added to Cart
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartQty > 0 ? `Add Another (${cartQty} in cart)` : 'Add to Cart'}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isOutOfStock}
      className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
        isOutOfStock
          ? 'bg-[#FFF9F5] text-[#A0A0A0] cursor-not-allowed'
          : added
          ? 'bg-green-50 text-green-600'
          : 'bg-[#2d2d2d] text-white hover:bg-[#1a1a1a]'
      }`}
    >
      {isOutOfStock ? (
        <span>Out of Stock</span>
      ) : added ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          Added
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {cartQty > 0 ? `Add (${cartQty})` : 'Add to Cart'}
        </>
      )}
    </button>
  );
}
