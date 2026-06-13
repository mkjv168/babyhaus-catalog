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
                  ? 'bg-[#d4a574] text-white border-[#d4a574] shadow-sm'
                  : 'bg-white text-[#7a7a7a] border-[#e8e4df] hover:border-[#d4a574] hover:text-[#d4a574]'
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
