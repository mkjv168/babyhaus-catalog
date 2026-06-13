'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { ProductImage } from './ProductImage';

interface CheckoutFormData {
  customerName: string;
  telegramPhone: string;
  deliveryAddress: string;
  notes: string;
  paymentMethod: 'cod' | 'bank';
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CheckoutFormData>({
    customerName: '',
    telegramPhone: '',
    deliveryAddress: '',
    notes: '',
    paymentMethod: 'cod'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create orders for each item in cart
      const orderPromises = items.map(item => 
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity,
            customerName: form.customerName,
            telegramPhone: form.telegramPhone,
            deliveryAddress: form.deliveryAddress,
            paymentMethod: form.paymentMethod,
            notes: form.notes
          })
        })
      );

      const responses = await Promise.all(orderPromises);
      const allSuccess = responses.every(res => res.ok);

      if (allSuccess) {
        // Clear cart and redirect to success page
        clearCart();
        router.push('/order/success');
      } else {
        setError('Failed to place order. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = totalPrice;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#2d2d2d] mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#2d2d2d]">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">
                  Your Name *
                </label>
                <input
                  name="customerName"
                  required
                  value={form.customerName}
                  onChange={handleChange}
                  className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">
                  Telegram Phone Number *
                </label>
                <input
                  name="telegramPhone"
                  required
                  value={form.telegramPhone}
                  onChange={handleChange}
                  className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all"
                  placeholder="+855 12 345 6789"
                />
                <p className="text-xs text-[#7a7a7a] mt-1">
                  We'll contact you via Telegram for order updates
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#2d2d2d]">Delivery Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">
                  Delivery Address *
                </label>
                <textarea
                  name="deliveryAddress"
                  required
                  rows={3}
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all resize-none"
                  placeholder="House number, street name, district, city"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#7a7a7a] mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full bg-[#faf8f5] border border-[#e8e4df] rounded-xl px-4 py-3 text-[#2d2d2d] focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 focus:outline-none transition-all resize-none"
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 space-y-5">
              <h2 className="text-lg font-bold text-[#2d2d2d]">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#d4a574]"
                  />
                  <div>
                    <p className="font-semibold text-[#2d2d2d] group-hover:text-[#d4a574] transition-colors">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-[#7a7a7a]">
                      Pay when you receive your order
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={form.paymentMethod === 'bank'}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-[#d4a574]"
                  />
                  <div>
                    <p className="font-semibold text-[#2d2d2d] group-hover:text-[#d4a574] transition-colors">
                      Bank Transfer
                    </p>
                    <p className="text-sm text-[#7a7a7a]">
                      Transfer to our bank account (details will be sent via Telegram)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full px-8 py-4 bg-[#d4a574] text-white font-bold rounded-full hover:bg-[#c49464] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Placing Order...' : `Place Order • $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 sticky top-20">
            <h2 className="text-lg font-bold text-[#2d2d2d] mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f5f1ec]">
                    <ProductImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2d2d2d] text-sm">{item.name}</h3>
                    <p className="text-xs text-[#7a7a7a] mt-1">Qty: {item.quantity}</p>
                    <p className="font-semibold text-[#d4a574] mt-1">
                      ${item.price ? (item.price * item.quantity).toFixed(2) : 'Ask'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#e8e4df] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#7a7a7a]">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#7a7a7a]">Delivery</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#e8e4df]">
                <span className="font-bold text-[#2d2d2d]">Total</span>
                <span className="font-bold text-lg text-[#d4a574]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}