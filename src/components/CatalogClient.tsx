'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { CategoryPills } from './CategoryPills';
import { SortSelect, SortOption } from './SortSelect';
import { CompactProductCard } from './CompactProductCard';
import { Pagination } from './Pagination';
import { ProductQuickView } from './ProductQuickView';

interface ProductImageData {
  id: string;
  url: string;
  order: number;
}

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
  images?: ProductImageData[];
}

interface CatalogClientProps {
  products: Product[];
  categories: string[];
}

const PRODUCTS_PER_PAGE_MOBILE = 12;
const PRODUCTS_PER_PAGE_DESKTOP = 20;

export function CatalogClient({ products, categories }: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get('category') || 'All';
  const urlSort = (searchParams.get('sort') as SortOption) || 'newest';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const focusField = searchParams.get('focus');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sort, setSort] = useState<SortOption>(urlSort);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [isMobile, setIsMobile] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync URL params
  const updateUrl = useCallback((updates: Partial<{
    category: string;
    sort: SortOption;
    page: number;
  }>) => {
    const params = new URLSearchParams();
    
    const newCategory = updates.category ?? activeCategory;
    const newSort = updates.sort ?? sort;
    const newPage = updates.page ?? currentPage;
    
    if (newCategory !== 'All') params.set('category', newCategory);
    if (newSort !== 'newest') params.set('sort', newSort);
    if (newPage !== 1) params.set('page', newPage.toString());
    
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : '/', { scroll: false });
  }, [router, activeCategory, sort, currentPage]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    updateUrl({ category, page: 1 });
  }, [updateUrl]);

  const handleSortChange = useCallback((value: SortOption) => {
    setSort(value);
    updateUrl({ sort: value });
  }, [updateUrl]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateUrl({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl]);

  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const handleCloseQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
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

    // Sorting
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

  // Pagination
  const productsPerPage = isMobile ? PRODUCTS_PER_PAGE_MOBILE : PRODUCTS_PER_PAGE_DESKTOP;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      updateUrl({ page: 1 });
    }
  }, [currentPage, totalPages, updateUrl]);

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

      <div className="flex-1">
        {/* Results header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-sm text-[#6B6B6B]">
            <span className="font-semibold text-[#2D2D2D]">{filteredProducts.length}</span> product
            {filteredProducts.length !== 1 ? 's' : ''}
            {currentPage > 1 && ` • Page ${currentPage}`}
          </p>
          <SortSelect value={sort} onChange={handleSortChange} />
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-[#6B6B6B]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-base font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or category filter</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {paginatedProducts.map((product) => (
                <CompactProductCard
                  key={product.id}
                  product={product}
                  onQuickView={() => handleQuickView(product)}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Mobile Quick View Sheet */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={handleCloseQuickView}
      />
    </div>
  );
}
