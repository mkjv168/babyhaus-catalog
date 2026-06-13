import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderForm from './OrderForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />

      {/* Sticky back button bar */}
      <div className="sticky top-14 z-30 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Link
            href={`/product/${product.id}`}
            className="inline-flex items-center gap-1 text-sm text-[#a0a0a0] hover:text-[#FF4D9F] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Product
          </Link>
        </div>
      </div>

      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="text-center mb-8">
          <p className="text-[#FF4D9F] text-xs font-bold tracking-wide uppercase mb-2">
            Order Request
          </p>
          <h1 className="text-xl md:text-2xl font-bold mb-2 leading-tight">{product.name}</h1>
          <p className="text-[#a0a0a0] text-sm">
            {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'} ·{' '}
            {product.stockStatus === 'instock'
              ? 'In Stock'
              : product.stockStatus === 'preorder'
              ? 'Pre-Order'
              : 'Out of Stock'}
          </p>
        </div>

        <div className="bg-[#141414] rounded-2xl border border-white/10 p-5 md:p-8 shadow-sm">
          <OrderForm productId={product.id} productName={product.name} productPrice={product.price} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
