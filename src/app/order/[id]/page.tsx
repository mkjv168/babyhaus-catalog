import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderForm from './OrderForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { variantId } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!product) notFound();

  const selectedVariant =
    product.variants.find((v) => v.id === variantId) ??
    product.variants.find((v) => v.stockStatus === 'instock') ??
    product.variants[0];

  if (!selectedVariant) notFound();

  const stockLabel =
    selectedVariant.stockStatus === 'instock'
      ? 'In Stock'
      : selectedVariant.stockStatus === 'preorder'
      ? 'Pre-Order'
      : 'Out of Stock';

  return (
    <main className="min-h-screen bg-white text-[#2D2D2D]">
      <Header />

      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-sm border-b border-[#F0E6DD]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Link
            href={`/product/${product.id}`}
            className="inline-flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Product
          </Link>
        </div>
      </div>

      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="text-center mb-8">
          <p className="text-[#FF6B9D] text-xs font-bold tracking-wide uppercase mb-2">
            Order Request
          </p>
          <h1 className="text-xl md:text-2xl font-bold mb-2 leading-tight">{product.name}</h1>
          <p className="text-[#6B6B6B] text-sm">
            {selectedVariant.name} ·{' '}
            {selectedVariant.price ? `$${selectedVariant.price.toFixed(2)}` : 'Ask for Price'} ·{' '}
            {stockLabel}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6DD] p-5 md:p-8 shadow-sm">
          <OrderForm
            variantId={selectedVariant.id}
            productName={product.name}
            variantName={selectedVariant.name}
            productPrice={selectedVariant.price}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
