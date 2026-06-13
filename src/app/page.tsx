import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { CatalogClient } from '@/components/CatalogClient';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const revalidate = 60;

export default async function Home() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ffffff]">
      <Header />

      {/* Compact Hero for Mobile */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at center, rgba(255, 77, 159, 0.3) 0%, rgba(255, 179, 71, 0.15) 50%, transparent 70%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 md:pt-12 md:pb-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF4D9F] via-[#FFB347] to-[#39FF14] border border-white/10 text-black text-xs font-semibold mb-3">
              <span>🇺🇸</span> USA & <span>🇯🇵</span> Japan Imports
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-2 md:mb-4 font-['Fredoka'] tracking-tight">
              💖 <span className="text-gradient">Baby Haus</span> ✨<br className="hidden md:block" />
              <span className="text-white">Premium Care, Made Simple</span>
            </h1>
            <p className="text-[#a0a0a0] text-sm md:text-base leading-relaxed max-w-lg mx-auto md:mx-0 mb-4">
              High-quality baby products sourced from the US and Japan.
              Browse our catalog and order directly via Telegram.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <a
                href="https://t.me/narote"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#FF4D9F] via-[#FFB347] to-[#39FF14] text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200"
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
          <div className="text-center py-20 text-[#a0a0a0]">
            <p className="text-5xl mb-4">👶</p>
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-[#1a1a1a]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                    <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
                    <div className="h-3 bg-[#1a1a1a] rounded w-1/3" />
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
