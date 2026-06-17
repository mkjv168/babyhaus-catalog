'use client';

interface CategoryPillsProps {
  categories: { name: string; count: number }[];
  active: string;
  onSelect: (category: string) => void;
  totalCount: number;
}

export function CategoryPills({ categories, active, onSelect, totalCount }: CategoryPillsProps) {
  const allCategories = [{ name: 'All', count: totalCount }, ...categories];

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar md:flex-wrap md:overflow-visible py-1">
        {allCategories.map((cat) => {
          const isActive = active === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelect(cat.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border select-none inline-flex items-center gap-2 ${
                isActive
                  ? 'bg-[#FF6B9D] text-white border-[#FF6B9D] shadow-sm'
                  : 'bg-white text-[#6B6B6B] border-[#F0E6DD] hover:border-[#FF6B9D] hover:text-[#FF6B9D]'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#FFF9F5] text-[#A06D45]'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
