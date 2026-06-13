import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import Link from 'next/link';
import LogoutButton from '../../LogoutButton';
import ProductForm from '../ProductForm';

export default async function NewProductPage() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

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
        <h1 className="text-2xl font-bold mb-8">Add New Product</h1>
        <ProductForm />
      </section>
    </main>
  );
}
