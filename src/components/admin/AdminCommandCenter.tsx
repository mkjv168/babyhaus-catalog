'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package, ShoppingBag, ImageIcon, FileSpreadsheet,
  Search, ChevronRight, Edit3, Trash2, Plus,
  Check, X, AlertTriangle, Star, Filter, XCircle
} from 'lucide-react';
import AdminBannerSection from '@/components/AdminBannerSection';
import ImportModal from '@/app/admin/products/ImportModal';
import EditModal from '@/app/admin/products/EditModal';
import ProductForm from '@/app/admin/products/ProductForm';

// ─── Types ───────────────────────────────────────────────────────────

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

interface Order {
  id: string;
  productId: string;
  quantity: number;
  customerName: string;
  telegramPhone: string;
  deliveryAddress: string | null;
  paymentMethod: string;
  notes: string | null;
  status: string;
  createdAt: string;
  product: { name: string } | null;
}

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  order: number;
  active: boolean;
}

interface AdminCommandCenterProps {
  products: Product[];
  orders: Order[];
  banners: Banner[];
  categories: string[];
  user: string;
}

type Tab = 'products' | 'orders' | 'banners' | 'bulk';
type StockFilter = 'all' | 'instock' | 'outofstock' | 'preorder' | 'lowstock';

// ─── Helpers ─────────────────────────────────────────────────────────

const stockDot = (status: string, qty: number) => {
  if (status === 'outofstock') return 'bg-red-500';
  if (status === 'preorder') return 'bg-amber-400';
  if (qty > 0 && qty <= 5) return 'bg-orange-400';
  return 'bg-emerald-500';
};

const stockLabel = (status: string) => {
  if (status === 'instock') return 'In Stock';
  if (status === 'preorder') return 'Pre-Order';
  return 'Out of Stock';
};

const stockBadgeClass = (status: string) => {
  if (status === 'instock') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'preorder') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-red-50 text-red-700 border-red-100';
};

const formatPrice = (price: number | null) =>
  price ? `$${price.toFixed(2)}` : '—';

// ─── Component ───────────────────────────────────────────────────────

