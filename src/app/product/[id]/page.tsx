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
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4]">
      <header className="border-b border-white/5 bg-[#06060a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider text-[#c9a84c]">BABY HAUS</Link>
          <Link href="/" className="text-sm text-[#9a9590] hover:text-[#c9a84c] transition-colors">← Back to Catalog</Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square relative bg-[#16161f] border border-white/5">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#c9a84c]/20 text-6xl font-serif">B</div>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[#8a7340] text-xs tracking-[3px] uppercase mb-3">{product.brand || product.category}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-[#9a9590] text-lg mb-6 leading-relaxed">{product.description}</p>
            <div className="mb-8">
              <span className="text-3xl font-bold text-[#c9a84c]">
                {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'}
              </span>
              <span className="ml-4 text-sm text-[#9a9590] uppercase tracking-wider">{product.stockStatus}</span>
            </div>
            {product.sku && <p className="text-sm text-[#9a9590] mb-8">SKU: {product.sku}</p>}

            <div className="flex flex-col gap-3">
              <Link
                href={`/order/${product.id}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-sm hover:bg-[#ddb654] transition-colors"
              >
                Place Order Request
              </Link>
              <a
                href={`https://t.me/narotee?text=${telegramMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/10 text-[#f0ece4] font-semibold tracking-wider uppercase text-sm hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors"
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
