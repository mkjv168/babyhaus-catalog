import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  const categories = [...new Set(products.map(p => p.category))];
  const featured = products.filter(p => p.featured);

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-[#d4a574]">Baby</span>
            <span className="text-[#2d2d2d]">Haus</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#7a7a7a]">
              <span className="text-lg">🇰🇭</span> Cambodia
            </span>
            <Link href="/admin" className="text-sm text-[#7a7a7a] hover:text-[#d4a574] transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm border border-[#e8e4df]">
          <div className="max-w-2xl">
            <p className="text-[#d4a574] text-sm font-medium tracking-wide uppercase mb-4">
              🇺🇸 USA & 🇯🇵 Japan Imports
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Premium Baby Goods,<br />
              <span className="text-[#d4a574]">Curated with Care</span>
            </h1>
            <p className="text-[#7a7a7a] text-lg mb-8 leading-relaxed max-w-lg">
              High-quality baby products sourced from the US and Japan. 
              Browse our catalog and order directly via Telegram.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#catalog" className="inline-flex items-center px-6 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors">
                Browse Catalog →
              </a>
              <a href="https://t.me/narotee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors">
                Chat on Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <span key={cat} className="px-5 py-2 text-sm font-medium bg-white border border-[#e8e4df] rounded-full text-[#7a7a7a] hover:border-[#d4a574] hover:text-[#d4a574] transition-colors cursor-default">
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#d4a574] rounded-full"></span>
            Featured Products
          </h2>
        </section>
      )}

      {/* Product Grid */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Link href={`/product/${product.id}`} key={product.id} className="group block">
              <div className="bg-white rounded-2xl overflow-hidden border border-[#e8e4df] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#d4a574]/30">
                <div className="aspect-square relative bg-[#f5f1ec]">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">👶</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[#d4a574] text-xs font-semibold tracking-wide uppercase mb-1.5">{product.brand || product.category}</p>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[#d4a574] transition-colors">{product.name}</h3>
                  <p className="text-[#7a7a7a] text-sm line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#d4a574] font-bold text-lg">
                      {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      product.stockStatus === 'instock' 
                        ? 'bg-green-50 text-green-600' 
                        : product.stockStatus === 'preorder'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {product.stockStatus === 'instock' ? 'In Stock' : product.stockStatus === 'preorder' ? 'Pre-Order' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e8e4df] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl font-bold mb-2">
            <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span>
          </p>
          <p className="text-[#7a7a7a] text-sm mb-4">Premium baby products from 🇺🇸 & 🇯🇵 · Online based in 🇰🇭 Cambodia</p>
          <a href="https://instagram.com/babyhaus.kh" target="_blank" rel="noopener noreferrer" className="text-sm text-[#d4a574] hover:underline">
            @babyhaus.kh on Instagram
          </a>
        </div>
      </footer>
    </main>
  );
}
