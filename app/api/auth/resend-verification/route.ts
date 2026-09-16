import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/customer-auth';
import { issueVerificationToken } from '@/lib/verification';
import { sendEmail, verificationEmailHtml } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const user = await getCustomer();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.emailVerifiedAt) return NextResponse.json({ ok: true, alreadyVerified: true });
  if (!rateLimit(`resend-verify:${user.id}`, 3, 5 * 60_000).ok) return NextResponse.json({ error: 'Please wait a few minutes before requesting another email.' }, { status: 429 });
  const token = await issueVerificationToken(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  await sendEmail(user.email, 'Verify your Vendly account', verificationEmailHtml(user.name || '', `${appUrl}/account/verify?token=${token}`));
  return NextResponse.json({ ok: true });
}
