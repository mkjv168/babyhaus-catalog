'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { CategoryPills } from './CategoryPills';
import { SortSelect, SortOption } from './SortSelect';
import { CompactProductCard } from './CompactProductCard';
import { Pagination } from './Pagination';
import { ProductQuickView } from './ProductQuickView';
import { FilterSidebar } from './FilterSidebar';

interface ProductImageData {
  id: string;
  url: string;
  order: number;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  stockStatus: string;
  stockQuantity: number;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  imageUrl: string | null;
  featured: boolean;
  createdAt: Date;
  images?: ProductImageData[];
  variants: ProductVariant[];
}

interface FacetValue {
  name: string;
  count: number;
}

interface CatalogFacets {
  brands: FacetValue[];
  categories: FacetValue[];
  price: {
    min: number;
    max: number;
  };
}

interface CatalogClientProps {
  products: Product[];
  featuredProducts: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  facets: CatalogFacets;
  lockedCategory?: string;
}

function parseBrands(value: string | null): string[] {
  return value
    ? value.split(',').map((brand) => brand.trim()).filter(Boolean)
    : [];
}

function isSortOption(value: string | null): value is SortOption {
  return value === 'newest' ||
    value === 'price-asc' ||
    value === 'price-desc' ||
    value === 'name-asc' ||
    value === 'name-desc';
}

function parseStock(value: string | null): string {
  return value === 'inStock' || value === 'outOfStock' ? value : '';
}

