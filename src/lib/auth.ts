import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || 'babyhaus-secret-key-2024';

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('hex');
}

export function createToken(username: string): string {
  const payload = `${username}:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

export function verifyToken(token: string): string | null {
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  const [username, timestamp, signature] = parts;
  const payload = `${username}:${timestamp}`;
  const expected = sign(payload);
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  // Token valid for 7 days
  if (Date.now() - parseInt(timestamp) > 7 * 24 * 60 * 60 * 1000) return null;
  return username;
}

export async function getAdminUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<string> {
  const user = await getAdminUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}
