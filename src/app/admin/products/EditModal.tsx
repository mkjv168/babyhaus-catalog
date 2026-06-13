'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ProductForm from './ProductForm';

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
}

interface EditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({ product, isOpen, onClose, onSuccess }: EditModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const isCreate = !product;

  const initial = product ? {
    name: product.name,
    brand: product.brand || '',
    category: product.category,
    description: product.description || '',
    price: product.price?.toString() || '',
    imageUrl: product.imageUrl || '',
    sku: product.sku || '',
    stockStatus: product.stockStatus,
    stockQuantity: product.stockQuantity?.toString() || '0',
    featured: product.featured,
  } : undefined;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-end sm:items-stretch justify-end transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

      {/* Panel */}
      <div
        className={`relative bg-white w-full sm:w-full sm:max-w-xl sm:h-full shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto rounded-t-2xl sm:rounded-none ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e8e4df] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-[#2d2d2d]">{isCreate ? 'Add Product' : 'Edit Product'}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#f5f1ec] transition-colors text-[#7a7a7a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-6">
          <ProductForm
            initial={initial}
            productId={product ? product.id : undefined}
            onSuccess={onSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
