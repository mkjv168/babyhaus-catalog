import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CatalogClient } from '@/components/CatalogClient';
import { categoryToSlug } from '@/lib/category';

export const revalidate = 60;

type CategoryParams = Promise<{ slug: string }>;

async function getCategoryFromSlug(slug: string): Promise<string | null> {
  const categories = await prisma.product.groupBy({
    by: ['category'],
    orderBy: { category: 'asc' },
  });
  return categories.find((item) => categoryToSlug(item.category) === slug)?.category ?? null;
}

function categoryDescription(category: string): string {
  return `Shop Baby Haus ${category.toLowerCase()} picks imported from the US and Japan, with easy ordering through Telegram.`;
}

export async function generateStaticParams() {
  const categories = await prisma.product.groupBy({
    by: ['category'],
  });
  return categories.map((item) => ({ slug: categoryToSlug(item.category) }));
}

export async function generateMetadata({ params }: { params: CategoryParams }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryFromSlug(slug);
  if (!category) {
    return { title: 'Category Not Found | Baby Haus' };
  }
  return {
    title: `${category} | Baby Haus`,
    description: categoryDescription(category),
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: CategoryParams }) {
  const { slug } = await params;
  const category = await getCategoryFromSlug(slug);

  if (!category) notFound();

  const allCategoryProducts = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    include: { images: { orderBy: { order: 'asc' } }, variants: true },
  });

  // Compute facets from category products
  const brandsMap = new Map<string, number>();
  let priceMin = Infinity;
  let priceMax = 0;

  allCategoryProducts.forEach((p) => {
    if (p.brand) brandsMap.set(p.brand, (brandsMap.get(p.brand) || 0) + 1);
    p.variants.forEach((v) => {
      if (v.price !== null) {
        priceMin = Math.min(priceMin, v.price);
        priceMax = Math.max(priceMax, v.price);
      }
    });
  });

  const facets = {
    brands: Array.from(brandsMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    categories: [{ name: category, count: allCategoryProducts.length }],
    price: {
      min: priceMin === Infinity ? 0 : priceMin,
      max: priceMax,
    },
  };

  return (
    <main className="min-h-screen bg-white text-[#2D2D2D]">
      <Header />

      <section className="bg-[#faf8f5] border-b border-[#F0E6DD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="border-l-4 border-[#FF6B9D] pl-4 text-3xl md:text-5xl font-bold font-['Fredoka'] text-[#2D2D2D]">
            {category}
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            {categoryDescription(category)}
          </p>
        </div>
      </section>

      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-6">
        <Suspense fallback={null}>
          <CatalogClient
            allProducts={allCategoryProducts}
            facets={facets}
            lockedCategory={category}
          />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}
