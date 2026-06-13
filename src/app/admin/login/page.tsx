import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import LoginForm from './LoginForm';

export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect('/admin');

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-[#d4a574]">Baby</span><span className="text-[#2d2d2d]">Haus</span>
          </h1>
          <p className="text-[#7a7a7a] text-sm font-medium">Admin Portal</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e8e4df] p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
