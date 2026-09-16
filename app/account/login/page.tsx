'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Turnstile from '@/components/Turnstile';
import GoogleSignIn from '@/components/GoogleSignIn';

export default function AccountAuth() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [needsTurnstile, setNeedsTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, turnstileToken }) });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || 'Something went wrong.');
      if (j.requireTurnstile) setNeedsTurnstile(true);
      setBusy(false);
      return;
    }
    location.href = '/account';
  }

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-black/40">Vendly account</p>
        <h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Welcome back.</h1>
        <form onSubmit={submit} className="mt-8 grid gap-3">
          <input name="email" type="email" placeholder="Email address" className="input" required />
          <input name="password" type="password" minLength={8} placeholder="Password" className="input" required />
          {needsTurnstile && <Turnstile onToken={setTurnstileToken} />}
          <button disabled={busy} className="btn-primary mt-2 justify-center">{busy ? 'Please wait…' : 'Continue'}</button>
          {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        </form>
        <GoogleSignIn onSuccess={() => { location.href = '/account'; }} />
        <p className="mt-6 text-center text-sm text-black/45"><Link className="font-semibold text-black underline underline-offset-4" href="/account/register">New to Vendly? Create an account</Link></p>
      </div>
    </div>
  );
}
