'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StatusButton({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const nextStatus = status === 'pending' ? 'confirmed' : status === 'confirmed' ? 'delivered' : 'pending';

  return (
    <button
      onClick={() => updateStatus(nextStatus)}
      disabled={loading}
      className="text-xs text-[#9a9590] hover:text-[#c9a84c] underline disabled:opacity-50"
    >
      {loading ? '...' : `Mark ${nextStatus}`}
    </button>
  );
}
