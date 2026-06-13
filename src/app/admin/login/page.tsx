import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import LoginForm from './LoginForm';

export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect('/admin');

  return (
    <main className="min-h-screen bg-[#06060a] text-[#f0ece4] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-wider text-[#c9a84c] mb-2">BABY HAUS</h1>
          <p className="text-[#9a9590] text-sm uppercase tracking-widest">Admin Portal</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
