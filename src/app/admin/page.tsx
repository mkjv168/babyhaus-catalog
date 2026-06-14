import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminCommandCenter from '@/components/admin/AdminCommandCenter';

export default async function AdminDashboard() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const [products, orders, banners] = await Promise.all([
    prisma.product.findMany({
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.banner.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const categories = [...new Set(products.map((p) => p.category))].sort();

  // Serialize dates for client components
  const serializedOrders = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <AdminCommandCenter
      products={products}
      orders={serializedOrders}
      banners={banners}
      categories={categories}
      user={user}
    />
  );
}
