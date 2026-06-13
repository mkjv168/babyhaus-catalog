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
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-[#c9a84c] mb-3">Order Request Received</h2>
        <p className="text-[#9a9590] mb-6">Thank you, {name}! We have saved your request.</p>
        <a
          href={`https://t.me/narotee?text=${telegramMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-sm hover:bg-[#ddb654] transition-colors"
        >
          Open Telegram Chat
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Your Name *</label>
        <input
          type="text" required value={name} onChange={e => setName(e.target.value)}
          className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors"
          placeholder="e.g. Sophea"
        />
      </div>
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Telegram Phone Number *</label>
        <input
          type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors"
          placeholder="e.g. +855 12 345 678"
        />
        <p className="text-xs text-[#9a9590] mt-1">We will contact you on Telegram to confirm your order.</p>
      </div>
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Notes (Optional)</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors"
          placeholder="Any special requests..."
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full px-8 py-4 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-sm hover:bg-[#ddb654] transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Order Request'}
      </button>
    </form>
  );
}
