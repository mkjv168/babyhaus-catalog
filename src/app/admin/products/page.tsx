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
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4]">
      <header className="border-b border-white/5 bg-[#0e0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold tracking-wider text-[#c9a84c]">BABY HAUS ADMIN</Link>
            <nav className="hidden sm:flex gap-4 text-sm">
              <Link href="/admin/products" className="text-[#c9a84c]">Products</Link>
              <Link href="/admin/orders" className="text-[#9a9590] hover:text-[#c9a84c]">Orders</Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link href="/admin/products/new" className="px-4 py-2 bg-[#c9a84c] text-[#06060a] font-semibold tracking-wider uppercase text-xs hover:bg-[#ddb654] transition-colors">
            + Add Product
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-[#9a9590]">
                <th className="pb-3 pr-4">Image</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Brand</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Stock</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <div className="w-12 h-12 relative bg-[#16161f] rounded-sm overflow-hidden">
                      {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} fill className="object-cover" /> : <span className="text-[#c9a84c]/30 text-xs flex items-center justify-center h-full">N/A</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  <td className="py-3 pr-4 text-[#9a9590]">{p.brand || '-'}</td>
                  <td className="py-3 pr-4 text-[#9a9590]">{p.category}</td>
                  <td className="py-3 pr-4 text-[#c9a84c]">{p.price ? `$${p.price.toFixed(2)}` : '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs uppercase ${p.stockStatus === 'instock' ? 'text-green-400' : 'text-red-400'}`}>{p.stockStatus}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-[#9a9590] hover:text-[#c9a84c] underline">Edit</Link>
                      <DeleteButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
