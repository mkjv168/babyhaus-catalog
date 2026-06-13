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
                  ? 'bg-gradient-to-r from-[#FF4D9F] via-[#FFB347] to-[#39FF14] text-white border-transparent shadow-sm'
                  : 'bg-[#141414] text-[#a0a0a0] border-white/10 hover:border-[#FF4D9F] hover:text-[#FF4D9F]'
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
