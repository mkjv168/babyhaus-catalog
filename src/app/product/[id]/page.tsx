import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import ProductGallery from '@/components/ProductGallery';
import { ProductInfoPanel } from '@/components/ProductInfoPanel';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { id: true } });
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return { title: 'Product Not Found | Baby Haus' };
  }
  return {
    title: `${product.name} | Baby Haus`,
    description: product.description || `Shop ${product.name} from ${product.brand || product.category}. Premium baby products imported from USA and Japan. Order via Telegram for fast delivery in Cambodia.`,
    openGraph: {
      title: product.name,
      description: `Premium ${product.category} from Baby Haus`,
      images: product.imageUrl ? [product.imageUrl] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } }, variants: true },
  });
  if (!product) notFound();

  const imageUrls = product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.imageUrl ? [product.imageUrl] : [];

  return (
    <main className="min-h-screen bg-white text-[#2D2D2D]">
      <Header />

      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-sm border-b border-[#F0E6DD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Catalog
          </Link>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <ProductGallery images={imageUrls} productName={product.name} />
          <ProductInfoPanel
            product={{
              id: product.id,
              name: product.name,
              brand: product.brand,
              category: product.category,
              imageUrl: product.imageUrl,
            }}
            variants={product.variants}
          />
        </div>
        <div className="mt-6 md:mt-10">
          <ProductDetailClient product={product} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
