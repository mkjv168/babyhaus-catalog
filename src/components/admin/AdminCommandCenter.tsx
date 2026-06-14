'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Package, ShoppingBag, ImageIcon, FileSpreadsheet,
  Search, ChevronRight, Edit3, Trash2, Plus,
  Check, X, AlertTriangle, Star, Filter, XCircle, Copy
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

interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number | null;
  stockQuantity: number;
  stockStatus: string;
  imageUrl: string | null;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string | null;
  featured: boolean;
  imageUrl: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface Order {
  id: string;
  variantId: string;
  quantity: number;
  customerName: string;
  telegramPhone: string;
  deliveryAddress: string | null;
  paymentMethod: string;
  notes: string | null;
  status: string;
  createdAt: string;
  variant: {
    id: string;
    sku: string;
    name: string;
    price: number | null;
    product: { name: string } | null;
  } | null;
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

const getStatusColor = (status: string) => {
  if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-100';
  if (status === 'confirmed') return 'bg-blue-50 text-blue-700 border-blue-100';
  if (status === 'shipped') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'delivered') return 'bg-green-50 text-green-700 border-green-100';
  if (status === 'cancelled') return 'bg-red-50 text-red-700 border-red-100';
  return 'bg-gray-50 text-gray-700 border-gray-100';
};

