'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Grid2X2, Heart, Home, Search, ShoppingCart } from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-[#F0E6DD] pb-safe">
      <div className="flex items-center justify-around h-16">
        {/* Home */}
        <Link
          href="/"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full ${isHome ? 'text-[#FF6B9D]' : 'text-[#6B6B6B]'}`}
        >
          <Home className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Search */}
        <Link
          href="/?focus=search"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full ${pathname === '/' ? 'text-[#6B6B6B]' : 'text-[#6B6B6B]'}`}
        >
          <Search className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        {/* Favorites */}
        <Link
          href="/wishlist"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full relative ${pathname === '/wishlist' ? 'text-[#FF6B9D]' : 'text-[#6B6B6B]'}`}
        >
          <div className="relative">
            <Heart className="w-[22px] h-[22px]" />
            {wishlistItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-[#FF6B9D] text-white text-[9px] font-bold rounded-full px-1">
                {wishlistItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Favorites</span>
        </Link>

        {/* Categories */}
        <Link
          href="/?focus=categories"
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#6B6B6B]`}
        >
          <Grid2X2 className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>

        {/* Cart */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 w-full h-full text-[#6B6B6B] relative"
        >
          <div className="relative">
            <ShoppingCart className="w-[22px] h-[22px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center bg-[#FF6B9D] text-white text-[9px] font-bold rounded-full px-1">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
      </div>
    </nav>
  );
}
