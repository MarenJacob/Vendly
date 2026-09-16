import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { COOKIE, TTL, createCustomerSession } from '@/lib/customer-auth';
import { verifyGoogleIdToken } from '@/lib/google-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`auth:${ip}`, 10, 60_000).ok) return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  try {
    const { idToken } = await req.json();
    const info = await verifyGoogleIdToken(String(idToken || ''));
    if (!info) return NextResponse.json({ error: 'Could not verify your Google account.' }, { status: 401 });
    let user = await prisma.user.findUnique({ where: { email: info.email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: info.email, name: info.name || null, emailVerifiedAt: new Date() } });
    } else if (!user.emailVerifiedAt) {
      // Google already verified this address, so trust it.
      user = await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    }
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(COOKIE, createCustomerSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TTL });
    return res;
  } catch (e) {
    console.error('[auth/google] failed:', e);
    return NextResponse.json({ error: 'Could not sign you in with Google.' }, { status: 500 });
  }
}
