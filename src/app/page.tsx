import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4]">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#06060a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider text-[#c9a84c]">
            BABY HAUS
          </Link>
          <p className="hidden sm:block text-sm text-[#9a9590] tracking-wide">
            High Quality Baby Products from 🇺🇸🇯🇵
          </p>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-[#8a7340] text-sm tracking-[3px] uppercase mb-4">Online Based · Cambodia 🇰🇭</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          Premium Baby Goods<br /><span className="text-[#c9a84c]">Curated for Your Little One</span>
        </h1>
        <p className="text-[#9a9590] max-w-2xl mx-auto text-lg">
          Browse our catalog of imported baby products. Order via Telegram and we will get back to you right away.
        </p>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <span key={cat} className="px-4 py-1.5 text-xs tracking-widest uppercase border border-white/10 text-[#9a9590] rounded-sm">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Link href={`/product/${product.id}`} key={product.id} className="group block">
              <div className="bg-[#0e0e14] border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#8a7340]/50 hover:-translate-y-1">
                <div className="aspect-square relative bg-[#16161f]">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c9a84c]/20 text-5xl font-serif">B</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[#8a7340] text-xs tracking-widest uppercase mb-2">{product.brand || product.category}</p>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-[#c9a84c] transition-colors">{product.name}</h3>
                  <p className="text-[#9a9590] text-sm line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#c9a84c] font-semibold">
                      {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
                    </span>
                    <span className="text-xs text-[#9a9590] uppercase tracking-wider">{product.stockStatus}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-[#9a9590] text-sm">
        <p>Baby Haus · Cambodia 🇰🇭 · Premium Baby Products</p>
      </footer>
    </main>
  );
}
