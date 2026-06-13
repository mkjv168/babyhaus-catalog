import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e4df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-[#d4a574]">Baby</span>
          <span className="text-[#2d2d2d]">Haus</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#7a7a7a]">
            <span className="text-lg">🇰🇭</span> Cambodia
          </span>
        </div>
      </div>
    </header>
  );
}
