'use client';

interface Variant {
  id: string;
  name: string;
  price: number | null;
  stockStatus: string;
  stockQuantity: number;
  sku: string | null;
}

interface ProductVariantSelectorProps {
  variants: Variant[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProductVariantSelector({ variants, selectedId, onSelect }: ProductVariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-bold text-[#7a7a7a] uppercase tracking-wide mb-2">
        Select Option
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isActive = v.id === selectedId;
          const isOutOfStock = v.stockStatus === 'outofstock';
          return (
            <button
              key={v.id}
              onClick={() => !isOutOfStock && onSelect(v.id)}
              disabled={isOutOfStock}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-[#FF6B9D] text-white border-[#FF6B9D] shadow-sm'
                  : isOutOfStock
                  ? 'bg-[#f5f1ec] text-[#7a7a7a] border-[#e8e4df] opacity-60 cursor-not-allowed'
                  : 'bg-white text-[#2D2D2D] border-[#e8e4df] hover:border-[#FF6B9D] hover:text-[#FF6B9D]'
              }`}
            >
              <span className="truncate max-w-[120px]">{v.name}</span>
              {!isActive && !isOutOfStock && (
                <span className="text-[10px] text-[#d4a574]">
                  ${v.price?.toFixed(2) || '—'}
                </span>
              )}
              {isOutOfStock && (
                <span className="text-[9px] font-bold text-red-500">Out</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
