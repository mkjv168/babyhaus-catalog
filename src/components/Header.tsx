'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, ShoppingCart, MessageCircle } from 'lucide-react';

export function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F0E6DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight font-['Fredoka']">
            <span className="text-[#FF6B9D]">B</span>
            <span className="text-[#F5A623]">a</span>
            <span className="text-[#4CAF50]">b</span>
            <span className="text-[#2196F3]">y</span>
            <span className="text-[#4CAF50]">H</span>
            <span className="text-[#F5A623]">a</span>
            <span className="text-[#90CAF9]">u</span>
            <span className="text-[#FF6B9D]">s</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B6B6B] font-medium">
            <span>🇰🇭</span> Cambodia
          </span>

          <Link
            href="/wishlist"
            className="relative hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF9F5] text-[#2D2D2D] hover:bg-[#FFF0F5] hover:text-[#FF6B9D] transition-colors"
            aria-label="Favorites"
          >
            <Heart className="w-[18px] h-[18px]" />
            {wishlistItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#FF6B9D] text-white text-[10px] font-bold rounded-full border-2 border-white">
                {wishlistItems}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF9F5] text-[#2D2D2D] hover:bg-[#F0E6DD] transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#FF6B9D] text-white text-[10px] font-bold rounded-full border-2 border-white">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href="https://t.me/narote"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF0F5] text-[#FF6B9D] text-xs font-semibold rounded-full hover:bg-[#FFE0EC] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Telegram
          </a>
        </div>
      </div>
    </header>
  );
}
