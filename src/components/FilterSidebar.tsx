'use client';

import { useState } from 'react';

interface FilterSidebarProps {
  brands: string[];
  selectedBrands: string[];
  onBrandToggle: (brand: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  onClearFilters: () => void;
  productCount: number;
}

export function FilterSidebar({
  brands,
  selectedBrands,
  onBrandToggle,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  onClearFilters,
  productCount
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState(priceRange);

  const hasActiveFilters = selectedBrands.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < maxPrice;

  const handlePriceApply = () => {
    onPriceRangeChange(tempPriceRange);
  };

  const filterContent = (
    <>
      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-[#a0a0a0]">Min</label>
              <input
                type="number"
                value={tempPriceRange[0]}
                onChange={(e) => setTempPriceRange([Number(e.target.value), tempPriceRange[1]])}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:border-[#FF4D9F] focus:ring-1 focus:ring-[#FF4D9F]/20 focus:outline-none"
                min="0"
                max={tempPriceRange[1]}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#a0a0a0]">Max</label>
              <input
                type="number"
                value={tempPriceRange[1]}
                onChange={(e) => setTempPriceRange([tempPriceRange[0], Number(e.target.value)])}
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm focus:border-[#FF4D9F] focus:ring-1 focus:ring-[#FF4D9F]/20 focus:outline-none"
                min={tempPriceRange[0]}
                max={maxPrice}
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={tempPriceRange[1]}
            onChange={(e) => setTempPriceRange([tempPriceRange[0], Number(e.target.value)])}
            className="w-full accent-[#FF4D9F]"
          />
          <button
            onClick={handlePriceApply}
            className="w-full px-4 py-2 bg-[#1a1a1a] text-[#FF4D9F] text-sm font-semibold rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Brands</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                  className="w-4 h-4 accent-[#FF4D9F] rounded"
                />
                <span className="text-sm text-[#a0a0a0] group-hover:text-white transition-colors">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full px-4 py-2 border border-white/10 text-[#a0a0a0] text-sm font-semibold rounded-lg hover:border-[#FF4D9F] hover:text-[#FF4D9F] transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#FF4D9F] text-sm font-semibold rounded-full hover:bg-[#2a2a2a] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-gradient-to-r from-[#FF4D9F] via-[#FFB347] to-[#39FF14] text-white text-xs px-1.5 py-0.5 rounded-full">
              {selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Filters</h2>
            <span className="text-xs text-[#a0a0a0] bg-[#1a1a1a] px-2 py-1 rounded-full">
              {productCount} items
            </span>
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative ml-auto bg-[#141414] h-full w-80 max-w-full overflow-y-auto">
            <div className="sticky top-0 bg-[#141414] border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}