// ─── Component ───────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e8e4df]/50">
      <div className="w-4 h-4 rounded bg-[#e8e4df] animate-pulse" />
      <div className="w-9 h-9 rounded-lg bg-[#e8e4df] animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-24 h-3 rounded bg-[#e8e4df] animate-pulse" />
        <div className="w-16 h-2.5 rounded bg-[#e8e4df] animate-pulse" />
      </div>
      <div className="w-16 h-5 rounded-full bg-[#e8e4df] animate-pulse" />
    </div>
  );
}

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

  // ─ Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

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
        result = result.filter((p) =>
          p.variants.some((v) => v.stockStatus === 'instock' && v.stockQuantity > 0 && v.stockQuantity <= 5)
        );
      } else if (stockFilter === 'instock') {
        result = result.filter((p) => p.variants.some((v) => v.stockStatus === 'instock' && v.stockQuantity > 0));
      } else if (stockFilter === 'outofstock') {
        result = result.filter((p) => p.variants.every((v) => v.stockStatus === 'outofstock'));
      } else if (stockFilter === 'preorder') {
        result = result.filter((p) => p.variants.some((v) => v.stockStatus === 'preorder'));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          p.variants.some((v) =>
            v.name.toLowerCase().includes(q) ||
            v.sku.toLowerCase().includes(q)
          )
      );
    }

    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price_asc') {
      result.sort((a, b) => {
        const minA = Math.min(...a.variants.map((v) => v.price || Infinity));
        const minB = Math.min(...b.variants.map((v) => v.price || Infinity));
        return minA - minB;
      });
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => {
        const maxA = Math.max(...a.variants.map((v) => v.price || 0));
        const maxB = Math.max(...b.variants.map((v) => v.price || 0));
        return maxB - maxA;
      });
    } else if (sortBy === 'stock_asc') {
      result.sort((a, b) => {
        const totalA = a.variants.reduce((s, v) => s + v.stockQuantity, 0);
        const totalB = b.variants.reduce((s, v) => s + v.stockQuantity, 0);
        return totalA - totalB;
      });
    } else if (sortBy === 'stock_desc') {
      result.sort((a, b) => {
        const totalA = a.variants.reduce((s, v) => s + v.stockQuantity, 0);
        const totalB = b.variants.reduce((s, v) => s + v.stockQuantity, 0);
        return totalB - totalA;
      });
    }

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
      showToast(`${ids.length} products deleted`, 'success');
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
      showToast('Products updated', 'success');
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

  const handleQuickStockChange = async (variantId: string, delta: number) => {
    const product = products.find((p) => p.variants.some((v) => v.id === variantId));
    if (!product) return;
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;
    const newQty = Math.max(0, variant.stockQuantity + delta);
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variants: product.variants.map((v) =>
          v.id === variantId
            ? { ...v, stockQuantity: newQty, stockStatus: newQty === 0 ? 'outofstock' : newQty <= 5 ? 'instock' : v.stockStatus }
            : v
        ),
      }),
    });
    showToast('Stock updated', 'success');
    router.refresh();
  };

  // ─ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'products' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        return;
      }
      switch (e.key) {
        case '/':
          e.preventDefault();
          (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus();
          break;
        case 'e':
          if (selectedProductId && !isEditing) {
            setIsEditing(true);
          }
          break;
        case 'n':
          openEdit(null);
          break;
        case 'Escape':
          if (showMobileInspector) {
            setShowMobileInspector(false);
          } else if (lightboxImage) {
            setLightboxImage(null);
          } else if (isEditing) {
            setIsEditing(false);
          } else if (selectedProductId) {
            setSelectedProductId(null);
          }
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedProductId, isEditing, showMobileInspector, lightboxImage]);

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
        {activeTab === 'products' && (
          <>
            <div className="h-full hidden md:flex">
              {/* Column 1: Sidebar */}
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

              {/* Column 2: Product Stream */}
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
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
                    const allOut = product.variants.every((v) => v.stockStatus === 'outofstock');
                    const prices = product.variants.map((v) => v.price).filter((p): p is number => p !== null);
                    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
                    return (
                      <div key={product.id} onClick={() => handleSelectProduct(product.id)} className={`group flex items-center gap-3 px-4 py-2.5 border-b border-[#e8e4df]/50 cursor-pointer transition-all duration-150 ${selectedProductId === product.id ? 'bg-white shadow-sm ring-1 ring-[#d4a574]/20' : 'hover:bg-white/60'}`}>
                        <input type="checkbox" checked={selectedIds.has(product.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(product.id); }} className="w-4 h-4 accent-[#d4a574] rounded shrink-0 cursor-pointer" />
                        <div className="w-9 h-9 relative bg-[#f5f1ec] rounded-lg overflow-hidden shrink-0 border border-[#e8e4df]/60">{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" /> : <span className="text-xs flex items-center justify-center h-full text-[#7a7a7a]">👶</span>}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-[#2d2d2d] truncate">{product.name}</p>
                            {product.featured && <Star className="w-3 h-3 text-[#d4a574] fill-[#d4a574] shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0">
                            <span className="text-[10px] text-[#7a7a7a]">{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</span>
                            {minPrice !== null && (
                              <span className="text-[10px] text-[#d4a574] font-semibold">
                                {minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice!.toFixed(2)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#7a7a7a]">{totalStock} total</span>
                          {allOut && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0 rounded-full">Out</span>}
                          <ChevronRight className={`w-3.5 h-3.5 text-[#7a7a7a] shrink-0 transition-all duration-150 ${selectedProductId === product.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0'}`} />
                        </div>
                      </div>
                    );
                  })}
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
                      ) : products.length === 0 ? (
                        <>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonRow key={i} />
                          ))}
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

              {/* Column 3: Inspector */}
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
                        <button onClick={() => { if (confirm('Delete this product and all its variants?')) { fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' }).then(() => { setSelectedProductId(null); setIsEditing(false); showToast('Product deleted', 'success'); router.refresh(); }); } }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
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
                            images: (() => {
                              const urls: string[] = [];
                              if (selectedProduct.imageUrl) urls.push(selectedProduct.imageUrl);
                              selectedProduct.images
                                .sort((a, b) => a.order - b.order)
                                .forEach((img) => { if (!urls.includes(img.url)) urls.push(img.url); });
                              return urls;
                            })(),
                            featured: selectedProduct.featured,
                            variants: selectedProduct.variants.map(v => ({
                              id: v.id,
                              sku: v.sku || '',
                              name: v.name,
                              price: v.price?.toString() ?? '',
                              stockQuantity: v.stockQuantity?.toString() ?? '0',
                              stockStatus: v.stockStatus,
                              imageUrl: v.imageUrl,
                            })),
                          }}
                          productId={selectedProduct.id}
                          onSuccess={() => { setIsEditing(false); router.refresh(); }}
                          onCancel={() => setIsEditing(false)}
                        />
                      ) : (
                        <div className="space-y-6">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#faf8f5] rounded-xl p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Variants</p>
                              <p className="text-xl font-bold text-[#d4a574]">{selectedProduct.variants.length}</p>
                            </div>
                            <div className="bg-[#faf8f5] rounded-xl p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Total Stock</p>
                              <p className="text-xl font-bold text-[#d4a574]">{selectedProduct.variants.reduce((s, v) => s + v.stockQuantity, 0)}</p>
                            </div>
                            <div className="bg-[#faf8f5] rounded-xl p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Price Range</p>
                              <p className="text-sm font-bold text-[#d4a574]">
                                {(() => {
                                  const prices = selectedProduct.variants.map((v) => v.price).filter((p): p is number => p !== null);
                                  if (prices.length === 0) return '—';
                                  const min = Math.min(...prices);
                                  const max = Math.max(...prices);
                                  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
                                })()}
                              </p>
                            </div>
                            <div className="bg-[#faf8f5] rounded-xl p-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Featured</p>
                              <p className="text-sm font-bold text-[#d4a574]">{selectedProduct.featured ? 'Yes' : 'No'}</p>
                            </div>
                          </div>

                          {/* Variants */}
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a7a7a] mb-3">Variants</h3>
                            <div className="space-y-2">
                              {selectedProduct.variants.map((variant) => (
                                <div key={variant.id} className="flex items-center gap-3 p-3 bg-white border border-[#e8e4df]/60 rounded-xl">
                                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${stockDot(variant.stockStatus, variant.stockQuantity)}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#2d2d2d] truncate">{variant.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-[#7a7a7a] font-mono">{variant.sku}</span>
                                      <span className="text-[10px] text-[#d4a574] font-semibold">{formatPrice(variant.price)}</span>
                                      {variant.stockQuantity > 0 && variant.stockQuantity <= 5 && variant.stockStatus === 'instock' && (
                                        <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0 rounded-full">{variant.stockQuantity} left</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleQuickStockChange(variant.id, -1)} className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f5f1ec] hover:bg-[#e8e4df] text-[#7a7a7a] text-[10px] font-bold transition-colors">-</button>
                                    <span className={`w-5 text-center text-[10px] font-bold ${variant.stockQuantity <= 5 && variant.stockQuantity > 0 ? 'text-orange-500' : 'text-[#2d2d2d]'}`}>{variant.stockQuantity}</span>
                                    <button onClick={() => handleQuickStockChange(variant.id, 1)} className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f5f1ec] hover:bg-[#e8e4df] text-[#7a7a7a] text-[10px] font-bold transition-colors">+</button>
                                  </div>
                                  <button onClick={() => { navigator.clipboard.writeText(variant.sku); showToast('SKU copied', 'success'); }} className="p-1.5 hover:bg-[#f5f1ec] rounded-lg transition-colors" title="Copy SKU">
                                    <Copy className="w-3.5 h-3.5 text-[#7a7a7a]" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {selectedProduct.description && (
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Description</h3>
                              <p className="text-sm text-[#2d2d2d] leading-relaxed">{selectedProduct.description}</p>
                            </div>
                          )}

                          {(() => {
                            const imgs = allProductImages(selectedProduct);
                            return imgs.length > 0 ? (
                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Images</h3>
                                <div className="flex gap-2 flex-wrap">
                                  {imgs.map((url, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#e8e4df]/60 cursor-pointer" onClick={() => setLightboxImage(url)}>
                                      <Image src={url} alt="" fill className="object-cover" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
                      <Package className="w-9 h-9 text-[#d4a574]" />
                    </div>
                    <p className="text-sm font-semibold text-[#2d2d2d] mb-1">Select a product</p>
                    <p className="text-xs text-[#7a7a7a]">View details, manage variants, and edit stock</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="h-full flex flex-col md:hidden">
              <div className="px-4 py-3 border-b border-[#e8e4df] bg-white flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a7a7a]" />
                  <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-[#faf8f5] border border-[#e8e4df] rounded-lg text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none" />
                </div>
                <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="p-2 rounded-lg border border-[#e8e4df] hover:border-[#d4a574] transition-colors"><Filter className="w-4 h-4 text-[#7a7a7a]" /></button>
                <button onClick={() => openEdit(null)} className="flex items-center gap-1 px-3 py-2 bg-[#d4a574] text-white text-xs font-semibold rounded-full"><Plus className="w-3.5 h-3.5" />Add</button>
              </div>
              {showMobileFilters && (
                <div className="px-4 py-3 bg-white border-b border-[#e8e4df] space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Category</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button onClick={() => setCategoryFilter('All')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${categoryFilter === 'All' ? 'bg-[#d4a574] text-white' : 'bg-[#f5f1ec] text-[#2d2d2d]'}`}>All</button>
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${categoryFilter === cat ? 'bg-[#d4a574] text-white' : 'bg-[#f5f1ec] text-[#2d2d2d]'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Stock</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(['all', 'instock', 'lowstock', 'outofstock', 'preorder'] as StockFilter[]).map((f) => (
                        <button key={f} onClick={() => setStockFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${stockFilter === f ? 'bg-[#d4a574] text-white' : 'bg-[#f5f1ec] text-[#2d2d2d]'}`}>{stockLabel(f)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {selectedIds.size > 0 && (
                <div className="px-4 py-2 bg-[#f5f1ec] border-b border-[#e8e4df] flex items-center gap-2">
                  <button onClick={() => handleBulkFeature(true)} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50">Feature</button>
                  <button onClick={() => handleBulkFeature(false)} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-white border border-[#e8e4df] rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors disabled:opacity-50">Unfeature</button>
                  <button onClick={handleBulkDelete} disabled={bulkLoading} className="px-2.5 py-1 text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50">Delete</button>
                  <div className="flex-1" />
                  <button onClick={() => setSelectedIds(new Set())} className="p-1 hover:bg-[#e8e4df] rounded transition-colors"><X className="w-3.5 h-3.5 text-[#7a7a7a]" /></button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <p className="px-4 py-2 text-xs font-semibold text-[#7a7a7a]">{filteredProducts.length} products</p>
                {filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce((s, v) => s + v.stockQuantity, 0);
                  const allOut = product.variants.every((v) => v.stockStatus === 'outofstock');
                  return (
                    <div key={product.id} onClick={() => handleSelectProduct(product.id)} className={`group flex items-center gap-3 px-4 py-2.5 border-b border-[#e8e4df]/50 cursor-pointer transition-all duration-150 ${selectedProductId === product.id ? 'bg-white shadow-sm ring-1 ring-[#d4a574]/20' : 'hover:bg-white/60'}`}>
                      <input type="checkbox" checked={selectedIds.has(product.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(product.id); }} className="w-4 h-4 accent-[#d4a574] rounded shrink-0 cursor-pointer" />
                      <div className="w-9 h-9 relative bg-[#f5f1ec] rounded-lg overflow-hidden shrink-0 border border-[#e8e4df]/60">{product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill className="object-cover" /> : <span className="text-xs flex items-center justify-center h-full text-[#7a7a7a]">👶</span>}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-[#2d2d2d] truncate">{product.name}</p>
                          {product.featured && <Star className="w-3 h-3 text-[#d4a574] fill-[#d4a574] shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0">
                          <span className="text-[10px] text-[#7a7a7a]">{product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}</span>
                          <span className="text-[10px] text-[#d4a574] font-semibold">Stock: {totalStock}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {allOut && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">Out</span>}
                        <ChevronRight className="w-3.5 h-3.5 text-[#7a7a7a] shrink-0" />
                      </div>
                    </div>
                  );
                })}
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
                        <button onClick={() => { if (confirm('Delete this product and all variants?')) { fetch(`/api/products/${selectedProduct.id}`, { method: 'DELETE' }).then(() => { setSelectedProductId(null); setShowMobileInspector(false); router.refresh(); }); } }} className="p-2.5 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-red-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#faf8f5] rounded-xl p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Variants</p><p className="text-xl font-bold text-[#d4a574]">{selectedProduct.variants.length}</p></div>
                        <div className="bg-[#faf8f5] rounded-xl p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Total Stock</p><p className="text-xl font-bold text-[#d4a574]">{selectedProduct.variants.reduce((s, v) => s + v.stockQuantity, 0)}</p></div>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a7a7a] mb-2">Variants</h3>
                        <div className="space-y-2">
                          {selectedProduct.variants.map((variant) => (
                            <div key={variant.id} className="flex items-center gap-3 p-3 bg-white border border-[#e8e4df]/60 rounded-xl">
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${stockDot(variant.stockStatus, variant.stockQuantity)}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#2d2d2d] truncate">{variant.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-[#7a7a7a] font-mono">{variant.sku}</span>
                                  <span className="text-[10px] text-[#d4a574] font-semibold">{formatPrice(variant.price)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleQuickStockChange(variant.id, -1)} className="w-4 h-4 flex items-center justify-center rounded-full bg-[#f5f1ec] hover:bg-[#e8e4df] text-[#7a7a7a] text-[9px] font-bold transition-colors">-</button>
                                <span className={`w-4 text-center text-[9px] font-bold ${variant.stockQuantity <= 5 && variant.stockQuantity > 0 ? 'text-orange-500' : 'text-[#2d2d2d]'}`}>{variant.stockQuantity}</span>
                                <button onClick={() => handleQuickStockChange(variant.id, 1)} className="w-4 h-4 flex items-center justify-center rounded-full bg-[#f5f1ec] hover:bg-[#e8e4df] text-[#7a7a7a] text-[9px] font-bold transition-colors">+</button>
                              </div>
                            </div>
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

        {activeTab === 'orders' && (
          <div className="h-full flex flex-col">
            <div className="px-4 sm:px-6 py-3 border-b border-[#e8e4df] bg-white flex items-center justify-between">
              <h2 className="text-lg font-bold">Orders</h2>
              <span className="text-xs text-[#7a7a7a]">{orders.length} total</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-[#d4a574]" />
                  </div>
                  <p className="text-sm font-semibold text-[#2d2d2d]">No orders yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e8e4df]/50">
                  {orders.map((order) => (
                    <div key={order.id} className="px-4 sm:px-6 py-4 hover:bg-white/60 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-[#2d2d2d]">{order.variant?.product?.name || 'Unknown Product'}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>{order.status}</span>
                          </div>
                          <p className="text-xs text-[#7a7a7a] mb-1">{order.variant?.name} • SKU: {order.variant?.sku}</p>
                          <p className="text-xs text-[#7a7a7a]">{order.customerName} • {order.telegramPhone}</p>
                          {order.deliveryAddress && (
                            <p className="text-xs text-[#7a7a7a] mt-1">{order.deliveryAddress}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-[#2d2d2d]">Qty: {order.quantity}</p>
                          {order.variant?.price && (
                            <p className="text-xs text-[#d4a574] font-semibold">${(order.variant.price * order.quantity).toFixed(2)}</p>
                          )}
                          <p className="text-[10px] text-[#7a7a7a] mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {order.status === 'pending' && (
                          <>
                            <button onClick={() => fetch(`/api/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' }) }).then(() => router.refresh())} className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-semibold rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors">Confirm</button>
                            <button onClick={() => fetch(`/api/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) }).then(() => router.refresh())} className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-semibold rounded-full border border-red-100 hover:bg-red-100 transition-colors">Cancel</button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button onClick={() => fetch(`/api/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'shipped' }) }).then(() => router.refresh())} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">Mark Shipped</button>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => fetch(`/api/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'delivered' }) }).then(() => router.refresh())} className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-semibold rounded-full border border-green-100 hover:bg-green-100 transition-colors">Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="h-full overflow-y-auto">
            <AdminBannerSection initialBanners={banners} />
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-[#f5f1ec] flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-7 h-7 text-[#d4a574]" />
            </div>
            <p className="text-sm font-semibold text-[#2d2d2d] mb-2">Bulk Product Upload</p>
            <p className="text-xs text-[#7a7a7a] mb-4 max-w-sm">Import products from a CSV or Excel file. Map columns and review before importing.</p>
            <button onClick={() => setIsImportOpen(true)} className="px-5 py-2.5 bg-[#d4a574] text-white text-sm font-semibold rounded-full hover:bg-[#c49464] transition-colors">Open Import Tool</button>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all ${toast.type === 'success' ? 'bg-[#2d2d2d] text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Image src={lightboxImage} alt="" fill className="object-contain" />
          </div>
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Modals */}
      {isEditOpen && (
        <EditModal product={editProduct} isOpen={isEditOpen} onClose={closeEdit} onSuccess={handleSuccess} />
      )}
      {isImportOpen && (
        <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={() => { setIsImportOpen(false); router.refresh(); }} />
      )}
    </div>
  );
}
