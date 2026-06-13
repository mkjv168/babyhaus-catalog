'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a574' : '#7a7a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
  },
  {
    label: 'Search',
    href: '/?focus=search',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a574' : '#7a7a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    ),
  },
  {
    label: 'Categories',
    href: '/?focus=categories',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a574' : '#7a7a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h3"/><path d="M4 17v3h3"/><path d="M20 7V4h-3"/><path d="M20 17v3h-3"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="12" cy="9" r="1"/></svg>
    ),
  },
  {
    label: 'Chat',
    href: 'https://t.me/narote',
    external: true,
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#d4a574' : '#7a7a7a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    ),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-[#e8e4df] pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = !item.external && pathname === item.href.split('?')[0];
          const content = (
            <div className={`flex flex-col items-center justify-center gap-0.5 w-full h-full ${isActive ? 'text-[#d4a574]' : 'text-[#7a7a7a]'}`}>
              {item.icon(isActive)}
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          );

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center"
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex-1 flex items-center justify-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
