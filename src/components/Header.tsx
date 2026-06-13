'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export function Header() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e8e4df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-[#d4a574]">Baby</span>
            <span className="text-[#2d2d2d]">Haus</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#7a7a7a] font-medium">
            <span>🇰🇭</span> Cambodia
          </span>

          {/* Cart button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#f5f1ec] text-[#2d2d2d] hover:bg-[#e8e4df] transition-colors"
            aria-label="Open cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#d4a574] text-white text-[10px] font-bold rounded-full border-2 border-[#faf8f5]">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href="https://t.me/narote"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5ebe0] text-[#d4a574] text-xs font-semibold rounded-full hover:bg-[#e8d5c0] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Telegram
          </a>
        </div>
      </div>
    </header>
  );
}
