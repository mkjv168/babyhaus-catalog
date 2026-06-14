import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';

export default async function AdminProducts() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');
  redirect('/admin');
}
