'use client';

interface CategoryPillsProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export function CategoryPills({ categories, active, onSelect }: CategoryPillsProps) {
  const allCategories = ['All', ...categories];

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar md:flex-wrap md:overflow-visible py-1">
        {allCategories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border select-none ${
                isActive
                  ? 'bg-[#FF6B9D] text-white border-[#FF6B9D] shadow-sm'
                  : 'bg-white text-[#6B6B6B] border-[#F0E6DD] hover:border-[#FF6B9D] hover:text-[#FF6B9D]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
