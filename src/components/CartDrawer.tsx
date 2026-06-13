'use client';

import { useCart } from '@/context/CartContext';
import { ProductImage } from './ProductImage';
import Link from 'next/link';
import { useEffect } from 'react';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const telegramMessage = encodeURIComponent(
    `Hi Baby Haus, I'd like to order:\n${items
      .map((i) => `- ${i.name} x${i.quantity}${i.price ? ` ($${i.price.toFixed(2)} each)` : ''}`)
      .join('\n')}\n\nTotal: ${totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : 'Ask for price'}\n\nPlease confirm availability.`
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E6DD] bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#2D2D2D]">Your Cart</h2>
            <p className="text-xs text-[#6B6B6B]">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFF9F5] text-[#6B6B6B] hover:bg-[#F0E6DD] transition-colors"
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#6B6B6B]">
              <p className="text-4xl mb-3">🛒</p>
              <p className="text-base font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Browse products and add items</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 px-5 py-2 bg-[#FF6B9D] text-white text-sm font-semibold rounded-full hover:bg-[#E85A8A] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-white rounded-xl border border-[#F0E6DD] p-3">
                <Link href={`/product/${item.id}`} onClick={() => setIsOpen(false)} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-[#FFF9F5] overflow-hidden">
                    <ProductImage src={item.imageUrl} alt={item.name} className="w-full h-full" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.id}`} onClick={() => setIsOpen(false)}>
                    <h3 className="text-sm font-semibold text-[#2D2D2D] line-clamp-2 leading-snug hover:text-[#FF6B9D] transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{item.brand || item.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-[#FF6B9D]">
                      {item.price ? `$${item.price.toFixed(2)}` : 'Ask'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFF9F5] text-[#2D2D2D] text-sm font-bold hover:bg-[#F0E6DD] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FFF9F5] text-[#2D2D2D] text-sm font-bold hover:bg-[#F0E6DD] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[#A0A0A0] hover:text-red-500 hover:bg-red-50 transition-colors self-start"
                  aria-label="Remove item"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#F0E6DD] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6B6B6B]">Subtotal</span>
              <span className="text-lg font-bold text-[#2D2D2D]">
                {totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : 'Ask for price'}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#FF6B9D] text-white font-bold rounded-2xl hover:bg-[#E85A8A] transition-colors text-center shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              Proceed to Checkout
            </Link>
            <button
              onClick={clearCart}
              className="w-full py-2 text-xs text-[#A0A0A0] hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
