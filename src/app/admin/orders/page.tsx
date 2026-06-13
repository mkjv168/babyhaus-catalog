import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from '../LogoutButton';
import StatusButton from './StatusButton';

export default async function AdminOrders() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const orders = await prisma.order.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4]">
      <header className="border-b border-white/5 bg-[#0e0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-wider text-[#c9a84c]">BABY HAUS ADMIN</Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin/products" className="text-[#9a9590] hover:text-[#c9a84c]">Products</Link>
              <Link href="/admin/orders" className="text-[#c9a84c]">Orders</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-8">Orders</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-[#9a9590]">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Telegram</th>
                <th className="pb-3 pr-4">Notes</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 text-sm text-[#9a9590]">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 font-medium">{o.product?.name || 'Unknown'}</td>
                  <td className="py-3 pr-4">{o.customerName}</td>
                  <td className="py-3 pr-4 text-[#c9a84c]">{o.telegramPhone}</td>
                  <td className="py-3 pr-4 text-sm text-[#9a9590] max-w-[200px] truncate">{o.notes || '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs uppercase px-2 py-1 rounded-sm ${o.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : o.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusButton id={o.id} currentStatus={o.status} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-[#9a9590]">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
