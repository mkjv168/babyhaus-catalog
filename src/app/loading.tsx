export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="h-14 border-b border-[#F0E6DD] bg-white/90" />

      {/* Hero skeleton */}
      <div className="px-4 py-6 md:py-12 max-w-7xl mx-auto">
        <div className="h-6 w-40 bg-[#FFF9F5] rounded-full mb-4 animate-pulse" />
        <div className="h-8 w-3/4 bg-[#FFF9F5] rounded-lg mb-3 animate-pulse" />
        <div className="h-8 w-1/2 bg-[#FFF9F5] rounded-lg mb-4 animate-pulse" />
        <div className="h-4 w-2/3 bg-[#FFF9F5] rounded mb-6 animate-pulse" />
        <div className="h-10 w-36 bg-[#FFF9F5] rounded-full animate-pulse" />
      </div>

      {/* Search + filters skeleton */}
      <div className="px-4 max-w-7xl mx-auto space-y-4">
        <div className="h-12 bg-white border border-[#F0E6DD] rounded-2xl animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-white border border-[#F0E6DD] rounded-full flex-shrink-0 animate-pulse" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-[#FFF9F5] rounded animate-pulse" />
          <div className="h-8 w-28 bg-white border border-[#F0E6DD] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="px-4 max-w-7xl mx-auto pt-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#F0E6DD] overflow-hidden animate-pulse">
              <div className="aspect-square bg-[#FFF9F5]" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-[#FFF9F5] rounded w-1/2" />
                <div className="h-4 bg-[#FFF9F5] rounded w-3/4" />
                <div className="h-3 bg-[#FFF9F5] rounded w-1/3" />
                <div className="h-8 bg-[#FFF9F5] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
