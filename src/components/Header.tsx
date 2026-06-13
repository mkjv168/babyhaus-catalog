import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e8e4df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-[#d4a574]">Baby</span>
          <span className="text-[#2d2d2d]">Haus</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#7a7a7a] font-medium">
            <span className="text-base">🇰🇭</span> Cambodia
          </span>
          <a
            href="https://t.me/narote"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5ebe0] text-[#d4a574] text-xs font-semibold rounded-full hover:bg-[#d4a574] hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Telegram
          </a>
        </div>
      </div>
    </header>
  );
}
