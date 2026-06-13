'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteButton({ id, onDelete }: { id: string; onDelete?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onDelete) {
          onDelete();
        } else {
          router.refresh();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-sm text-red-400 hover:text-red-500 font-medium disabled:opacity-50">
      {loading ? '...' : 'Delete'}
    </button>
  );
}
