'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight font-['Fredoka']">
            <span className="text-gradient">Baby</span>
            <span className="text-white">Haus</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#a0a0a0] font-medium">
            <span>🇰🇭</span> Cambodia
          </span>

          {/* Cart button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1a1a] text-[#ffffff] hover:bg-[#2a2a2a] transition-colors border border-white/5"
            aria-label="Open cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-gradient-to-r from-[#FF4D9F] to-[#FFB347] text-white text-[10px] font-bold rounded-full border-2 border-[#0a0a0a]">
                {totalItems}
              </span>
            )}
          </button>

          {/* Wishlist button */}
          <Link
            href="/wishlist"
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1a1a] text-[#ffffff] hover:bg-[#2a2a2a] transition-colors border border-white/5"
            aria-label="View favorites"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#FF4D9F] text-white text-[10px] font-bold rounded-full border-2 border-[#0a0a0a]">
                {wishlistCount}
              </span>
            )}
          </Link>

          <a
            href="https://t.me/narote"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-[#ffffff] text-xs font-semibold rounded-full hover:border-[#FF4D9F] hover:text-[#FF4D9F] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Telegram
          </a>
        </div>
      </div>
    </header>
  );
}
