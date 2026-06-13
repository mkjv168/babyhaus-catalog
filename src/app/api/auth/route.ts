import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = createToken(username);
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_session', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60, path: '/' });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
