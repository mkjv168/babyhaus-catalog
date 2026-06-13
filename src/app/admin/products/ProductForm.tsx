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
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : null,
      };
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Brand</label>
          <input name="brand" value={form.brand} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Category *</label>
          <input name="category" required value={form.category} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="e.g. Skincare, Toys, Feeding" />
        </div>
        <div>
          <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Price (USD)</label>
          <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Leave empty to hide price" />
        </div>
        <div>
          <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">SKU</label>
          <input name="sku" value={form.sku} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Stock Status</label>
          <select name="stockStatus" value={form.stockStatus} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors">
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
            <option value="preorder">Pre-Order</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Image URL</label>
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="/products/your-image.jpg or external URL" />
      </div>
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Description</label>
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors" />
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-[#c9a84c]" />
        <span className="text-sm text-[#9a9590] uppercase tracking-wider">Featured Product</span>
      </label>
      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="px-8 py-4 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-sm hover:bg-[#ddb654] transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
        </button>
        <a href="/admin/products" className="px-8 py-4 border border-white/10 text-[#f0ece4] font-semibold tracking-wider uppercase text-sm hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
