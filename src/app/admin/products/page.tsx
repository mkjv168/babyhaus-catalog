import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from '../LogoutButton';
import DeleteButton from './DeleteButton';

export default async function AdminProducts() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <header className="bg-white border-b border-[#e8e4df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-tight">
              <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span> Admin
            </Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin/products" className="text-[#d4a574] font-semibold">Products</Link>
              <Link href="/admin/orders" className="text-[#7a7a7a] hover:text-[#d4a574]">Orders</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link href="/admin/products/new" className="px-5 py-2.5 bg-[#d4a574] text-white font-semibold rounded-full hover:bg-[#c49464] transition-colors text-sm">
            + Add Product
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e4df] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e8e4df] text-xs font-semibold uppercase tracking-wider text-[#7a7a7a]">
                  <th className="pb-3 pt-4 px-6">Image</th>
                  <th className="pb-3 pt-4 pr-4">Name</th>
                  <th className="pb-3 pt-4 pr-4">Brand</th>
                  <th className="pb-3 pt-4 pr-4">Category</th>
                  <th className="pb-3 pt-4 pr-4">Price</th>
                  <th className="pb-3 pt-4 pr-4">Stock</th>
                  <th className="pb-3 pt-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-[#e8e4df]/60 hover:bg-[#faf8f5]">
                    <td className="py-3 px-6">
                      <div className="w-12 h-12 relative bg-[#f5f1ec] rounded-xl overflow-hidden">
                        {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" /> : <span className="text-lg flex items-center justify-center h-full">👶</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold">{p.name}</td>
                    <td className="py-3 pr-4 text-[#7a7a7a]">{p.brand || '-'}</td>
                    <td className="py-3 pr-4 text-[#7a7a7a]">{p.category}</td>
                    <td className="py-3 pr-4 text-[#d4a574] font-semibold">{p.price ? `$${p.price.toFixed(2)}` : '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.stockStatus === 'instock' ? 'bg-green-50 text-green-600' : p.stockStatus === 'preorder' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex gap-3">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-sm text-[#d4a574] hover:underline font-medium">Edit</Link>
                        <DeleteButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
