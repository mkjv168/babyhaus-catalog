'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-[#e8e4df] pb-safe">
      <div className="flex items-center justify-around h-16">
        {/* Home */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full ${isHome ? 'text-[#d4a574]' : 'text-[#7a7a7a]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Search */}
        <Link
          href="/?focus=search"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full ${pathname === '/' ? 'text-[#7a7a7a]' : 'text-[#7a7a7a]'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        {/* Categories */}
        <Link
          href="/?focus=categories"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#7a7a7a]`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h3"/><path d="M4 17v3h3"/><path d="M20 7V4h-3"/><path d="M20 17v3h-3"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="12" cy="9" r="1"/></svg>
          <span className="text-[10px] font-medium">Categories</span>
        </Link>

        {/* Cart */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#7a7a7a] relative"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-[#d4a574] text-white text-[9px] font-bold rounded-full px-1">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        {/* Chat */}
        <a
          href="https://t.me/narote"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#7a7a7a]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span className="text-[10px] font-medium">Chat</span>
        </a>
      </div>
    </nav>
  );
}
