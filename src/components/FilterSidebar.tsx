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
        <h3 className="text-sm font-bold text-[#2d2d2d] mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-[#7a7a7a]">Min</label>
              <input
                type="number"
                value={tempPriceRange[0]}
                onChange={(e) => setTempPriceRange([Number(e.target.value), tempPriceRange[1]])}
                className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/20 focus:outline-none"
                min="0"
                max={tempPriceRange[1]}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-[#7a7a7a]">Max</label>
              <input
                type="number"
                value={tempPriceRange[1]}
                onChange={(e) => setTempPriceRange([tempPriceRange[0], Number(e.target.value)])}
                className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]/20 focus:outline-none"
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
            className="w-full accent-[#d4a574]"
          />
          <button
            onClick={handlePriceApply}
            className="w-full px-4 py-2 bg-[#f5ebe0] text-[#d4a574] text-sm font-semibold rounded-lg hover:bg-[#ede0d1] transition-colors"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#2d2d2d] mb-3">Brands</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                  className="w-4 h-4 accent-[#d4a574] rounded"
                />
                <span className="text-sm text-[#7a7a7a] group-hover:text-[#2d2d2d] transition-colors">
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
          className="w-full px-4 py-2 border border-[#e8e4df] text-[#7a7a7a] text-sm font-semibold rounded-lg hover:border-[#d4a574] hover:text-[#d4a574] transition-colors"
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
          className="flex items-center gap-2 px-4 py-2 bg-[#f5ebe0] text-[#d4a574] text-sm font-semibold rounded-full hover:bg-[#ede0d1] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-[#d4a574] text-white text-xs px-1.5 py-0.5 rounded-full">
              {selectedBrands.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 sticky top-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#2d2d2d]">Filters</h2>
            <span className="text-xs text-[#7a7a7a] bg-[#f5f1ec] px-2 py-1 rounded-full">
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
          <div className="relative ml-auto bg-white h-full w-80 max-w-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#e8e4df] p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2d2d2d]">Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#f5f1ec] rounded-lg transition-colors"
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