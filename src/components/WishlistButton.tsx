'use client';

import { useWishlist } from '@/context/WishlistContext';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import type { Product } from '@/context/WishlistContext';

interface WishlistButtonProps {
  product: Product;
}

export function WishlistButton({ product }: WishlistButtonProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleItem(product);
    
    if (inWishlist) {
      toast.success('Removed from favorites');
    } else {
      toast.success('Added to favorites');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white active:scale-95 shadow-sm"
      aria-label={inWishlist ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          inWishlist
            ? 'fill-red-500 text-red-500'
            : 'text-[#7a7a7a] hover:text-red-500'
        }`}
      />
    </button>
  );
}