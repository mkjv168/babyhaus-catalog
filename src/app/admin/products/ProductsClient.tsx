'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Search, LayoutGrid, List, Filter, FileSpreadsheet } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import DeleteButton from './DeleteButton';
import EditModal from './EditModal';
import ImportModal from './ImportModal';

interface ProductImage {
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
  stockQuantity: number;
  featured: boolean;
  images: ProductImage[];
}

interface ProductsClientProps {
  products: Product[];
  categories: string[];
}

type ViewMode = 'table' | 'grid';
type StockFilter = 'all' | 'instock' | 'outofstock' | 'preorder';

const PRODUCTS_PER_PAGE = 12;

const stockOptions: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'All Stock' },
  { value: 'instock', label: 'In Stock' },
  { value: 'outofstock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Pre-Order' },
];

export default function ProductsClient({ products, categories }: ProductsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryFilter !== 'All') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (stockFilter !== 'all') {
      result = result.filter((p) => p.stockStatus === stockFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, categoryFilter, stockFilter, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (setter: (v: any) => void) => (value: any) => {
    setter(value);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const openImport = () => setIsImportOpen(true);
  const closeImport = () => setIsImportOpen(false);

  const handleSuccess = () => {
    closeModal();
    setSelectedIds(new Set());
    router.refresh();
  };

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} products? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await fetch('/api/products/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      setSelectedIds(new Set());
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkFeature = async (featured: boolean) => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await fetch('/api/products/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, featured }),
      });
      setSelectedIds(new Set());
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  const stockLabel = (status: string) => {
    if (status === 'instock') return 'In Stock';
    if (status === 'preorder') return 'Pre-Order';
    return 'Out of Stock';
  };

  const stockClass = (status: string) => {
    if (status === 'instock') return 'bg-green-50 text-green-600';
    if (status === 'preorder') return 'bg-amber-50 text-amber-600';
    return 'bg-red-50 text-red-600';
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white border border-[#e8e4df] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-[#f5f1ec] text-[#d4a574]' : 'text-[#7a7a7a] hover:text-[#d4a574]'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#f5f1ec] text-[#d4a574]' : 'text-[#7a7a7a] hover:text-[#d4a574]'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={openImport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a7a]" />
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery)(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4df] rounded-xl text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#e8e4df] rounded-full text-xs font-semibold text-[#7a7a7a] focus:border-[#d4a574] focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {/* Stock filter */}
          {stockOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(setStockFilter)(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                stockFilter === opt.value
                  ? 'bg-[#2d2d2d] text-white'
                  : 'bg-white border border-[#e8e4df] text-[#7a7a7a] hover:border-[#d4a574] hover:text-[#d4a574]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results counter */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#7a7a7a]">
          <span className="font-semibold text-[#2d2d2d]">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''}
          {selectedIds.size > 0 && (
            <span className="ml-2 text-[#d4a574]">• {selectedIds.size} selected</span>
          )}
        </p>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-[#f5f1ec] rounded-xl border border-[#e8e4df]">
          <span className="text-sm font-semibold text-[#2d2d2d]">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={() => handleBulkFeature(true)}
            disabled={bulkLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50"
          >
            Feature
          </button>
          <button
            onClick={() => handleBulkFeature(false)}
            disabled={bulkLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50"
          >
            Unfeature
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-500 border border-red-100 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e8e4df] text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
                  <th className="pb-3 pt-4 px-4">
                    <input
                      type="checkbox"
                      checked={paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.id))}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#d4a574] rounded"
                    />
                  </th>
                  <th className="pb-3 pt-4 px-2">Image</th>
                  <th className="pb-3 pt-4 pr-4">Name</th>
                  <th className="pb-3 pt-4 pr-4">Brand</th>
                  <th className="pb-3 pt-4 pr-4">Category</th>
                  <th className="pb-3 pt-4 pr-4">Price</th>
                  <th className="pb-3 pt-4 pr-4">Stock</th>
                  <th className="pb-3 pt-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="border-b border-[#e8e4df]/60 hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 accent-[#d4a574] rounded"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="w-12 h-12 relative bg-[#f5f1ec] rounded-xl overflow-hidden">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        ) : (
                          <span className="text-lg flex items-center justify-center h-full">👶</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold">
                      {p.name}
                      {p.featured && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-[#d4a574] text-white px-1.5 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-[#7a7a7a]">{p.brand || '-'}</td>
                    <td className="py-3 pr-4 text-[#7a7a7a]">{p.category}</td>
                    <td className="py-3 pr-4 text-[#d4a574] font-semibold">
                      {p.price ? `$${p.price.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stockClass(p.stockStatus)}`}>
                        {stockLabel(p.stockStatus)}
                      </span>
                      {p.stockQuantity > 0 && p.stockQuantity <= 5 && p.stockStatus === 'instock' && (
                        <span className="ml-1 text-[10px] font-bold text-red-500">({p.stockQuantity})</span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-sm text-[#d4a574] hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <DeleteButton id={p.id} onDelete={handleSuccess} />
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7a7a7a]">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {paginatedProducts.map((p) => (
            <div
              key={p.id}
              className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-md relative ${
                selectedIds.has(p.id) ? 'border-[#d4a574] ring-2 ring-[#d4a574]/20' : 'border-[#e8e4df]'
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="w-4 h-4 accent-[#d4a574] rounded"
                />
              </div>
              {/* Image */}
              <div className="relative aspect-square bg-[#f5f1ec]">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                ) : (
                  <span className="text-4xl flex items-center justify-center h-full">👶</span>
                )}
                {p.featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-[#d4a574] text-white rounded-full">
                    Featured
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-[#d4a574] text-[10px] font-bold tracking-wide uppercase mb-1">
                  {p.brand || p.category}
                </p>
                <h3 className="text-sm font-bold text-[#2d2d2d] line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[#d4a574] font-bold text-sm">
                    {p.price ? `$${p.price.toFixed(2)}` : 'Ask'}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stockClass(p.stockStatus)}`}>
                    {stockLabel(p.stockStatus)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 text-xs font-semibold py-1.5 bg-[#f5f1ec] text-[#d4a574] rounded-full hover:bg-[#ede0d1] transition-colors"
                  >
                    Edit
                  </button>
                  <DeleteButton id={p.id} onDelete={handleSuccess} />
                </div>
              </div>
            </div>
          ))}
          {paginatedProducts.length === 0 && (
            <div className="col-span-full text-center py-16 text-[#7a7a7a]">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-base font-medium">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Modal */}
      <EditModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
      <ImportModal
        isOpen={isImportOpen}
        onClose={closeImport}
        onSuccess={handleSuccess}
      />
    </>
  );
}
