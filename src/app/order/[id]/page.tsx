import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderForm from './OrderForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <Header />

      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href={`/product/${product.id}`}
            className="text-sm text-[#7a7a7a] hover:text-[#d4a574] transition-colors inline-flex items-center gap-1"
          >
            &larr; Back to Product
          </Link>
        </div>

        <div className="text-center mb-10">
          <p className="text-[#d4a574] text-sm font-semibold tracking-wide uppercase mb-2">
            Order Request
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-[#7a7a7a]">
            {product.price ? `$${product.price.toFixed(2)}` : 'Ask for Price'} ·{' '}
            {product.stockStatus === 'instock'
              ? 'In Stock'
              : product.stockStatus === 'preorder'
              ? 'Pre-Order'
              : 'Out of Stock'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e4df] p-8 shadow-sm">
          <OrderForm productId={product.id} productName={product.name} productPrice={product.price} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
