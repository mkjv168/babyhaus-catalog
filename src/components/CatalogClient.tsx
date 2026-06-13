'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { CategoryPills } from './CategoryPills';
import { SortSelect, SortOption } from './SortSelect';
import { CompactProductCard } from './CompactProductCard';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  sku: string | null;
  stockStatus: string;
  featured: boolean;
  createdAt: Date;
}

interface CatalogClientProps {
  products: Product[];
  categories: string[];
}

export function CatalogClient({ products, categories }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get('category') || 'All';
  const urlSort = (searchParams.get('sort') as SortOption) || 'newest';
  const focusField = searchParams.get('focus');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sort, setSort] = useState<SortOption>(urlSort);

  // Sync URL params
  const updateUrl = useCallback(
    (category: string, sortValue: SortOption) => {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (sortValue !== 'newest') params.set('sort', sortValue);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
    },
    [router]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setActiveCategory(category);
      updateUrl(category, sort);
    },
    [sort, updateUrl]
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSort(value);
      updateUrl(activeCategory, value);
    },
    [activeCategory, updateUrl]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sort]);

  // Focus search if URL param says so
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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div id="catalog-search">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          autoFocus={focusField === 'search'}
        />
      </div>

      {/* Category Pills */}
      <div id="catalog-categories">
        <CategoryPills
          categories={categories}
          active={activeCategory}
          onSelect={handleCategoryChange}
        />
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#7a7a7a]">
          <span className="font-semibold text-[#2d2d2d]">{filteredProducts.length}</span> product
          {filteredProducts.length !== 1 ? 's' : ''}
        </p>
        <SortSelect value={sort} onChange={handleSortChange} />
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-[#7a7a7a]">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-base font-medium">No products found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <CompactProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
