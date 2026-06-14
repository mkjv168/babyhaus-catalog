'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const MultiImageUpload = dynamic(() => import('@/components/MultiImageUpload'), { 
  ssr: false,
  loading: () => <div className="h-32 bg-[#f5f1ec] rounded-xl animate-pulse" />
});

interface ProductVariant {
  id?: string;
  sku: string;
  name: string;
  price: string;
  stockQuantity: string;
  stockStatus: string;
  imageUrl?: string | null;
}

interface ProductData {
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  featured: boolean;
  variants: ProductVariant[];
}

export default function ProductForm({
  initial,
  productId,
  onSuccess,
  onCancel,
}: {
  initial?: ProductData;
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>(initial || {
    name: '', brand: '', category: '', description: '', images: [], featured: false,
    variants: [{ sku: '', name: 'Default', price: '', stockQuantity: '0', stockStatus: 'instock' }],
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }));
  };

  const addVariant = () => {
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { sku: '', name: '', price: '', stockQuantity: '0', stockStatus: 'instock' }]
    }));
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) return;
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Validate variants
      for (const v of form.variants) {
        if (!v.sku.trim()) {
          setError('All variants must have a SKU');
          setLoading(false);
          return;
        }
        if (!v.name.trim()) {
          setError('All variants must have a name');
          setLoading(false);
          return;
        }
      }

      const payload = { 
        name: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        featured: form.featured,
        imageUrl: form.images[0] || null,
        images: form.images,
        variants: form.variants.map(v => ({
          id: v.id,
          sku: v.sku.trim(),
          name: v.name.trim(),
          price: v.price ? parseFloat(v.price) : null,
          stockQuantity: parseInt(v.stockQuantity || '0', 10),
          stockStatus: v.stockStatus,
          imageUrl: v.imageUrl,
        })),
      };
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/products');
          router.refresh();
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Brand</label>
          <input name="brand" value={form.brand} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Category *</label>
          <input name="category" required value={form.category} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" placeholder="e.g. Skincare, Toys, Feeding" />
        </div>
      </div>

      <MultiImageUpload
        images={form.images}
        onImagesChange={(images) => setForm(prev => ({ ...prev, images }))}
        onUploadStart={() => setImageUploading(true)}
        onUploadEnd={() => setImageUploading(false)}
        maxImages={4}
      />

      <div>
        <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Description</label>
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all resize-none" />
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-[#7a7a7a]">Variants *</label>
          <button type="button" onClick={addVariant} className="flex items-center gap-1 px-3 py-1.5 bg-[#f5f1ec] text-[#d4a574] text-xs font-semibold rounded-full hover:bg-[#e8e4df] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Variant
          </button>
        </div>
        <div className="space-y-3">
          {form.variants.map((variant, index) => (
            <div key={index} className="p-4 bg-[#faf8f5] border border-[#e8e4df] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7a7a7a]">Variant {index + 1}</span>
                {form.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Variant Name *</label>
                  <input value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} className="w-full bg-white border border-[#e8e4df] rounded-lg px-3 py-2 text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none" placeholder="e.g. Size M, Blue, 500ml" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">SKU *</label>
                  <input value={variant.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="w-full bg-white border border-[#e8e4df] rounded-lg px-3 py-2 text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none" placeholder="e.g. PMP-S-36" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Price (USD)</label>
                  <input type="number" step="0.01" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="w-full bg-white border border-[#e8e4df] rounded-lg px-3 py-2 text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Stock Qty</label>
                    <input type="number" min="0" value={variant.stockQuantity} onChange={(e) => handleVariantChange(index, 'stockQuantity', e.target.value)} className="w-full bg-white border border-[#e8e4df] rounded-lg px-3 py-2 text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7a7a7a] mb-1">Status</label>
                    <select value={variant.stockStatus} onChange={(e) => handleVariantChange(index, 'stockStatus', e.target.value)} className="w-full bg-white border border-[#e8e4df] rounded-lg px-3 py-2 text-sm text-[#2d2d2d] focus:border-[#d4a574] focus:outline-none">
                      <option value="instock">In Stock</option>
                      <option value="outofstock">Out</option>
                      <option value="preorder">Pre-Order</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} className="w-5 h-5 accent-[#d4a574] rounded" />
        <span className="text-sm font-semibold text-[#7a7a7a]">Featured Product</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || imageUploading}
          className="px-8 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="px-8 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors">
            Cancel
          </button>
        ) : (
          <a href="/admin" className="px-8 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors">
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
