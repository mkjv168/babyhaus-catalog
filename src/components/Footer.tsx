'use client';

import { useState } from 'react';

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <h4 className="text-sm font-semibold uppercase tracking-wide text-[#ffffff]">{title}</h4>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#a0a0a0] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Mobile Accordion */}
        <div className="md:hidden">
          <AccordionSection title="About">
            <p className="text-sm text-[#a0a0a0] leading-relaxed">
              Premium baby products sourced from the USA & Japan. Online based in Cambodia.
            </p>
          </AccordionSection>
          <AccordionSection title="Contact">
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li className="flex items-center gap-2">
                <span>📧</span> hello@babyhaus.kh
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span> +855 12 345 678
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Phnom Penh, Cambodia
              </li>
            </ul>
          </AccordionSection>
          <AccordionSection title="Follow Us">
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://instagram.com/babyhaus.kh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4D9F] hover:underline"
              >
                📸 @babyhaus.kh on Instagram
              </a>
              <a
                href="https://t.me/narote"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4D9F] hover:underline"
              >
                ✈️ Chat on Telegram
              </a>
            </div>
          </AccordionSection>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-10">
          <div>
            <p className="text-xl font-bold mb-3 font-['Fredoka']">
              <span className="text-gradient">Baby</span>
              <span className="text-white">Haus</span>
            </p>
            <p className="text-[#a0a0a0] text-sm leading-relaxed">
              Premium baby products sourced from the USA & Japan. Online based in Cambodia.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#ffffff] mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-[#a0a0a0]">
              <li className="flex items-center gap-2">
                <span>📧</span> hello@babyhaus.kh
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span> +855 12 345 678
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Phnom Penh, Cambodia
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#ffffff] mb-3">
              Follow Us
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://instagram.com/babyhaus.kh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4D9F] hover:underline"
              >
                📸 @babyhaus.kh on Instagram
              </a>
              <a
                href="https://t.me/narote"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF4D9F] hover:underline"
              >
                ✈️ Chat on Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-white/5 flex items-center justify-center md:justify-between gap-3 text-xs text-[#a0a0a0]">
          <p>
            &copy; {new Date().getFullYear()} Baby Haus. All rights reserved.
          </p>
          <a 
            href="/admin" 
            className="hover:text-[#FF4D9F] transition-colors"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
