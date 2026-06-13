import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const telegramMessage = encodeURIComponent(
    `Hi Baby Haus, I am interested in ordering: ${product.name}${product.price ? ` ($${product.price.toFixed(2)})` : ''}. Please confirm availability.`
  );

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span>
          </Link>
          <Link href="/" className="text-sm text-[#7a7a7a] hover:text-[#d4a574] transition-colors flex items-center gap-1">
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square relative bg-[#f5f1ec] rounded-2xl overflow-hidden border border-[#e8e4df]">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl">👶</span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[#d4a574] text-sm font-semibold tracking-wide uppercase mb-2">{product.brand || product.category}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-[#7a7a7a] text-lg mb-6 leading-relaxed">{product.description}</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#d4a574]">
                {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
              </span>
              <span className={`ml-4 text-sm font-semibold px-3 py-1 rounded-full ${
                product.stockStatus === 'instock' 
                  ? 'bg-green-50 text-green-600' 
                  : product.stockStatus === 'preorder'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {product.stockStatus === 'instock' ? 'In Stock' : product.stockStatus === 'preorder' ? 'Pre-Order' : 'Out of Stock'}
              </span>
            </div>
            {product.sku && <p className="text-sm text-[#7a7a7a] mb-8">SKU: {product.sku}</p>}

            <div className="flex flex-col gap-3">
              <Link
                href={`/order/${product.id}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors text-center"
              >
                Place Order Request
              </Link>
              <a
                href={`https://t.me/narotee?text=${telegramMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-center"
              >
                Chat on Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
