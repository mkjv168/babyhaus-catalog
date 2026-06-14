import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { CatalogClient } from '@/components/CatalogClient';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';

export const revalidate = 60;

export default async function Home() {
  const [products, banners] = await Promise.all([
    prisma.product.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' } } }
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
  ]);
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <main className="min-h-screen bg-white text-[#2D2D2D]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF0F5]">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #FF6B9D 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 md:pt-16 md:pb-10">
          <div className="text-center">
            {/* Multicolor logo-style title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-3 font-['Fredoka']">
              <span className="text-[#FF6B9D]">B</span>
              <span className="text-[#F5A623]">a</span>
              <span className="text-[#4CAF50]">b</span>
              <span className="text-[#2196F3]">y</span>
              <span className="text-[#4CAF50]">H</span>
              <span className="text-[#F5A623]">a</span>
              <span className="text-[#90CAF9]">u</span>
              <span className="text-[#FF6B9D]">s</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F5] text-[#FF6B9D] text-xs font-semibold mb-4">
              <span>🇺🇸</span> USA & <span>🇯🇵</span> Japan Imports
            </div>
            <p className="text-[#6B6B6B] text-sm md:text-lg leading-relaxed max-w-lg mx-auto mb-5">
              Premium baby products sourced from the US and Japan.
              Browse our catalog and order directly via Telegram.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://t.me/narote"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 bg-[#FF6B9D] text-white text-sm font-semibold rounded-full hover:bg-[#E85A8A] transition-colors shadow-sm"
              >
                Chat on Telegram ✨
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BannerCarousel banners={banners} />
        </section>
      )}

      {/* Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-2">
        {products.length === 0 ? (
          <div className="text-center py-20 text-[#6B6B6B]">
            <p className="text-5xl mb-4">👶</p>
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#F0E6DD] overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[#FFF9F5]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#FFF9F5] rounded w-1/2" />
                    <div className="h-4 bg-[#FFF9F5] rounded w-3/4" />
                    <div className="h-3 bg-[#FFF9F5] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          }>
            <CatalogClient products={products} categories={categories} />
          </Suspense>
        )}
      </section>

      <Footer />
    </main>
  );
}
