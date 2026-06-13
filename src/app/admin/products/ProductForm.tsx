'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductData {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  sku: string;
  stockStatus: string;
  featured: boolean;
}

export default function ProductForm({ initial, productId }: { initial?: ProductData; productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductData>(initial || {
    name: '', brand: '', category: '', description: '', price: '', imageUrl: '', sku: '', stockStatus: 'instock', featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, price: form.price ? parseFloat(form.price) : null };
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
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
        <div>
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Category *</label>
          <input name="category" required value={form.category} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" placeholder="e.g. Skincare, Toys, Feeding" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Price (USD)</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" placeholder="Leave empty to hide price" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">SKU</label>
          <input name="sku" value={form.sku} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Stock Status</label>
          <select name="stockStatus" value={form.stockStatus} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all">
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
            <option value="preorder">Pre-Order</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Image URL</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all" placeholder="/products/your-image.jpg or external URL" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">Description</label>
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all resize-none" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} className="w-5 h-5 accent-[#d4a574] rounded" />
        <span className="text-sm font-semibold text-[#7a7a7a]">Featured Product</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="px-8 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
        </button>
        <a href="/admin/products" className="px-8 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
