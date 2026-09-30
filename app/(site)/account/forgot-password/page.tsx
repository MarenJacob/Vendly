'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setSent(true);
    setBusy(false);
  }

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md">
        {sent ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-[#FF7200]" size={36} />
            <h1 className="mt-5 text-3xl font-bold tracking-[-.05em]">Check your email.</h1>
            <p className="mt-3 text-sm leading-6 text-[rgba(0,0,0,0.5)]">If an account exists for that email, we&apos;ve sent a link to reset your password. It expires in 1 hour.</p>
            <Link href="/account/login" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Back to sign in</Link>
          </div>
        ) : (
          <>
            <p className="eyebrow text-[rgba(0,0,0,0.4)]">Vendly account</p>
            <h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Reset your password.</h1>
            <p className="mt-4 text-sm leading-6 text-[rgba(0,0,0,0.5)]">Enter the email on your account and we&apos;ll send you a reset link.</p>
            <form onSubmit={submit} className="mt-8 grid gap-3">
              <input name="email" type="email" placeholder="Email address" className="input" required />
              <button disabled={busy} className="btn-primary mt-2 justify-center">{busy ? 'Sending…' : 'Send reset link'}</button>
            </form>
            <p className="mt-6 text-center text-sm text-[rgba(0,0,0,0.45)]"><Link className="font-semibold text-black underline underline-offset-4" href="/account/login">Back to sign in</Link></p>
          </>
        )}
      </div>
    </div>
  );
}
