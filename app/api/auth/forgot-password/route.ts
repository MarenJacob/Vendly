import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/app-url';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { issueResetToken } from '@/lib/password-reset';
import { sendEmail, resetPasswordEmailHtml } from '@/lib/email';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`forgot-password:${ip}`, 5, 60_000).ok) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 });
  }
  try {
    const { email } = await req.json();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (cleanEmail.includes('@')) {
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      // Only users with a password can reset one (Google-only accounts have none).
      if (user?.passwordHash) {
        const token = await issueResetToken(user.id);
        const appUrl = getAppUrl(req);
        await sendEmail(user.email, 'Reset your Vendly password', resetPasswordEmailHtml(user.name || '', `${appUrl}/account/reset-password?token=${token}`));
      }
    }
    // Same response either way — don't reveal whether the email is registered.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
