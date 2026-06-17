import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { CatalogClient } from '@/components/CatalogClient';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import {
  MerchandisingSections,
  MerchandisingSectionsSkeleton,
} from '@/components/MerchandisingSections';

export const revalidate = 60;

export default async function Home() {
  const [allProducts, banners] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' } }, variants: true },
    }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  // Compute merchandising data server-side
  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
  const newArrivals = [...allProducts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);
  const inStockNow = allProducts
    .filter((p) => p.variants.some((v) => v.stockStatus === 'instock'))
    .slice(0, 4);

  // Facets from full catalog
  const brandsMap = new Map<string, number>();
  const categoriesMap = new Map<string, number>();
  let priceMin = Infinity;
  let priceMax = 0;

  allProducts.forEach((p) => {
    if (p.brand) brandsMap.set(p.brand, (brandsMap.get(p.brand) || 0) + 1);
    categoriesMap.set(p.category, (categoriesMap.get(p.category) || 0) + 1);
    p.variants.forEach((v) => {
      if (v.price !== null) {
        priceMin = Math.min(priceMin, v.price);
        priceMax = Math.max(priceMax, v.price);
      }
    });
  });

  const facets = {
    brands: Array.from(brandsMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    categories: Array.from(categoriesMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    price: {
      min: priceMin === Infinity ? 0 : priceMin,
      max: priceMax,
    },
  };

  const sectionsData = {
    featured: featuredProducts,
    newArrivals,
    inStockNow,
  };

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

      {/* Merchandising Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<MerchandisingSectionsSkeleton />}>
          <MerchandisingSections sectionsData={sectionsData} />
        </Suspense>
      </section>

      {/* Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-2">
        <CatalogClient
          allProducts={allProducts}
          facets={facets}
        />
      </section>

      <Footer />
    </main>
  );
}
