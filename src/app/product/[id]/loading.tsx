export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header skeleton */}
      <div className="h-14 border-b border-white/10 bg-[#0a0a0a]/90" />

      {/* Back button skeleton */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/90">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <div className="h-5 w-28 bg-[#1a1a1a] rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Image skeleton */}
          <div className="aspect-square bg-[#1a1a1a] rounded-2xl border border-white/10 animate-pulse" />

          {/* Info skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-[#1a1a1a] rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-[#1a1a1a] rounded-lg animate-pulse" />
              <div className="h-6 w-16 bg-[#1a1a1a] rounded-full animate-pulse" />
            </div>
            <div className="h-14 bg-[#1a1a1a] rounded-2xl animate-pulse" />
            <div className="h-12 bg-[#1a1a1a] rounded-2xl animate-pulse" />
            <div className="space-y-2 pt-4">
              <div className="h-12 bg-[#141414] border border-white/10 rounded-xl animate-pulse" />
              <div className="h-12 bg-[#141414] border border-white/10 rounded-xl animate-pulse" />
              <div className="h-12 bg-[#141414] border border-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
