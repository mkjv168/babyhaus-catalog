import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CatalogClient } from '@/components/CatalogClient';
import { categoryToSlug } from '@/lib/category';
import {
  PRODUCTS_PER_PAGE,
  buildProductWhere,
  firstParam,
  getPriceSortedProducts,
  orderByForSort,
  parseBrands,
  parsePage,
  parsePrice,
  parseSort,
  parseStock,
  type CatalogFilters,
  type SearchParamValue,
} from '@/lib/catalog';

export const revalidate = 60;

type CategoryParams = Promise<{ slug: string }>;
type CategorySearchParams = Promise<{
  q?: SearchParamValue;
  brand?: SearchParamValue;
  minPrice?: SearchParamValue;
  maxPrice?: SearchParamValue;
  stock?: SearchParamValue;
  sort?: SearchParamValue;
  page?: SearchParamValue;
  featured?: SearchParamValue;
}>;

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
    alternates: {
      canonical: `/category/${slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: CategoryParams;
  searchParams: CategorySearchParams;
}) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  const category = await getCategoryFromSlug(slug);

  if (!category) notFound();

  const filters: CatalogFilters = {
    q: firstParam(queryParams.q).trim(),
    category,
    brands: parseBrands(queryParams.brand),
    minPrice: parsePrice(queryParams.minPrice),
    maxPrice: parsePrice(queryParams.maxPrice),
    stock: parseStock(queryParams.stock),
    sort: parseSort(queryParams.sort),
    page: parsePage(queryParams.page),
    featured: firstParam(queryParams.featured) === 'true',
  };

  const where = buildProductWhere(filters);
  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const currentPage = totalPages > 0 ? Math.min(filters.page, totalPages) : 1;
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const brandFacetWhere = buildProductWhere(filters, { omitBrand: true });
  const priceFacetWhere = buildProductWhere(filters, { omitPrice: true });

  const [products, categoryCounts, brandCounts, priceFacet, featuredProducts] = await Promise.all([
    filters.sort === 'price-asc' || filters.sort === 'price-desc'
      ? getPriceSortedProducts(where, filters.sort, skip, PRODUCTS_PER_PAGE)
      : prisma.product.findMany({
          where,
          orderBy: orderByForSort(filters.sort),
          skip,
          take: PRODUCTS_PER_PAGE,
          include: { images: { orderBy: { order: 'asc' } }, variants: true },
        }),
    prisma.product.groupBy({
      by: ['category'],
      where: buildProductWhere(filters, { omitCategory: true }),
      _count: { _all: true },
      orderBy: { category: 'asc' },
    }),
    prisma.product.groupBy({
      by: ['brand'],
      where: { AND: [brandFacetWhere, { brand: { not: null } }] },
      _count: { _all: true },
      orderBy: { brand: 'asc' },
    }),
    prisma.productVariant.aggregate({
      where: {
        product: priceFacetWhere,
        price: { not: null },
      },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.findMany({
      where: { featured: true, category },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { images: { orderBy: { order: 'asc' } }, variants: true },
    }),
  ]);

  const facets = {
    brands: brandCounts
      .filter((item): item is typeof item & { brand: string } => item.brand !== null)
      .map((item) => ({ name: item.brand, count: item._count._all })),
    categories: categoryCounts.map((item) => ({ name: item.category, count: item._count._all })),
    price: {
      min: priceFacet._min.price ?? 0,
      max: priceFacet._max.price ?? 0,
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
            products={products}
            featuredProducts={featuredProducts}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            facets={facets}
            lockedCategory={category}
          />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}
