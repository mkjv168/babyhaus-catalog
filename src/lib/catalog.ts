import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const PRODUCTS_PER_PAGE = 12;
export const VALID_SORTS = ['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest'] as const;

export type SortOption = (typeof VALID_SORTS)[number];
export type SearchParamValue = string | string[] | undefined;

export interface CatalogFilters {
  q: string;
  category: string;
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  stock: string;
  sort: SortOption;
  page: number;
  featured: boolean;
}

export function firstParam(value: SearchParamValue): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function parsePrice(value: SearchParamValue): number | null {
  const parsed = Number(firstParam(value));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parsePage(value: SearchParamValue): number {
  const parsed = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseSort(value: SearchParamValue): SortOption {
  const sort = firstParam(value);
  return VALID_SORTS.includes(sort as SortOption) ? sort as SortOption : 'newest';
}

export function parseStock(value: SearchParamValue): string {
  const stock = firstParam(value);
  return stock === 'inStock' || stock === 'outOfStock' ? stock : '';
}

export function parseBrands(value: SearchParamValue): string[] {
  return firstParam(value)
    .split(',')
    .map((brand) => brand.trim())
    .filter(Boolean);
}

export function buildProductWhere(
  filters: CatalogFilters,
  options: { omitCategory?: boolean; omitBrand?: boolean; omitPrice?: boolean } = {}
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { brand: { contains: filters.q, mode: 'insensitive' } },
        { category: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: filters.q, mode: 'insensitive' } } } },
        { variants: { some: { name: { contains: filters.q, mode: 'insensitive' } } } },
      ],
    });
  }

  if (filters.category && !options.omitCategory) {
    and.push({ category: filters.category });
  }

  if (filters.featured) {
    and.push({ featured: true });
  }

  if (filters.brands.length > 0 && !options.omitBrand) {
    and.push({ brand: { in: filters.brands } });
  }

  if (!options.omitPrice && (filters.minPrice !== null || filters.maxPrice !== null)) {
    const price: Prisma.FloatNullableFilter<'ProductVariant'> = {};
    if (filters.minPrice !== null) price.gte = filters.minPrice;
    if (filters.maxPrice !== null) price.lte = filters.maxPrice;
    and.push({ variants: { some: { price } } });
  }

  if (filters.stock === 'inStock') {
    and.push({ variants: { some: { stockStatus: 'instock' } } });
  }

  if (filters.stock === 'outOfStock') {
    and.push({
      variants: {
        some: {},
        every: { stockStatus: 'outofstock' },
      },
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export function orderByForSort(sort: SortOption): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'name-asc':
      return [{ name: 'asc' }, { createdAt: 'desc' }];
    case 'name-desc':
      return [{ name: 'desc' }, { createdAt: 'desc' }];
    case 'newest':
    case 'price-asc':
    case 'price-desc':
    default:
      return [{ createdAt: 'desc' }];
  }
}

export async function getPriceSortedProducts(
  where: Prisma.ProductWhereInput,
  sort: 'price-asc' | 'price-desc',
  skip: number,
  take: number
) {
  const pricedProductWhere: Prisma.ProductWhereInput = {
    AND: [where, { variants: { some: { price: { not: null } } } }],
  };
  const pricedProductCount = await prisma.product.count({ where: pricedProductWhere });
  const pricedTake = Math.max(0, Math.min(take, pricedProductCount - skip));
  const pricedSkip = Math.min(skip, pricedProductCount);

  const variantRows = pricedTake > 0
    ? await prisma.productVariant.groupBy({
        by: ['productId'],
        where: {
          product: where,
          price: { not: null },
        },
        _min: { price: true },
        orderBy: {
          _min: {
            price: sort === 'price-asc' ? 'asc' : 'desc',
          },
        },
        skip: pricedSkip,
        take: pricedTake,
      })
    : [];

  const productIds = variantRows.map((row) => row.productId);
  const remainingTake = take - productIds.length;
  const noPriceSkip = Math.max(0, skip - pricedProductCount);

  const [pricedProducts, noPriceProducts] = await Promise.all([
    productIds.length > 0
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { images: { orderBy: { order: 'asc' } }, variants: true },
        })
      : Promise.resolve([]),
    remainingTake > 0
      ? prisma.product.findMany({
          where: {
            AND: [where, { variants: { none: { price: { not: null } } } }],
          },
          orderBy: { createdAt: 'desc' },
          skip: noPriceSkip,
          take: remainingTake,
          include: { images: { orderBy: { order: 'asc' } }, variants: true },
        })
      : Promise.resolve([]),
  ]);
  const order = new Map(productIds.map((id, index) => [id, index]));

  return [
    ...pricedProducts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)),
    ...noPriceProducts,
  ];
}
