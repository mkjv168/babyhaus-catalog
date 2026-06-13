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
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4]">
      <header className="border-b border-white/5 bg-[#0e0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-wider text-[#c9a84c]">BABY HAUS ADMIN</Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin/products" className="text-[#9a9590] hover:text-[#c9a84c] transition-colors">Products</Link>
              <Link href="/admin/orders" className="text-[#9a9590] hover:text-[#c9a84c] transition-colors">Orders</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-[#9a9590] text-sm mb-8">Signed in as <span className="text-[#c9a84c]">{user}</span></p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0e0e14] border border-white/5 p-6">
            <p className="text-[#9a9590] text-xs uppercase tracking-widest mb-2">Total Products</p>
            <p className="text-4xl font-bold text-[#c9a84c]">{productCount}</p>
          </div>
          <div className="bg-[#0e0e14] border border-white/5 p-6">
            <p className="text-[#9a9590] text-xs uppercase tracking-widest mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-[#c9a84c]">{orderCount}</p>
          </div>
          <div className="bg-[#0e0e14] border border-white/5 p-6">
            <p className="text-[#9a9590] text-xs uppercase tracking-widest mb-2">Pending Orders</p>
            <p className="text-4xl font-bold text-[#c9a84c]">{pendingOrders}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/admin/products/new" className="px-6 py-3 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-sm hover:bg-[#ddb654] transition-colors">
            + Add Product
          </Link>
          <Link href="/admin/products" className="px-6 py-3 border border-white/10 text-[#f0ece4] font-semibold tracking-wider uppercase text-sm hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="px-6 py-3 border border-white/10 text-[#f0ece4] font-semibold tracking-wider uppercase text-sm hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors">
            View Orders
          </Link>
        </div>
      </section>
    </main>
  );
}
