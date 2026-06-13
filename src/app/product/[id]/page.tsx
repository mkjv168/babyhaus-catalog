import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductImage } from '@/components/ProductImage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-[#7a7a7a] hover:text-[#d4a574] transition-colors inline-flex items-center gap-1"
          >
            &larr; Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square relative bg-[#f5f1ec] rounded-2xl overflow-hidden border border-[#e8e4df]">
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[#d4a574] text-sm font-semibold tracking-wide uppercase mb-2">
              {product.brand || product.category}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-[#7a7a7a] text-lg mb-6 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-6 flex items-center flex-wrap gap-3">
              <span className="text-3xl font-bold text-[#d4a574]">
                {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
              </span>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
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

            {product.sku && (
              <p className="text-sm text-[#7a7a7a] mb-8">SKU: {product.sku}</p>
            )}

            <div className="flex flex-col gap-3">
              {product.stockStatus !== 'outofstock' && (
                <Link
                  href={`/order/${product.id}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors text-center shadow-sm"
                >
                  Place Order Request
                </Link>
              )}
              <a
                href={`https://t.me/narotee?text=${telegramMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-center bg-white/60"
              >
                Chat on Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
