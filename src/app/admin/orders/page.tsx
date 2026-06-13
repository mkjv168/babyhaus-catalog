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
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <header className="bg-white border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span> Admin
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin/products" className="text-[#7a7a7a] hover:text-[#d4a574]">Products</Link>
              <Link href="/admin/orders" className="text-[#d4a574] font-semibold">Orders</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-8">Orders</h1>

        <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e8e4df] text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
                  <th className="pb-3 pt-4 px-6">Date</th>
                  <th className="pb-3 pt-4 pr-4">Product</th>
                  <th className="pb-3 pt-4 pr-4">Customer</th>
                  <th className="pb-3 pt-4 pr-4">Telegram</th>
                  <th className="pb-3 pt-4 pr-4">Notes</th>
                  <th className="pb-3 pt-4 pr-4">Status</th>
                  <th className="pb-3 pt-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-[#e8e4df]/60 hover:bg-[#faf8f5]">
                    <td className="py-3 px-6 text-sm text-[#7a7a7a]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 font-semibold">{o.product?.name || 'Unknown'}</td>
                    <td className="py-3 pr-4">{o.customerName}</td>
                    <td className="py-3 pr-4 text-[#d4a574] font-medium">{o.telegramPhone}</td>
                    <td className="py-3 pr-4 text-sm text-[#7a7a7a] max-w-[200px] truncate">{o.notes || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        o.status === 'pending' ? 'bg-amber-50 text-amber-600' : o.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <StatusButton id={o.id} currentStatus={o.status} />
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-[#7a7a7a]">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
