import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductImage } from '@/components/ProductImage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default async function Home() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  const categories = [...new Set(products.map((p) => p.category))];
  const featured = products.filter((p) => p.featured);

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-[#f5ebe0] to-[#f5f1ec]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d4a574 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm border border-[#e8e4df]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f5ebe0] text-[#d4a574] text-sm font-medium mb-6">
                <span>🇺🇸</span> USA & <span>🇯🇵</span> Japan Imports
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Premium Baby Goods,
                <br />
                <span className="text-[#d4a574]">Curated with Care</span>
              </h1>
              <p className="text-[#7a7a7a] text-lg mb-8 leading-relaxed max-w-lg">
                High-quality baby products sourced from the US and Japan.
                Browse our catalog and order directly via Telegram.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#catalog"
                  className="inline-flex items-center px-6 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors shadow-sm"
                >
                  Browse Catalog &rarr;
                </a>
                <a
                  href="https://t.me/narotee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors bg-white/60"
                >
                  Chat on Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-5 py-2 text-sm font-medium bg-white border border-[#e8e4df] rounded-full text-[#7a7a7a] hover:border-[#d4a574] hover:text-[#d4a574] transition-colors cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#d4a574] rounded-full" />
            Featured Products
          </h2>
        </section>
      )}

      {/* Product Grid */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {products.length === 0 ? (
          <div className="text-center py-20 text-[#7a7a7a]">
            <p className="text-5xl mb-4">👶</p>
            <p className="text-lg">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#e8e4df] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#d4a574]/30 flex flex-col"
              >
                <Link href={`/product/${product.id}`} className="block">
                  <div className="aspect-square relative bg-[#f5f1ec]">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full"
                    />
                    {product.featured && (
                      <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-[#d4a574] text-white rounded-full shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[#d4a574] text-xs font-semibold tracking-wide uppercase mb-1.5">
                    {product.brand || product.category}
                  </p>
                  <Link href={`/product/${product.id}`} className="block mb-2">
                    <h3 className="text-lg font-bold group-hover:text-[#d4a574] transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[#7a7a7a] text-sm line-clamp-2 mb-4 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#d4a574] font-bold text-lg">
                      {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
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
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/product/${product.id}`}
                      className="inline-flex items-center justify-center px-4 py-2.5 bg-[#d4a574] text-white text-sm font-semibold rounded-xl hover:bg-[#c49464] transition-colors"
                    >
                      View Details
                    </Link>
                    {product.stockStatus !== 'outofstock' && (
                      <Link
                        href={`/order/${product.id}`}
                        className="inline-flex items-center justify-center px-4 py-2.5 border border-[#e8e4df] text-[#2d2d2d] text-sm font-semibold rounded-xl hover:border-[#d4a574] hover:text-[#d4a574] transition-colors"
                      >
                        Order Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
