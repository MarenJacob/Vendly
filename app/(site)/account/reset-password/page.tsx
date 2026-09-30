'use client';
import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PasswordInput from '@/components/PasswordInput';

function ResetForm() {
  const token = useSearchParams().get('token') || '';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, token }) });
    const j = await r.json();
    if (!r.ok) { setError(j.error || 'Something went wrong.'); setBusy(false); return; }
    setDone(true);
    setTimeout(() => { location.href = '/account'; }, 1200);
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-[-.05em]">Invalid reset link.</h1>
        <p className="mt-3 text-sm text-[rgba(0,0,0,0.5)]">This link is missing its reset token.</p>
        <Link href="/account/forgot-password" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-[-.05em]">Password updated.</h1>
        <p className="mt-3 text-sm text-[rgba(0,0,0,0.5)]">Taking you to your account…</p>
      </div>
    );
  }

  return (
    <>
      <p className="eyebrow text-[rgba(0,0,0,0.4)]">Vendly account</p>
      <h1 className="mt-4 text-5xl font-bold tracking-[-.07em]">Set a new password.</h1>
      <form onSubmit={submit} className="mt-8 grid gap-3">
        <PasswordInput name="password" minLength={8} placeholder="New password" required />
        {error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="btn-primary mt-2 justify-center">{busy ? 'Updating…' : 'Update password'}</button>
      </form>
    </>
  );
}

export default function ResetPassword() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <Suspense fallback={<div className="skeleton h-10 w-52" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