export default function AdminCommandCenter({
  products,
  orders,
  banners,
  categories,
  user,
}: AdminCommandCenterProps) {
  const router = useRouter();

  // ─ Tabs
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // ─ Products: filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  // ─ Products: selection
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ─ Modals
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // ─ Mobile overlays
  const [showMobileInspector, setShowMobileInspector] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ─ Desktop inline editing
  const [isEditing, setIsEditing] = useState(false);

  // ─ Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // ─ Sort
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc'>('name');

  // ─ Derived
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (categoryFilter !== 'All') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (stockFilter !== 'all') {
      if (stockFilter === 'lowstock') {
        result = result.filter(
          (p) => p.stockStatus === 'instock' && p.stockQuantity > 0 && p.stockQuantity <= 5
        );
      } else {
        result = result.filter((p) => p.stockStatus === stockFilter);
      }
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

    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price_asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price_desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'stock_asc') result.sort((a, b) => a.stockQuantity - b.stockQuantity);
    else if (sortBy === 'stock_desc') result.sort((a, b) => b.stockQuantity - a.stockQuantity);

    return result;
  }, [products, categoryFilter, stockFilter, searchQuery, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const allProductImages = useCallback((p: Product) => {
    const urls: string[] = [];
    if (p.imageUrl) urls.push(p.imageUrl);
    p.images
      .sort((a, b) => a.order - b.order)
      .forEach((img) => {
        if (!urls.includes(img.url)) urls.push(img.url);
      });
    return urls;
  }, []);

  // ─ Handlers
  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    setIsEditing(false);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowMobileInspector(true);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
      if (selectedProductId && ids.includes(selectedProductId)) {
        setSelectedProductId(null);
      }
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

  const openEdit = (product: Product | null) => {
    setEditProduct(product);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setTimeout(() => setEditProduct(null), 300);
  };

  const handleSuccess = () => {
    closeEdit();
    setSelectedIds(new Set());
    router.refresh();
  };

  // ─ Tabs config
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'banners', label: 'Banners', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'bulk', label: 'Bulk Uploads', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col bg-[#faf8f5] text-[#2d2d2d] overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-[#e8e4df] shrink-0">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-[#d4a574]">Baby</span>Haus{' '}
              <span className="text-[#7a7a7a] font-medium">Admin</span>
            </h1>
            {/* Tab pills */}
            <nav className="hidden sm:flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === t.key
                      ? 'bg-[#2d2d2d] text-white'
                      : 'text-[#7a7a7a] hover:text-[#d4a574] hover:bg-[#f5f1ec]'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7a7a7a] hidden sm:inline">
              Signed in as <span className="text-[#d4a574] font-semibold">{user}</span>
            </span>
          </div>
        </div>
        {/* Mobile tab bar */}
        <div className="sm:hidden flex overflow-x-auto px-4 pb-2 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.key
                  ? 'bg-[#2d2d2d] text-white'
                  : 'text-[#7a7a7a] hover:text-[#d4a574] hover:bg-[#f5f1ec]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content Area ── */}
      <main className="flex-1 overflow-hidden">
        {/* ═══════════════════════════════════════════════════════════
            PRODUCTS TAB — Three-Column Command Center
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <>
            {/* ═══════════════════════════════════════════════════════════
                DESKTOP — Three-Column Command Center
               ═══════════════════════════════════════════════════════════ */}
            <div className="h-full hidden md:flex">
              {/* ── Column 1: Category & Filter Hub ── */}
              <aside className="w-[240px] min-w-[200px] bg-white border-r border-[#e8e4df] flex flex-col">
                <div className="p-4 border-b border-[#e8e4df]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a7a7a]" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#e8e4df] rounded-lg text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-3">Categories</h3>
                    <div className="space-y-1">
                      <button onClick={() => setCategoryFilter('All')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === 'All' ? 'bg-[#d4a574] text-white' : 'hover:bg-[#f5f1ec] text-[#2d2d2d]'}`}>
                        <span className="font-medium">All Products</span>
                        <span className={`text-xs font-semibold ${categoryFilter === 'All' ? 'text-white/80' : 'text-[#7a7a7a]'}`}>{products.length}</span>
                      </button>
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === cat ? 'bg-[#d4a574] text-white' : 'hover:bg-[#f5f1ec] text-[#2d2d2d]'}`}>
                          <span className="font-medium truncate">{cat}</span>
                          <span className={`text-xs font-semibold ${categoryFilter === cat ? 'text-white/80' : 'text-[#7a7a7a]'}`}>{categoryCounts[cat] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-3">Stock Status</h3>
                    <div className="space-y-1">
                      {([
                        { key: 'all' as StockFilter, label: 'All Stock', dotClass: 'bg-[#7a7a7a]' },
                        { key: 'instock' as StockFilter, label: 'In Stock', dotClass: 'bg-emerald-500' },
                        { key: 'lowstock' as StockFilter, label: 'Low Stock', dotClass: 'bg-orange-400' },
                        { key: 'outofstock' as StockFilter, label: 'Out of Stock', dotClass: 'bg-red-500' },
                        { key: 'preorder' as StockFilter, label: 'Pre-Order', dotClass: 'bg-amber-400' },
                      ]).map((f) => (
                        <button key={f.key} onClick={() => setStockFilter(f.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${stockFilter === f.key ? 'bg-[#f5f1ec] text-[#d4a574] font-semibold' : 'hover:bg-[#f5f1ec]/50 text-[#2d2d2d]'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${f.dotClass}`} />
                          <span>{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* ── Column 2: Product Stream ── */}
              <div className="w-[380px] min-w-[320px] bg-[#faf8f5] border-r border-[#e8e4df] flex flex-col">
                <div className="px-4 py-3 border-b border-[#e8e4df] bg-white flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{filteredProducts.length} products</p>
                    {selectedIds.size > 0 && <p className="text-xs text-[#d4a574] font-medium">{selectedIds.size} selected</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs bg-white border border-[#e8e4df] rounded-lg px-2 py-1.5 focus:border-[#d4a574] focus:outline-none"
                    >
                      <option value="name">Name A–Z</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="stock_asc">Stock: Low to High</option>
                      <option value="stock_desc">Stock: High to Low</option>
                    </select>
                    <button onClick={() => openEdit(null)} className="flex items-center gap-1 px-3 py-1.5 bg-[#d4a574] text-white text-xs font-semibold rounded-full hover:bg-[#c49464] transition-colors"><Plus className="w-3.5 h-3.5" />Add</button>
                  </div>
                </div>
                {selectedIds.size > 0 && (
                  <div className="px-4 py-2 bg-[#f5f1ec] border-b border-[#e8e4df] flex items-center gap-2">
                    <button onClick={() => handleBulkFeature(true)} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50">Feature</button>
                    <button onClick={() => handleBulkFeature(false)} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50">Unfeature</button>
                    <button onClick={handleBulkDelete} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50">Delete</button>
                    <div className="flex-1" />
                    <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-[#e8e4df] rounded transition-colors"><X className="w-3.5 h-3.5 text-[#7a7a7a]" /></button>
                  </div>
                )}
                {(searchQuery || categoryFilter !== 'All' || stockFilter !== 'all') && (
                  <div className="px-4 py-2 bg-white border-b border-[#e8e4df] flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#7a7a7a] font-semibold uppercase">Filters:</span>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f1ec] text-[#2d2d2d] text-[10px] font-medium rounded-full hover:bg-[#e8e4df] transition-colors">
                        <X className="w-3 h-3" /> Search: &quot;{searchQuery}&quot;
                      </button>
                    )}
                    {categoryFilter !== 'All' && (
                      <button onClick={() => setCategoryFilter('All')} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f1ec] text-[#2d2d2d] text-[10px] font-medium rounded-full hover:bg-[#e8e4df] transition-colors">
                        <X className="w-3 h-3" /> Category: {categoryFilter}
                      </button>
                    )}
                    {stockFilter !== 'all' && (
                      <button onClick={() => setStockFilter('all')} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f1ec] text-[#2d2d2d] text-[10px] font-medium rounded-full hover:bg-[#e8e4df] transition-colors">
                        <X className="w-3 h-3" /> Stock: {stockLabel(stockFilter)}
                      </button>
                    )}
                    <button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStockFilter('all'); }} className="text-[10px] text-[#d4a574] font-semibold hover:underline ml-auto">Clear all</button>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <div key={p.id} onClick={() => handleSelectProduct(p.id)} className={`group flex items-center gap-3 px-4 py-2.5 border-b border-[#e8e4df]/50 cursor-pointer transition-all duration-150 ${selectedProductId === p.id ? 'bg-white shadow-sm ring-1 ring-[#d4a574]/20' : 'hover:bg-white/60'}`}>
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(p.id); }} className="w-4 h-4 accent-[#d4a574] rounded shrink-0 cursor-pointer" />
                      <div className="w-9 h-9 relative bg-[#f5f1ec] rounded-lg overflow-hidden shrink-0 border border-[#e8e4df]/60">{p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" /> : <span className="text-xs flex items-center justify-center h-full text-[#7a7a7a]">👶</span>}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-[#2d2d2d] truncate">{p.name}</p>
                          {p.featured && <Star className="w-3 h-3 text-[#d4a574] fill-[#d4a574] shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0">
                          <span className="text-[10px] text-[#7a7a7a]">{p.category}</span>
                          <span className="text-[10px] text-[#d4a574] font-semibold">{formatPrice(p.price)}</span>
                          {p.stockQuantity > 0 && p.stockQuantity <= 5 && p.stockStatus === 'instock' && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0 rounded-full">{p.stockQuantity} left</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#faf8f5] border border-[#e8e4df]/60">
                          <span className={`w-2 h-2 rounded-full ${stockDot(p.stockStatus, p.stockQuantity)}`} />
                          <span className="text-[10px] font-medium text-[#7a7a7a]">{stockLabel(p.stockStatus)}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-[#7a7a7a] shrink-0 transition-all duration-150 ${selectedProductId === p.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      {searchQuery || categoryFilter !== 'All' || stockFilter !== 'all' ? (
                        <>
                          <div className="w-16 h-16 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
                            <Search className="w-7 h-7 text-[#d4a574]" />
                          </div>
                          <p className="text-sm font-semibold text-[#2d2d2d] mb-1">No matching products</p>
                          <p className="text-xs text-[#7a7a7a] mb-4">Try adjusting your search or filters</p>
                          <button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStockFilter('all'); }} className="px-4 py-2 bg-white border border-[#e8e4df] text-xs font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors">Clear all filters</button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
                            <Package className="w-7 h-7 text-[#d4a574]" />
                          </div>
                          <p className="text-sm font-semibold text-[#2d2d2d] mb-1">No products yet</p>
                          <p className="text-xs text-[#7a7a7a] mb-4">Add your first product to get started</p>
                          <button onClick={() => openEdit(null)} className="px-4 py-2 bg-[#d4a574] text-white text-xs font-semibold rounded-full hover:bg-[#c49464] transition-colors">Add Product</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Column 3: Product Inspector ── */}
              <div className="flex-1 bg-white flex flex-col min-w-0">
                {selectedProduct ? (
                  <>
                    <div className="px-6 py-4 border-b border-[#e8e4df] flex items-center justify-between">
                      {isEditing ? (
                        <h2 className="text-lg font-bold">Edit Product</h2>
                      ) : (
                        <div><h2 className="text-lg font-bold">{selectedProduct.name}</h2><p className="text-xs text-[#7a7a7a]">{selectedProduct.category}{selectedProduct.brand ? ` • ${selectedProduct.brand}` : ''}</p></div>
                      )}
                      <div className="flex items-center gap-2">
                        {!isEditing && (
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#d4a574] text-white text-sm font-semibold rounded-full hover:bg-[#c49464] transition-colors"><Edit3 className="w-3.5 h-3.5" />Edit</button>
                        )}
                        <button onClick={() => { if (confirm('Delete this product?')) { fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' }).then(() => { setSelectedProductId(null); setIsEditing(false); router.refresh(); }); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {isEditing ? (
                        <ProductForm
                          initial={{
                            name: selectedProduct.name,
                            brand: selectedProduct.brand || '',
                            category: selectedProduct.category,
                            description: selectedProduct.description || '',
                            price: selectedProduct.price?.toString() || '',
                            images: (() => {
                              const urls: string[] = [];
                              if (selectedProduct.imageUrl) urls.push(selectedProduct.imageUrl);
                              selectedProduct.images
                                .sort((a, b) => a.order - b.order)
                                .forEach((img) => { if (!urls.includes(img.url)) urls.push(img.url); });
                              return urls;
                            })(),
                            sku: selectedProduct.sku || '',
                            stockStatus: selectedProduct.stockStatus,
                            stockQuantity: selectedProduct.stockQuantity?.toString() || '0',
                            featured: selectedProduct.featured,
                          }}
                          productId={selectedProduct.id}
                          onSuccess={() => { setIsEditing(false); setSelectedIds(new Set()); router.refresh(); }}
                          onCancel={() => setIsEditing(false)}
                        />
                      ) : (
                        <>
                          <div>
                            {(() => { const imgs = allProductImages(selectedProduct); return imgs.length > 0 ? (
                              <div className="space-y-3">
                                <div className="relative aspect-[16/9] max-h-[180px] bg-[#f5f1ec] rounded-2xl overflow-hidden"><Image src={imgs[0]} alt={selectedProduct.name} fill className="object-cover" /></div>
                                {imgs.length > 1 && <div className="flex gap-2">{imgs.map((url, i) => (<div key={i} className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === 0 ? 'border-[#d4a574]' : 'border-transparent'}`}><Image src={url} alt="" fill className="object-cover" /></div>))}</div>}
                                <p className="text-xs text-[#7a7a7a]">{imgs.length} image{imgs.length !== 1 ? 's' : ''}</p>
                              </div>
                            ) : (<div className="flex flex-col items-center justify-center py-8 text-[#7a7a7a] bg-[#faf8f5] rounded-xl"><p className="text-3xl mb-2">👶</p><p className="text-sm font-medium">No images</p></div>); })()}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#faf8f5] rounded-xl p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Price</p><p className="text-2xl font-bold text-[#d4a574]">{formatPrice(selectedProduct.price)}</p></div>
                            <div className="bg-[#faf8f5] rounded-xl p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">SKU</p><p className="text-lg font-semibold">{selectedProduct.sku || '—'}</p></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${stockBadgeClass(selectedProduct.stockStatus)}`}><span className={`w-2 h-2 rounded-full ${stockDot(selectedProduct.stockStatus, selectedProduct.stockQuantity)}`} /> {stockLabel(selectedProduct.stockStatus)}</span>
                            {selectedProduct.featured && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#d4a574] text-white"><Star className="w-3 h-3 fill-white" /> Featured</span>}
                            {selectedProduct.stockQuantity > 0 && selectedProduct.stockQuantity <= 5 && selectedProduct.stockStatus === 'instock' && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100"><AlertTriangle className="w-3 h-3" /> Only {selectedProduct.stockQuantity} left</span>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Stock Status</p>
                              <div className="flex items-center justify-center gap-2 mt-1">
                                <span className={`w-3 h-3 rounded-full ${stockDot(selectedProduct.stockStatus, selectedProduct.stockQuantity)}`} />
                                <p className="text-lg font-bold">{stockLabel(selectedProduct.stockStatus)}</p>
                              </div>
                            </div>
                            <div className="bg-[#faf8f5] rounded-xl p-4 text-center">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Quantity</p>
                              <p className={`text-3xl font-bold ${selectedProduct.stockQuantity <= 5 && selectedProduct.stockQuantity > 0 ? 'text-orange-500' : 'text-[#2d2d2d]'}`}>{selectedProduct.stockQuantity}</p>
                              <p className="text-xs text-[#7a7a7a] mt-1">units</p>
                            </div>
                          </div>
                          {selectedProduct.stockQuantity > 0 && selectedProduct.stockQuantity <= 5 && selectedProduct.stockStatus === 'instock' && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><div><p className="text-sm font-semibold text-orange-600">Low Stock Warning</p><p className="text-xs text-orange-500 mt-1">Only {selectedProduct.stockQuantity} units remaining. Consider restocking soon.</p></div></div>
                          )}
                          {selectedProduct.stockStatus === 'outofstock' && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><div><p className="text-sm font-semibold text-red-600">Out of Stock</p><p className="text-xs text-red-500 mt-1">This product is currently unavailable for purchase.</p></div></div>
                          )}
                          <div><h4 className="text-sm font-bold mb-2">Description</h4><p className="text-sm text-[#7a7a7a] leading-relaxed bg-[#faf8f5] rounded-xl p-4">{selectedProduct.description || 'No description provided.'}</p></div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Brand</p><p className="font-medium">{selectedProduct.brand || '—'}</p></div>
                            <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Category</p><p className="font-medium">{selectedProduct.category}</p></div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold">Overview</h2>
                      <p className="text-xs text-[#7a7a7a] mt-1">Inventory at a glance</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#faf8f5] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a]">Total Products</span>
                          <Package className="w-4 h-4 text-[#d4a574]" />
                        </div>
                        <p className="text-3xl font-bold text-[#2d2d2d]">{products.length}</p>
                      </div>
                      <div className="bg-[#faf8f5] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a]">Featured</span>
                          <Star className="w-4 h-4 text-[#d4a574]" />
                        </div>
                        <p className="text-3xl font-bold text-[#2d2d2d]">{products.filter((p) => p.featured).length}</p>
                      </div>
                      <div className="bg-[#faf8f5] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a]">Low Stock</span>
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-3xl font-bold text-orange-500">
                          {products.filter((p) => p.stockStatus === 'instock' && p.stockQuantity > 0 && p.stockQuantity <= 5).length}
                        </p>
                      </div>
                      <div className="bg-[#faf8f5] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a]">Out of Stock</span>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-3xl font-bold text-red-500">
                          {products.filter((p) => p.stockStatus === 'outofstock').length}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                MOBILE — Single Column + Bottom Sheets
               ═══════════════════════════════════════════════════════════ */}
            <div className="h-full flex flex-col md:hidden bg-[#faf8f5]">
              {/* Mobile toolbar */}
              <div className="px-4 py-3 bg-white border-b border-[#e8e4df] flex items-center gap-2">
                <button onClick={() => setShowMobileFilters(true)} className="flex items-center gap-1 px-3 py-2 bg-[#f5f1ec] text-[#2d2d2d] text-xs font-semibold rounded-full hover:bg-[#e8e4df] transition-colors">
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a7a7a]" />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#e8e4df] rounded-lg text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none transition-all" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-[11px] bg-white border border-[#e8e4df] rounded-lg px-2 py-2 focus:border-[#d4a574] focus:outline-none shrink-0"
                >
                  <option value="name">A–Z</option>
                  <option value="price_asc">$ ↑</option>
                  <option value="price_desc">$ ↓</option>
                  <option value="stock_asc">Qty ↑</option>
                  <option value="stock_desc">Qty ↓</option>
                </select>
                <button onClick={() => openEdit(null)} className="flex items-center gap-1 px-3 py-2 bg-[#d4a574] text-white text-xs font-semibold rounded-full hover:bg-[#c49464] transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>

              {/* Active filter chips */}
              {(searchQuery || categoryFilter !== 'All' || stockFilter !== 'all') && (
                <div className="px-4 py-2 bg-white border-b border-[#e8e4df] flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-[#7a7a7a] font-semibold uppercase">Filters:</span>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f1ec] text-[#2d2d2d] text-[10px] font-medium rounded-full hover:bg-[#e8e4df] transition-colors">
                      <X className="w-3 h-3" /> Search: &quot;{searchQuery}&quot;
                    </button>
                  )}
                  {categoryFilter !== 'All' && (
                    <button onClick={() => setCategoryFilter('All')} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f1ec] text-[#2d2d2d] text-[10px] font-medium rounded-full hover:bg-[#e8e4df] transition-colors">
                      <X className="w-3 h-3" /> {categoryFilter}
                    </button>
                  )}
                  {stockFilter !== 'all' && (
                    <button onClick={() => setStockFilter('all')} className="inline-flex items-center gap-1 px-2 py-1 bg-[#f5f1ec] text-[#2d2d2d] text-[10px] font-medium rounded-full hover:bg-[#e8e4df] transition-colors">
                      <X className="w-3 h-3" /> {stockLabel(stockFilter)}
                    </button>
                  )}
                  <button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStockFilter('all'); }} className="text-[10px] text-[#d4a574] font-semibold hover:underline ml-auto">Clear all</button>
                </div>
              )}

              {/* Bulk actions */}
              {selectedIds.size > 0 && (
                <div className="px-4 py-2 bg-[#f5f1ec] border-b border-[#e8e4df] flex items-center gap-2">
                  <button onClick={() => handleBulkFeature(true)} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50">Feature</button>
                  <button onClick={() => handleBulkFeature(false)} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50">Unfeature</button>
                  <button onClick={handleBulkDelete} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50">Delete</button>
                  <div className="flex-1" />
                  <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-[#e8e4df] rounded transition-colors"><X className="w-3.5 h-3.5 text-[#7a7a7a]" /></button>
                </div>
              )}

              {/* Mobile product list */}
              <div className="flex-1 overflow-y-auto">
                <p className="px-4 py-2 text-xs font-semibold text-[#7a7a7a]">{filteredProducts.length} products</p>
                {filteredProducts.map((p) => (
                  <div key={p.id} onClick={() => handleSelectProduct(p.id)} className={`group flex items-center gap-3 px-4 py-2.5 border-b border-[#e8e4df]/50 cursor-pointer transition-all duration-150 ${selectedProductId === p.id ? 'bg-white shadow-sm ring-1 ring-[#d4a574]/20' : 'hover:bg-white/60'}`}>
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(p.id); }} className="w-4 h-4 accent-[#d4a574] rounded shrink-0 cursor-pointer" />
                    <div className="w-9 h-9 relative bg-[#f5f1ec] rounded-lg overflow-hidden shrink-0 border border-[#e8e4df]/60">{p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" /> : <span className="text-xs flex items-center justify-center h-full text-[#7a7a7a]">👶</span>}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-[#2d2d2d] truncate">{p.name}</p>
                        {p.featured && <Star className="w-3 h-3 text-[#d4a574] fill-[#d4a574] shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0">
                        <span className="text-[10px] text-[#7a7a7a]">{p.category}</span>
                        <span className="text-[10px] text-[#d4a574] font-semibold">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#faf8f5] border border-[#e8e4df]/60">
                        <span className={`w-2 h-2 rounded-full ${stockDot(p.stockStatus, p.stockQuantity)}`} />
                        <span className="text-[10px] font-medium text-[#7a7a7a]">{stockLabel(p.stockStatus)}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#7a7a7a] shrink-0" />
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    {searchQuery || categoryFilter !== 'All' || stockFilter !== 'all' ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
                          <Search className="w-7 h-7 text-[#d4a574]" />
                        </div>
                        <p className="text-sm font-semibold text-[#2d2d2d] mb-1">No matching products</p>
                        <p className="text-xs text-[#7a7a7a] mb-4">Try adjusting your search or filters</p>
                        <button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStockFilter('all'); }} className="px-4 py-2 bg-white border border-[#e8e4df] text-xs font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors">Clear all filters</button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
                          <Package className="w-7 h-7 text-[#d4a574]" />
                        </div>
                        <p className="text-sm font-semibold text-[#2d2d2d] mb-1">No products yet</p>
                        <p className="text-xs text-[#7a7a7a] mb-4">Add your first product to get started</p>
                        <button onClick={() => openEdit(null)} className="px-4 py-2 bg-[#d4a574] text-white text-xs font-semibold rounded-full hover:bg-[#c49464] transition-colors">Add Product</button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Inspector Bottom Sheet */}
              {showMobileInspector && selectedProduct && (
                <div className="fixed inset-0 z-50">
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowMobileInspector(false)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
                    <div className="sticky top-0 bg-white border-b border-[#e8e4df] px-4 py-3 flex items-center justify-between z-10">
                      <div><h2 className="text-base font-bold">{selectedProduct.name}</h2><p className="text-xs text-[#7a7a7a]">{selectedProduct.category}{selectedProduct.brand ? ` • ${selectedProduct.brand}` : ''}</p></div>
                      <button onClick={() => setShowMobileInspector(false)} className="p-2 rounded-full hover:bg-[#f5f1ec] transition-colors"><X className="w-5 h-5 text-[#7a7a7a]" /></button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setShowMobileInspector(false); openEdit(selectedProduct); }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#d4a574] text-white text-sm font-semibold rounded-full hover:bg-[#c49464] transition-colors"><Edit3 className="w-3.5 h-3.5" />Edit Product</button>
                        <button onClick={() => { if (confirm('Delete this product?')) { fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' }).then(() => { setSelectedProductId(null); setShowMobileInspector(false); router.refresh(); }); } }} className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div>
                        {(() => { const imgs = allProductImages(selectedProduct); return imgs.length > 0 ? (
                          <div className="space-y-2">
                            <div className="relative aspect-[16/9] max-h-[160px] bg-[#f5f1ec] rounded-xl overflow-hidden cursor-pointer" onClick={() => setLightboxImage(imgs[0])}><Image src={imgs[0]} alt={selectedProduct.name} fill className="object-cover" /></div>
                            {imgs.length > 1 && <div className="flex gap-2">{imgs.map((url, i) => (<div key={i} className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${i === 0 ? 'border-[#d4a574]' : 'border-transparent'}`} onClick={() => setLightboxImage(url)}><Image src={url} alt="" fill className="object-cover" /></div>))}</div>}
                          </div>
                        ) : (<div className="flex flex-col items-center justify-center py-6 text-[#7a7a7a] bg-[#faf8f5] rounded-xl"><p className="text-2xl mb-1">👶</p><p className="text-xs font-medium">No images</p></div>); })()}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#faf8f5] rounded-xl p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Price</p><p className="text-xl font-bold text-[#d4a574]">{formatPrice(selectedProduct.price)}</p></div>
                        <div className="bg-[#faf8f5] rounded-xl p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">SKU</p><p className="text-sm font-semibold">{selectedProduct.sku || '—'}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${stockBadgeClass(selectedProduct.stockStatus)}`}><span className={`w-2 h-2 rounded-full ${stockDot(selectedProduct.stockStatus, selectedProduct.stockQuantity)}`} /> {stockLabel(selectedProduct.stockStatus)}</span>
                        {selectedProduct.featured && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#d4a574] text-white"><Star className="w-3 h-3 fill-white" /> Featured</span>}
                        {selectedProduct.stockQuantity > 0 && selectedProduct.stockQuantity <= 5 && selectedProduct.stockStatus === 'instock' && <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100"><AlertTriangle className="w-3 h-3" /> Only {selectedProduct.stockQuantity} left</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#faf8f5] rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Stock</p>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${stockDot(selectedProduct.stockStatus, selectedProduct.stockQuantity)}`} />
                            <p className="text-sm font-bold">{stockLabel(selectedProduct.stockStatus)}</p>
                          </div>
                        </div>
                        <div className="bg-[#faf8f5] rounded-xl p-3 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Qty</p>
                          <p className={`text-2xl font-bold ${selectedProduct.stockQuantity <= 5 && selectedProduct.stockQuantity > 0 ? 'text-orange-500' : 'text-[#2d2d2d]'}`}>{selectedProduct.stockQuantity}</p>
                        </div>
                      </div>
                      {selectedProduct.stockQuantity > 0 && selectedProduct.stockQuantity <= 5 && selectedProduct.stockStatus === 'instock' && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" /><div><p className="text-xs font-semibold text-orange-600">Low Stock</p><p className="text-[10px] text-orange-500 mt-0.5">Only {selectedProduct.stockQuantity} left</p></div></div>
                      )}
                      {selectedProduct.stockStatus === 'outofstock' && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><div><p className="text-xs font-semibold text-red-600">Out of Stock</p><p className="text-[10px] text-red-500 mt-0.5">Unavailable for purchase</p></div></div>
                      )}
                      <div><h4 className="text-xs font-bold mb-1">Description</h4><p className="text-xs text-[#7a7a7a] leading-relaxed bg-[#faf8f5] rounded-xl p-3">{selectedProduct.description || 'No description provided.'}</p></div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-0.5">Brand</p><p className="font-medium">{selectedProduct.brand || '—'}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-0.5">Category</p><p className="font-medium">{selectedProduct.category}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Filter Bottom Sheet */}
              {showMobileFilters && (
                <div className="fixed inset-0 z-50">
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-[#e8e4df] px-4 py-3 flex items-center justify-between z-10">
                      <h2 className="text-base font-bold">Filters</h2>
                      <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-[#f5f1ec] transition-colors"><X className="w-5 h-5 text-[#7a7a7a]" /></button>
                    </div>
                    <div className="p-4 space-y-6">
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-3">Categories</h3>
                        <div className="space-y-1">
                          <button onClick={() => setCategoryFilter('All')} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === 'All' ? 'bg-[#d4a574] text-white' : 'hover:bg-[#f5f1ec] text-[#2d2d2d]'}`}>
                            <span className="font-medium">All Products</span>
                            <span className={`text-xs font-semibold ${categoryFilter === 'All' ? 'text-white/80' : 'text-[#7a7a7a]'}`}>{products.length}</span>
                          </button>
                          {categories.map((cat) => (
                            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === cat ? 'bg-[#d4a574] text-white' : 'hover:bg-[#f5f1ec] text-[#2d2d2d]'}`}>
                              <span className="font-medium truncate">{cat}</span>
                              <span className={`text-xs font-semibold ${categoryFilter === cat ? 'text-white/80' : 'text-[#7a7a7a]'}`}>{categoryCounts[cat] || 0}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-3">Stock Status</h3>
                        <div className="space-y-1">
                          {([
                            { key: 'all' as StockFilter, label: 'All Stock', dotClass: 'bg-[#7a7a7a]' },
                            { key: 'instock' as StockFilter, label: 'In Stock', dotClass: 'bg-emerald-500' },
                            { key: 'lowstock' as StockFilter, label: 'Low Stock', dotClass: 'bg-orange-400' },
                            { key: 'outofstock' as StockFilter, label: 'Out of Stock', dotClass: 'bg-red-500' },
                            { key: 'preorder' as StockFilter, label: 'Pre-Order', dotClass: 'bg-amber-400' },
                          ]).map((f) => (
                            <button key={f.key} onClick={() => setStockFilter(f.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${stockFilter === f.key ? 'bg-[#f5f1ec] text-[#d4a574] font-semibold' : 'hover:bg-[#f5f1ec]/50 text-[#2d2d2d]'}`}>
                              <span className={`w-2.5 h-2.5 rounded-full ${f.dotClass}`} />
                              <span>{f.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        {/* ═══════════════════════════════════════════════════════════
            ORDERS TAB
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="h-full overflow-auto p-6">
            <OrdersView orders={orders} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BANNERS TAB
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'banners' && (
          <div className="h-full overflow-auto p-6 max-w-4xl mx-auto">
            <AdminBannerSection initialBanners={banners} />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            BULK UPLOADS TAB
           ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'bulk' && (
          <div className="h-full overflow-auto p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Bulk Import</h2>
              <p className="text-sm text-[#7a7a7a] mb-6">
                Upload a CSV file to import multiple products at once. Download the template to see the required format.
              </p>
              <ImportModal
                isOpen={true}
                onClose={() => setActiveTab('products')}
                onSuccess={() => {
                  setActiveTab('products');
                  router.refresh();
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── Lightbox ── */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors" onClick={() => setLightboxImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImage} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}

      {/* ── Edit Modal ── */}
      <EditModal
        product={editProduct}
        isOpen={isEditOpen}
        onClose={closeEdit}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

// ─── Inline Orders View (simplified for tab) ─────────────────────────

function OrdersView({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = [...orders];
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.telegramPhone.toLowerCase().includes(q) ||
          o.product?.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Orders</h2>
        <div className="flex items-center gap-2">
          <a
            href="/api/orders/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-sm"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a7a]" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e8e4df] rounded-xl text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all"
          />
        </div>
        {(['all', 'pending', 'confirmed', 'delivered'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === s
                ? s === 'all'
                  ? 'bg-[#2d2d2d] text-white'
                  : s === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : s === 'confirmed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
                : 'bg-white border border-[#e8e4df] text-[#7a7a7a] hover:border-[#d4a574] hover:text-[#d4a574]'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-sm text-[#7a7a7a]">
        <span className="font-semibold text-[#2d2d2d]">{filtered.length}</span> order{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e8e4df] text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
                <th className="pb-3 pt-4 px-6">Date</th>
                <th className="pb-3 pt-4 pr-4">Product</th>
                <th className="pb-3 pt-4 pr-4">Customer</th>
                <th className="pb-3 pt-4 pr-4">Phone</th>
                <th className="pb-3 pt-4 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-[#e8e4df]/60 hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 px-6 text-sm text-[#7a7a7a] whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 font-semibold">{o.product?.name || 'Unknown'}</td>
                  <td className="py-3 pr-4">{o.customerName}</td>
                  <td className="py-3 pr-4 text-[#d4a574] font-medium">{o.telegramPhone}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        o.status === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : o.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7a7a7a]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
