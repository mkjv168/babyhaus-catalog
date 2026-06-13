import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from '../LogoutButton';
import OrdersClient from './OrdersClient';

export default async function AdminOrders() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const orders = await prisma.order.findMany({
    include: { product: { select: { name: true } } },
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
        <OrdersClient orders={orders} />
      </section>
    </main>
  );
}
