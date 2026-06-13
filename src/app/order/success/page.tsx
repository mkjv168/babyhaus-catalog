'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function OrderSuccess() {
  useEffect(() => {
    // Could trigger celebration animation or confetti here
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#2D2D2D] mb-4">
          Order Placed Successfully!
        </h1>
        
        <p className="text-lg text-[#6B6B6B] mb-8">
          Thank you for your order. We'll contact you via Telegram shortly to confirm the details.
        </p>

        <div className="bg-[#FFF0F5] rounded-2xl p-6 mb-8">
          <p className="text-sm text-[#6B6B6B] mb-2">What happens next?</p>
          <ol className="text-left space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#FF6B9D] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-[#2D2D2D]">You'll receive a message on Telegram confirming your order</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#FF6B9D] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-[#2D2D2D]">We'll arrange delivery details with you</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#FF6B9D] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-[#2D2D2D]">Your premium baby products will be delivered to your door</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-[#FF6B9D] text-white font-semibold rounded-full hover:bg-[#E85A8A] transition-colors"
          >
            Continue Shopping
          </Link>
          <a
            href="https://t.me/narote"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-[#F0E6DD] text-[#2D2D2D] font-semibold rounded-full hover:border-[#FF6B9D] hover:text-[#FF6B9D] transition-colors"
          >
            Contact on Telegram
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}