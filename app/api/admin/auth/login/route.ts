import { NextResponse } from 'next/server';
import { createSession, COOKIE } from '@/lib/admin-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'; if(!rateLimit(`admin-login:${ip}`,5,60_000).ok)return NextResponse.json({error:'Too many login attempts. Please try again in a minute.'},{status:429});
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || '');

    if (!adminEmail || !adminPassword || email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE, createSession(email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
