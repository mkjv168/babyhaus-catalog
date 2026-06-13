import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import Link from 'next/link';
import LogoutButton from '../../LogoutButton';
import ProductForm from '../ProductForm';

export default async function NewProductPage() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

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
        <h1 className="text-2xl font-bold mb-8">Add New Product</h1>
        <ProductForm />
      </section>
    </main>
  );
}
