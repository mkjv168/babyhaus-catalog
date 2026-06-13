'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Invalid username or password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">{error}</div>}
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Username</label>
        <input
          type="text" required value={username} onChange={e => setUsername(e.target.value)}
          className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm text-[#9a9590] uppercase tracking-wider mb-2">Password</label>
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-[#16161f] border border-white/10 px-4 py-3 text-[#f0ece4] focus:border-[#c9a84c] focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full px-8 py-4 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-sm hover:bg-[#ddb654] transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
