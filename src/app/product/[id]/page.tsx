import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductImage } from '@/components/ProductImage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ShareButton } from '@/components/ShareButton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  
  if (!product) {
    return {
      title: 'Product Not Found | Baby Haus',
    };
  }

  return {
    title: `${product.name} | Baby Haus`,
    description: product.description || `Shop ${product.name} from ${product.brand || product.category}. Premium baby products imported from USA and Japan. Order via Telegram for fast delivery in Cambodia.`,
    openGraph: {
      title: product.name,
      description: product.description || `Premium ${product.category} from Baby Haus`,
      images: product.imageUrl ? [product.imageUrl] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const telegramMessage = encodeURIComponent(
    `Hi Baby Haus, I am interested in ordering: ${product.name}${product.price ? ` ($${product.price.toFixed(2)})` : ''}. Please confirm availability.`
  );

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <Header />

      {/* Sticky back button bar */}
      <div className="sticky top-14 z-30 bg-[#faf8f5]/90 backdrop-blur-sm border-b border-[#e8e4df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#7a7a7a] hover:text-[#d4a574] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Catalog
          </Link>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Image */}
          <div className="aspect-square relative bg-[#f5f1ec] rounded-2xl overflow-hidden border border-[#e8e4df]">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[#d4a574] text-xs font-bold tracking-wide uppercase mb-1">
              {product.brand || product.category}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{product.name}</h1>

            <div className="mb-4 flex items-center flex-wrap gap-2">
              <span className="text-2xl md:text-3xl font-bold text-[#d4a574]">
                {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.stockStatus === 'instock'
                    ? 'bg-green-50 text-green-600'
                    : product.stockStatus === 'preorder'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {product.stockStatus === 'instock'
                  ? 'In Stock'
                  : product.stockStatus === 'preorder'
                  ? 'Pre-Order'
                  : 'Out of Stock'}
              </span>
              <ShareButton 
                productId={product.id} 
                productName={product.name} 
                className="ml-auto"
              />
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col gap-2 mb-5">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  brand: product.brand,
                  category: product.category,
                  stockStatus: product.stockStatus,
                }}
                variant="detail"
              />
              <a
                href={`https://t.me/narote?text=${telegramMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#d4a574] text-white font-bold rounded-2xl hover:bg-[#c49464] transition-colors text-center shadow-sm text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Order via Telegram
              </a>
              {product.stockStatus !== 'outofstock' && (
                <Link
                  href={`/order/${product.id}`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-2xl hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-center bg-white/60"
                >
                  Submit Order Request
                </Link>
              )}
            </div>

            {/* Collapsible specs */}
            <ProductDetailClient product={product} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
