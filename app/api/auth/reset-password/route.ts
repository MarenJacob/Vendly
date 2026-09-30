import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { getUserByResetToken, clearResetToken } from '@/lib/password-reset';
import { COOKIE, TTL, createCustomerSession, hashPassword } from '@/lib/customer-auth';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`reset-password:${ip}`, 10, 60_000).ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }
  try {
    const { token, password } = await req.json();
    if (!token) return NextResponse.json({ error: 'Missing reset token.' }, { status: 400 });
    if (String(password || '').length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const user = await getUserByResetToken(String(token));
    if (!user) return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(String(password)) } });
    await clearResetToken(user.id);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, createCustomerSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TTL });
    return res;
  } catch {
    return NextResponse.json({ error: 'Could not reset your password.' }, { status: 500 });
  }
}
