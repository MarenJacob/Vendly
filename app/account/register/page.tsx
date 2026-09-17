'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Turnstile from '@/components/Turnstile';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function AccountAuth() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, agreedToTerms: agreed, turnstileToken }) });
    const j = await r.json();
    if (!r.ok) { setError(j.error || 'Something went wrong.'); setBusy(false); return; }
    location.href = '/account';
  }

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-[rgba(0,0,0,0.4)]">Vendly account</p>
        <h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Create your account.</h1>
        <form onSubmit={submit} className="mt-8 grid gap-3">
          <input name="name" placeholder="Full name" className="input" required />
          <input name="phone" placeholder="Phone number (optional)" className="input" />
          <input name="email" type="email" placeholder="Email address" className="input" required />
          <input name="password" type="password" minLength={8} placeholder="Password" className="input" required />
          <Turnstile onToken={setTurnstileToken} />
          <label className="mt-1 flex items-start gap-2.5 text-xs leading-5 text-[rgba(0,0,0,0.6)]">
            <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            <span>I agree to Vendly&apos;s <Link href="/terms" className="font-semibold text-black underline underline-offset-2">Terms &amp; Conditions</Link> and <Link href="/privacy" className="font-semibold text-black underline underline-offset-2">Privacy Policy</Link>.</span>
          </label>
          <button disabled={busy} className="btn-primary mt-2 justify-center">{busy ? 'Please wait…' : 'Continue'}</button>
          {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        </form>
        <GoogleSignIn onSuccess={() => { location.href = '/account'; }} />
        <p className="mt-6 text-center text-sm text-[rgba(0,0,0,0.45)]"><Link className="font-semibold text-black underline underline-offset-4" href="/account/login">Already have an account? Sign in</Link></p>
      </div>
    </div>
  );
}
