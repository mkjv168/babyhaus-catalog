import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderForm from './OrderForm';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4]">
      <header className="border-b border-white/5 bg-[#06060a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider text-[#c9a84c]">BABY HAUS</Link>
          <Link href={`/product/${product.id}`} className="text-sm text-[#9a9590] hover:text-[#c9a84c] transition-colors">← Back to Product</Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <p className="text-[#8a7340] text-xs tracking-[3px] uppercase mb-3">Order Request</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-[#9a9590]">
            {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'} · {product.stockStatus}
          </p>
        </div>

        <div className="bg-[#0e0e14] border border-white/5 p-8">
          <OrderForm productId={product.id} productName={product.name} productPrice={product.price} />
        </div>
      </section>
    </main>
  );
}
