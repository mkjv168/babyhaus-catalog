'use client';

import { useState } from 'react';

interface Product {
  description: string | null;
  sku: string | null;
  brand: string | null;
  category: string;
  stockStatus: string;
}

interface ProductDetailClientProps {
  product: Product;
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#F0E6DD] rounded-xl overflow-hidden bg-white mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-[#2D2D2D]">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#6B6B6B] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[#6B6B6B] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  return (
    <div className="space-y-1">
      {product.description && (
        <Accordion title="Description" defaultOpen>
          {product.description}
        </Accordion>
      )}
      <Accordion title="Product Details">
        <div className="space-y-2">
          {product.sku && (
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">SKU</span>
              <span className="font-medium text-[#2D2D2D]">{product.sku}</span>
            </div>
          )}
          {product.brand && (
            <div className="flex justify-between">
              <span className="text-[#6B6B6B]">Brand</span>
              <span className="font-medium text-[#2D2D2D]">{product.brand}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#6B6B6B]">Category</span>
            <span className="font-medium text-[#2D2D2D]">{product.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B6B6B]">Availability</span>
            <span className="font-medium text-[#2D2D2D]">
              {product.stockStatus === 'instock'
                ? 'In Stock'
                : product.stockStatus === 'preorder'
                ? 'Pre-Order'
                : 'Out of Stock'}
            </span>
          </div>
        </div>
      </Accordion>
    </div>
  );
}
