'use client';

import { useState } from 'react';

export default function OrderForm({ productId, productName, productPrice }: { productId: string; productName: string; productPrice: number | null }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, customerName: name, telegramPhone: phone, notes }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const telegramMessage = encodeURIComponent(
      `Hi Baby Haus, I am ${name}. I want to order: ${productName}${productPrice ? ` ($${productPrice.toFixed(2)})` : ''}. My Telegram: ${phone}. Please confirm!`
    );
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[#FF6B9D] mb-3">Order Request Received!</h2>
        <p className="text-[#6B6B6B] mb-6">Thank you, {name}! We have saved your request.</p>
        <a
          href={`https://t.me/narote?text=${telegramMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 bg-[#FF6B9D] text-white font-semibold rounded-full hover:bg-[#E85A8A] transition-colors"
        >
          Open Telegram Chat →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Your Name *</label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-white border border-[#F0E6DD] rounded-xl px-4 py-3 text-[#2D2D2D] focus:border-[#FF6B9D] focus:ring-2 focus:ring-[#FF6B9D]/20 focus:outline-none transition-all"
          placeholder="e.g. Sophea"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Telegram Phone Number *</label>
        <input
          type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full bg-white border border-[#F0E6DD] rounded-xl px-4 py-3 text-[#2D2D2D] focus:border-[#FF6B9D] focus:ring-2 focus:ring-[#FF6B9D]/20 focus:outline-none transition-all"
          placeholder="e.g. +855 12 345 678"
        />
        <p className="text-xs text-[#6B6B6B] mt-1.5">We will contact you on Telegram to confirm your order.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#6B6B6B] mb-2">Notes (Optional)</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          className="w-full bg-white border border-[#F0E6DD] rounded-xl px-4 py-3 text-[#2D2D2D] focus:border-[#FF6B9D] focus:ring-2 focus:ring-[#FF6B9D]/20 focus:outline-none transition-all resize-none"
          placeholder="Any special requests..."
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full px-8 py-4 bg-[#FF6B9D] text-white font-semibold rounded-full hover:bg-[#E85A8A] transition-colors disabled:opacity-50 text-center"
      >
        {loading ? 'Submitting...' : 'Submit Order Request'}
      </button>
    </form>
  );
}
