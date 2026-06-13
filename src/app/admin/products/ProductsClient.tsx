'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import DeleteButton from './DeleteButton';
import EditModal from './EditModal';

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
}

interface ProductsClientProps {
  products: Product[];
}

export default function ProductsClient({ products }: ProductsClientProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleSuccess = () => {
    closeModal();
    router.refresh();
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#e8e4df] text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
                <th className="pb-3 pt-4 px-6">Image</th>
                <th className="pb-3 pt-4 pr-4">Name</th>
                <th className="pb-3 pt-4 pr-4">Brand</th>
                <th className="pb-3 pt-4 pr-4">Category</th>
                <th className="pb-3 pt-4 pr-4">Price</th>
                <th className="pb-3 pt-4 pr-4">Stock</th>
                <th className="pb-3 pt-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[#e8e4df]/60 hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 px-6">
                    <div className="w-12 h-12 relative bg-[#f5f1ec] rounded-xl overflow-hidden">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                      ) : (
                        <span className="text-lg flex items-center justify-center h-full">👶</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{p.name}</td>
                  <td className="py-3 pr-4 text-[#7a7a7a]">{p.brand || '-'}</td>
                  <td className="py-3 pr-4 text-[#7a7a7a]">{p.category}</td>
                  <td className="py-3 pr-4 text-[#d4a574] font-semibold">
                    {p.price ? `$${p.price.toFixed(2)}` : '-'}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.stockStatus === 'instock'
                          ? 'bg-green-50 text-green-600'
                          : p.stockStatus === 'preorder'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {p.stockStatus}
                    </span>
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <EditModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </>
  );
}
