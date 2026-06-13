import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default async function AdminDashboard() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const [productCount, orderCount, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
  ]);

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <header className="bg-white border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span> Admin
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin/products" className="text-[#7a7a7a] hover:text-[#d4a574] transition-colors">Products</Link>
              <Link href="/admin/orders" className="text-[#7a7a7a] hover:text-[#d4a574] transition-colors">Orders</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-[#7a7a7a] text-sm mb-6">Signed in as <span className="text-[#d4a574] font-semibold">{user}</span></p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
            <p className="text-[#7a7a7a] text-xs font-semibold uppercase tracking-wider mb-2">Total Products</p>
            <p className="text-4xl font-bold text-[#d4a574]">{productCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
            <p className="text-[#7a7a7a] text-xs font-semibold uppercase tracking-wider mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-[#d4a574]">{orderCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
            <p className="text-[#7a7a7a] text-xs font-semibold uppercase tracking-wider mb-2">Pending Orders</p>
            <p className="text-4xl font-bold text-[#d4a574]">{pendingOrders}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="px-6 py-3 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors text-sm">
            + Add Product
          </Link>
          <Link href="/admin/products" className="px-6 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-sm">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="px-6 py-3 border border-[#e8e4df] text-[#2d2d2d] font-semibold rounded-full hover:border-[#d4a574] hover:text-[#d4a574] transition-colors text-sm">
            View Orders
          </Link>
        </div>
      </section>
    </main>
  );
}
