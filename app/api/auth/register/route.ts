import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { COOKIE, TTL, createCustomerSession, hashPassword } from '@/lib/customer-auth';
import { verifyTurnstile } from '@/lib/turnstile';
import { issueVerificationToken } from '@/lib/verification';
import { sendEmail, verificationEmailHtml } from '@/lib/email';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`auth:${ip}`, 10, 60_000).ok) return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  try {
    const b = await req.json();
    const name = String(b.name || '').trim(), email = String(b.email || '').trim().toLowerCase(), phone = String(b.phone || '').trim(), password = String(b.password || '');
    if (name.length < 2 || !email.includes('@') || password.length < 8) return NextResponse.json({ error: 'Enter a valid name, email and password of at least 8 characters.' }, { status: 400 });
    if (!b.agreedToTerms) return NextResponse.json({ error: 'You must agree to the Terms & Conditions to create an account.' }, { status: 400 });
    if (!(await verifyTurnstile(b.turnstileToken, ip))) return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 400 });
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    const user = await prisma.user.create({ data: { name, email, phone: phone || null, passwordHash: hashPassword(password) } });
    try {
      const token = await issueVerificationToken(user.id);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
      await sendEmail(email, 'Verify your Vendly account', verificationEmailHtml(name, `${appUrl}/account/verify?token=${token}`));
    } catch (e) {
      console.error('[register] Verification email step failed:', e);
    }
    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
    res.cookies.set(COOKIE, createCustomerSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: TTL });
    return res;
  } catch { return NextResponse.json({ error: 'Could not create your account.' }, { status: 500 }); }
}
