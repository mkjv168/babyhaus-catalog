import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderForm from './OrderForm';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span>
          </Link>
          <Link href={`/product/${product.id}`} className="text-sm text-[#7a7a7a] hover:text-[#d4a574] transition-colors">
            ← Back to Product
          </Link>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <p className="text-[#d4a574] text-sm font-semibold tracking-wide uppercase mb-2">Order Request</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-[#7a7a7a]">
            {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'} · {product.stockStatus === 'instock' ? 'In Stock' : product.stockStatus === 'preorder' ? 'Pre-Order' : 'Out of Stock'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e4df] p-8 shadow-sm">
          <OrderForm productId={product.id} productName={product.name} productPrice={product.price} />
        </div>
      </section>
    </main>
  );
}