export function CatalogClient({
  products,
  featuredProducts,
  totalCount,
  totalPages,
  currentPage,
  facets,
  lockedCategory,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const activeCategory = lockedCategory ?? searchParams.get('category') ?? 'All';
  const selectedBrands = parseBrands(searchParams.get('brand'));
  const selectedStock = parseStock(searchParams.get('stock'));
  const sortParam = searchParams.get('sort');
  const sort: SortOption = isSortOption(sortParam) ? sortParam : 'newest';
  const focusField = searchParams.get('focus');
  const featuredOnly = searchParams.get('featured') === 'true';
  const categoryTotalCount = facets.categories.reduce((sum, category) => sum + category.count, 0);

  const selectedMinPrice = Number(searchParams.get('minPrice') ?? 0);
  const selectedMaxPrice = Number(searchParams.get('maxPrice') ?? facets.price.max);
  const priceRange: [number, number] = [
    Number.isFinite(selectedMinPrice) ? selectedMinPrice : 0,
    Number.isFinite(selectedMaxPrice) ? selectedMaxPrice : facets.price.max,
  ];

  const [searchQuery, setSearchQuery] = useState(q);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const pushParams = useCallback((updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All' || value === 'newest') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextQuery = searchQuery.trim();
      if (nextQuery === q) return;

      pushParams({ q: nextQuery || null, page: null });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [pushParams, q, searchQuery]);

  useEffect(() => {
    if (focusField === 'search') {
      const el = document.getElementById('catalog-search');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const input = el.querySelector('input');
        if (input) input.focus();
      }
    }
    if (focusField === 'categories') {
      const el = document.getElementById('catalog-categories');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focusField]);

  const handleCategoryChange = useCallback((category: string) => {
    pushParams({ category, page: null });
  }, [pushParams]);

  const handleBrandToggle = useCallback((brand: string) => {
    const nextBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((item) => item !== brand)
      : [...selectedBrands, brand];

    pushParams({ brand: nextBrands.length > 0 ? nextBrands.join(',') : null, page: null });
  }, [pushParams, selectedBrands]);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    pushParams({
      minPrice: range[0] > 0 ? range[0] : null,
      maxPrice: range[1] < facets.price.max ? range[1] : null,
      page: null,
    });
  }, [facets.price.max, pushParams]);

  const handleStockChange = useCallback((stock: string) => {
    pushParams({ stock: stock || null, page: null });
  }, [pushParams]);

  const handleSortChange = useCallback((value: SortOption) => {
    pushParams({ sort: value, page: null });
  }, [pushParams]);

  const handlePageChange = useCallback((page: number) => {
    pushParams({ page: page === 1 ? null : page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pushParams]);

  const handleClearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const removeBrand = useCallback((brand: string) => {
    const nextBrands = selectedBrands.filter((item) => item !== brand);
    pushParams({ brand: nextBrands.length > 0 ? nextBrands.join(',') : null, page: null });
  }, [pushParams, selectedBrands]);

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (q) activeChips.push({ key: 'q', label: `Search: ${q}`, onRemove: () => pushParams({ q: null, page: null }) });
  if (featuredOnly) activeChips.push({ key: 'featured', label: 'Featured', onRemove: () => pushParams({ featured: null, page: null }) });
  if (activeCategory !== 'All' && !lockedCategory) activeChips.push({ key: 'category', label: activeCategory, onRemove: () => pushParams({ category: null, page: null }) });
  selectedBrands.forEach((brand) => activeChips.push({ key: `brand-${brand}`, label: brand, onRemove: () => removeBrand(brand) }));
  if (priceRange[0] > 0 || priceRange[1] < facets.price.max) {
    activeChips.push({
      key: 'price',
      label: `$${priceRange[0]} - $${priceRange[1]}`,
      onRemove: () => pushParams({ minPrice: null, maxPrice: null, page: null }),
    });
  }
  if (selectedStock) {
    activeChips.push({
      key: 'stock',
      label: selectedStock === 'inStock' ? 'In stock' : 'Out of stock',
      onRemove: () => pushParams({ stock: null, page: null }),
    });
  }

  return (
    <div className="space-y-4">
      <div id="catalog-search">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          autoFocus={focusField === 'search'}
        />
      </div>

      {!lockedCategory && (
        <div id="catalog-categories">
          <CategoryPills
            categories={facets.categories}
            active={activeCategory}
            onSelect={handleCategoryChange}
            totalCount={categoryTotalCount}
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <FilterSidebar
          brands={facets.brands}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          selectedStock={selectedStock}
          onStockChange={handleStockChange}
          maxPrice={facets.price.max}
          onClearFilters={handleClearFilters}
          productCount={totalCount}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-[#6B6B6B]">
              <span className="font-semibold text-[#2D2D2D]">{totalCount}</span> product
              {totalCount !== 1 ? 's' : ''}
              {currentPage > 1 && ` • Page ${currentPage}`}
            </p>
            <SortSelect value={sort} onChange={handleSortChange} />
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0F5] text-[#FF6B9D] text-xs font-semibold hover:bg-[#FFE0EC] transition-colors"
                >
                  {chip.label}
                  <span aria-hidden="true">x</span>
                </button>
              ))}
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#F0E6DD] text-[#6B6B6B] text-xs font-semibold hover:border-[#FF6B9D] hover:text-[#FF6B9D] transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {totalCount === 0 ? (
            <div className="py-12">
              <div className="text-center text-[#6B6B6B] mb-8">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-base font-medium text-[#2D2D2D]">No products found</p>
                <p className="mt-1 text-sm">Can&apos;t find what you&apos;re looking for?</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`https://t.me/babyhaus_kh?text=${encodeURIComponent(`I'm looking for: ${q || searchQuery}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-[#FF6B9D] text-white text-sm font-semibold rounded-full hover:bg-[#E85A8A] transition-colors"
                  >
                    Ask us on Telegram
                  </a>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 border border-[#F0E6DD] bg-white text-[#6B6B6B] text-sm font-semibold rounded-full hover:border-[#FF6B9D] hover:text-[#FF6B9D] transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>

              {featuredProducts.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-[#2D2D2D] mb-3">Featured picks</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {featuredProducts.map((product) => (
                      <CompactProductCard
                        key={product.id}
                        product={product}
                        onQuickView={() => setQuickViewProduct(product)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {products.map((product) => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    onQuickView={() => setQuickViewProduct(product)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
