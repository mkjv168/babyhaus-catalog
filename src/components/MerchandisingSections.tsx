import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CompactProductCard } from './CompactProductCard';

type ProductCardData = Awaited<ReturnType<typeof getMerchandisingSections>>[number]['products'][number];

export async function getMerchandisingSections() {
  const [featuredProducts, newArrivals, inStockNow] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { images: { orderBy: { order: 'asc' } }, variants: true },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { images: { orderBy: { order: 'asc' } }, variants: true },
    }),
    prisma.product.findMany({
      where: { variants: { some: { stockStatus: 'instock' } } },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: { images: { orderBy: { order: 'asc' } }, variants: true },
    }),
  ]);

  return [
    {
      title: 'Featured Products',
      href: '/?featured=true#catalog',
      products: featuredProducts,
    },
    {
      title: 'New Arrivals',
      href: '/?sort=newest#catalog',
      products: newArrivals,
    },
    {
      title: 'In Stock Now',
      href: '/?stock=inStock#catalog',
      products: inStockNow,
    },
  ];
}

function MerchandisingSection({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: ProductCardData[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="border-l-4 border-[#FF6B9D] pl-3 text-lg md:text-xl font-bold text-[#2D2D2D] font-['Fredoka']">
          {title}
        </h2>
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-[#FF6B9D] hover:text-[#E85A8A] transition-colors"
        >
          See all -&gt;
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0 md:gap-4">
        {products.map((product) => (
          <div key={product.id} className="min-w-[72%] sm:min-w-[42%] snap-start md:min-w-0">
            <CompactProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export async function MerchandisingSections({
  sectionsPromise,
}: {
  sectionsPromise: ReturnType<typeof getMerchandisingSections>;
}) {
  const sections = await sectionsPromise;

  return (
    <div className="space-y-7">
      {sections.map((section) => (
        <MerchandisingSection
          key={section.title}
          title={section.title}
          href={section.href}
          products={section.products}
        />
      ))}
    </div>
  );
}

export function MerchandisingSectionsSkeleton() {
  return (
    <div className="space-y-7">
      {['Featured Products', 'New Arrivals', 'In Stock Now'].map((title) => (
        <section key={title} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-[#FF6B9D] pl-3">
              <div className="h-6 w-40 rounded-full bg-[#FFF0F5] animate-pulse" />
            </div>
            <div className="h-4 w-16 rounded-full bg-[#FFF0F5] animate-pulse" />
          </div>
          <div className="flex gap-3 overflow-hidden md:grid md:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-w-[72%] sm:min-w-[42%] md:min-w-0 bg-white rounded-3xl border border-[#F0E6DD] overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-[#FFF9F5]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-[#FFF0F5]" />
                  <div className="h-4 w-3/4 rounded bg-[#FFF0F5]" />
                  <div className="h-8 rounded-full bg-[#FFF0F5]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
