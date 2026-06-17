import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { CatalogClient } from '@/components/CatalogClient';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
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
import {
  MerchandisingSections,
  MerchandisingSectionsSkeleton,
  getMerchandisingSections,
} from '@/components/MerchandisingSections';

export const revalidate = 60;

type HomeSearchParams = Promise<{
  q?: SearchParamValue;
  category?: SearchParamValue;
  brand?: SearchParamValue;
  minPrice?: SearchParamValue;
  maxPrice?: SearchParamValue;
  stock?: SearchParamValue;
  sort?: SearchParamValue;
  page?: SearchParamValue;
  featured?: SearchParamValue;
}>;

export default async function Home({ searchParams }: { searchParams: HomeSearchParams }) {
  const params = await searchParams;
  const category = firstParam(params.category).trim();
  const merchandisingPromise = getMerchandisingSections();
  const filters: CatalogFilters = {
    q: firstParam(params.q).trim(),
    category: category === 'All' ? '' : category,
    brands: parseBrands(params.brand),
    minPrice: parsePrice(params.minPrice),
    maxPrice: parsePrice(params.maxPrice),
    stock: parseStock(params.stock),
    sort: parseSort(params.sort),
    page: parsePage(params.page),
    featured: firstParam(params.featured) === 'true',
  };

  const where = buildProductWhere(filters);
  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const currentPage = totalPages > 0 ? Math.min(filters.page, totalPages) : 1;
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const categoryFacetWhere = buildProductWhere(filters, { omitCategory: true });
  const brandFacetWhere = buildProductWhere(filters, { omitBrand: true });
  const priceFacetWhere = buildProductWhere(filters, { omitPrice: true });

  const [
    products,
    banners,
    categoryCounts,
    brandCounts,
    priceFacet,
    featuredProducts,
  ] = await Promise.all([
    filters.sort === 'price-asc' || filters.sort === 'price-desc'
      ? getPriceSortedProducts(where, filters.sort, skip, PRODUCTS_PER_PAGE)
      : prisma.product.findMany({
          where,
          orderBy: orderByForSort(filters.sort),
          skip,
          take: PRODUCTS_PER_PAGE,
          include: { images: { orderBy: { order: 'asc' } }, variants: true },
        }),
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    }),
    prisma.product.groupBy({
      by: ['category'],
      where: categoryFacetWhere,
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
      where: { featured: true },
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF0F5]">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #FF6B9D 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 md:pt-16 md:pb-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-3 font-['Fredoka']">
              <span className="text-[#FF6B9D]">B</span>
              <span className="text-[#F5A623]">a</span>
              <span className="text-[#4CAF50]">b</span>
              <span className="text-[#2196F3]">y</span>
              <span className="text-[#4CAF50]">H</span>
              <span className="text-[#F5A623]">a</span>
              <span className="text-[#90CAF9]">u</span>
              <span className="text-[#FF6B9D]">s</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0F5] text-[#FF6B9D] text-xs font-semibold mb-4">
              <span>🇺🇸</span> USA & <span>🇯🇵</span> Japan Imports
            </div>
            <p className="text-[#6B6B6B] text-sm md:text-lg leading-relaxed max-w-lg mx-auto mb-5">
              Premium baby products sourced from the US and Japan.
              Browse our catalog and order directly via Telegram.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://t.me/narote"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 bg-[#FF6B9D] text-white text-sm font-semibold rounded-full hover:bg-[#E85A8A] transition-colors shadow-sm"
              >
                Chat on Telegram ✨
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <BannerCarousel banners={banners} />
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<MerchandisingSectionsSkeleton />}>
          <MerchandisingSections sectionsPromise={merchandisingPromise} />
        </Suspense>
      </section>

      {/* Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-2">
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#F0E6DD] overflow-hidden animate-pulse">
                <div className="aspect-square bg-[#FFF9F5]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#FFF9F5] rounded w-1/2" />
                  <div className="h-4 bg-[#FFF9F5] rounded w-3/4" />
                  <div className="h-3 bg-[#FFF9F5] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        }>
          <CatalogClient
            products={products}
            featuredProducts={featuredProducts}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            facets={facets}
          />
        </Suspense>
      </section>

      <Footer />
    </main>
  );
}
