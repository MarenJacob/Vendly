import { NextResponse } from 'next/server';
import { rateLimit, recordFailure, isSuspicious, clearFailures } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { COOKIE, TTL, createCustomerSession, verifyPassword } from '@/lib/customer-auth';
import { verifyTurnstile } from '@/lib/turnstile';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`auth:${ip}`, 10, 60_000).ok) return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  try {
    const b = await req.json();
    const email = String(b.email || '').trim().toLowerCase(), password = String(b.password || '');
    const failKey = `login-fail:${ip}:${email}`;
    const suspicious = isSuspicious(failKey);
    if (suspicious && !(await verifyTurnstile(b.turnstileToken, ip))) {
      return NextResponse.json({ error: 'Verification required.', requireTurnstile: true }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      recordFailure(failKey);
      const nowSuspicious = isSuspicious(failKey);
      return NextResponse.json({ error: 'Invalid email or password.', requireTurnstile: nowSuspicious }, { status: 401 });
    }
    clearFailures(failKey);
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(COOKIE, createCustomerSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TTL });
    return res;
  } catch { return NextResponse.json({ error: 'Could not sign you in.' }, { status: 500 }); }
}
