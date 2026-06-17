'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { CompactProductCard } from '@/components/CompactProductCard';
import Link from 'next/link';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { items } = useWishlist();
  const { addItem } = useCart();

  const handleAddAllToCart = () => {
    let addedCount = 0;
    items.forEach((product) => {
      const variant = product.variants?.find((item) => item.stockStatus !== 'outofstock');
      if (variant || product.stockStatus !== 'outofstock') {
        addItem({
          id: variant?.id ?? product.id,
          productId: product.id,
          name: product.name,
          variantName: variant?.name ?? product.name,
          price: variant?.price ?? product.price,
          imageUrl: product.imageUrl,
          brand: product.brand,
          category: product.category,
          stockStatus: variant?.stockStatus ?? product.stockStatus,
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} item${addedCount > 1 ? 's' : ''} added to cart`);
    } else {
      toast.error('No available items to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2D2D2D]">My Favorites</h1>
            <p className="text-[#6B6B6B] text-sm mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2 bg-[#2d2d2d] text-white text-sm font-semibold rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              Add All to Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#FFF9F5] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B6B6B]">
                  <path d="m19 14 1.5-1.5c.8-.8.8-2.1 0-2.8L15.1 4.3c-.8-.8-2.1-.8-2.8 0L11 5.5 9.7 4.3c-.8-.8-2.1-.8-2.8 0L1.5 9.7c-.8.8-.8 2.1 0 2.8L3 14l6 6 6-6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-2">
                Your favorites list is empty
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Browse our products and tap the heart icon to save items you love!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B9D] text-white font-semibold rounded-xl hover:bg-[#c19660] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                Shop Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((product) => (
              <CompactProductCard
                key={product.id}
                product={{
                  ...product,
                  variants: product.variants && product.variants.length > 0
                    ? product.variants
                    : product.variantCount && product.variantCount > 1
                    ? Array.from({ length: product.variantCount }).map((_, index) => ({
                        id: `${product.id}-v${index}`,
                        name: 'Option',
                        sku: null,
                        price: product.price,
                        stockStatus: product.stockStatus,
                        stockQuantity: 0,
                      }))
                    : [{
                        id: product.id,
                        name: product.name,
                        sku: null,
                        price: product.price,
                        stockStatus: product.stockStatus,
                        stockQuantity: 0,
                      }],
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
