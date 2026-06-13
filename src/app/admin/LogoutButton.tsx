'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="text-sm text-[#9a9590] hover:text-[#c9a84c] transition-colors">
      Logout
    </button>
  );
}
