import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import ProductGallery from '@/components/ProductGallery';
import { ProductInfoPanel } from '@/components/ProductInfoPanel';
import { CompactProductCard } from '@/components/CompactProductCard';
import { categoryUrl } from '@/lib/category';
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

type ProductCardData = NonNullable<Awaited<ReturnType<typeof getProductDiscoverySections>>['relatedProducts'][number]>;

async function getProductDiscoverySections(product: { id: string; category: string; brand: string | null }) {
  const sameCategoryProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: 4,
    include: { images: { orderBy: { order: 'asc' } }, variants: true },
  });

  const usedIds = new Set([product.id, ...sameCategoryProducts.map((item) => item.id)]);
  const fallbackProducts = sameCategoryProducts.length < 4
    ? await prisma.product.findMany({
        where: {
          featured: true,
          id: { notIn: Array.from(usedIds) },
        },
        orderBy: { createdAt: 'desc' },
        take: 4 - sameCategoryProducts.length,
        include: { images: { orderBy: { order: 'asc' } }, variants: true },
      })
    : [];

  const sameBrandProducts = product.brand
    ? await prisma.product.findMany({
        where: {
          brand: product.brand,
          id: { not: product.id },
        },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take: 4,
        include: { images: { orderBy: { order: 'asc' } }, variants: true },
      })
    : [];

  return {
    relatedProducts: [...sameCategoryProducts, ...fallbackProducts],
    sameBrandProducts,
  };
}

function ProductDiscoverySection({ title, products }: { title: string; products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="border-l-4 border-[#FF6B9D] pl-3 text-lg md:text-xl font-bold text-[#2D2D2D] font-['Fredoka']">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map((item) => (
          <CompactProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
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
  const { relatedProducts, sameBrandProducts } = await getProductDiscoverySections(product);

  return (
    <main className="min-h-screen bg-white text-[#2D2D2D]">
      <Header />

      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-sm border-b border-[#F0E6DD]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors"
          >
            Home
          </Link>
          <span className="mx-2 text-[#D4A574]">/</span>
          <Link
            href={categoryUrl(product.category)}
            className="inline-flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors"
          >
            {product.category}
          </Link>
          <span className="mx-2 text-[#D4A574]">/</span>
          <span className="text-sm font-medium text-[#2D2D2D] line-clamp-1">{product.name}</span>
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
        <div className="mt-8 md:mt-12 space-y-8">
          <ProductDiscoverySection title="Related Products" products={relatedProducts} />
          <ProductDiscoverySection title={`More from ${product.brand}`} products={sameBrandProducts} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
