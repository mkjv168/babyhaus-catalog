import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { CatalogClient } from '@/components/CatalogClient';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <Header />

      {/* Compact Hero for Mobile */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-[#f5ebe0] to-[#f5f1ec]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d4a574 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 md:pt-12 md:pb-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5ebe0] text-[#d4a574] text-xs font-semibold mb-3">
              <span>🇺🇸</span> USA & <span>🇯🇵</span> Japan Imports
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-2 md:mb-4">
              Premium Baby Goods,<br className="hidden md:block" />
              <span className="text-[#d4a574]"> Curated with Care</span>
            </h1>
            <p className="text-[#7a7a7a] text-sm md:text-base leading-relaxed max-w-lg mx-auto md:mx-0 mb-4">
              High-quality baby products sourced from the US and Japan.
              Browse our catalog and order directly via Telegram.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <a
                href="https://t.me/narote"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-[#d4a574] text-white text-sm font-semibold rounded-full hover:bg-[#c49464] transition-colors shadow-sm"
              >
                Chat on Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-2">
        {products.length === 0 ? (
          <div className="text-center py-20 text-[#7a7a7a]">
            <p className="text-5xl mb-4">👶</p>
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[#f5f1ec]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#f5f1ec] rounded w-1/2" />
                    <div className="h-4 bg-[#f5f1ec] rounded w-3/4" />
                    <div className="h-3 bg-[#f5f1ec] rounded w-1/3" />
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
