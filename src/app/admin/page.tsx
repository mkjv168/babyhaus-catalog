import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import AdminBannerSection from '@/components/AdminBannerSection';

export default async function AdminDashboard() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const [productCount, orderCount, pendingOrders, lowStockProducts, recentOrders, banners] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.product.findMany({
      where: { stockStatus: 'instock', stockQuantity: { lte: 5, gt: 0 } },
      orderBy: { stockQuantity: 'asc' },
      take: 5,
    }),
    prisma.order.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.banner.findMany({
      orderBy: { order: 'asc' }
    })
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

        {/* Stat Cards */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">⚠️ Low Stock Alert</h2>
              {lowStockProducts.length > 0 && (
                <span className="text-xs font-bold bg-red-50 text-red-500 px-2.5 py-1 rounded-full">
                  {lowStockProducts.length} items
                </span>
              )}
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-[#7a7a7a]">All products are well stocked.</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-[#7a7a7a]">{p.category}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">{p.stockQuantity} left</span>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/products"
              className="mt-4 inline-block text-sm font-semibold text-[#d4a574] hover:text-[#c49464] transition-colors"
            >
              Manage Inventory →
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">📬 Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-sm font-semibold text-[#d4a574] hover:text-[#c49464] transition-colors"
              >
                View All →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-[#7a7a7a]">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold">{o.product?.name || 'Unknown'}</p>
                      <p className="text-xs text-[#7a7a7a]">{o.customerName} • {o.telegramPhone}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        o.status === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : o.status === 'confirmed'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Banner Management Section */}
        <div className="mb-10">
          <AdminBannerSection initialBanners={banners} />
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
