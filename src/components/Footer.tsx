import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#e8e4df]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="text-xl font-bold mb-3">
              <span className="text-[#d4a574]">Baby</span>
              <span className="text-[#2d2d2d]">Haus</span>
            </p>
            <p className="text-[#7a7a7a] text-sm leading-relaxed">
              Premium baby products sourced from the USA & Japan. Online based in Cambodia.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d2d2d] mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-[#7a7a7a]">
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

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2d2d2d] mb-3">
              Follow Us
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://instagram.com/babyhaus.kh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4a574] hover:underline"
              >
                📸 @babyhaus.kh on Instagram
              </a>
              <a
                href="https://t.me/narotee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4a574] hover:underline"
              >
                ✈️ Chat on Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#e8e4df] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#7a7a7a]">
            &copy; {new Date().getFullYear()} Baby Haus. All rights reserved.
          </p>
          <Link
            href="/admin"
            className="text-[10px] text-[#b0aba5] hover:text-[#7a7a7a] transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
