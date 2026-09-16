import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { consumeVerificationToken } from '@/lib/verification';

export const dynamic = 'force-dynamic';

export default async function VerifyEmail({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const user = token ? await consumeVerificationToken(token).catch(() => null) : null;

  return (
    <div className="container grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        {user ? (
          <>
            <CheckCircle2 className="mx-auto text-[#FF7200]" size={40} />
            <h1 className="mt-5 text-3xl font-bold">Email verified.</h1>
            <p className="mt-2 text-sm text-black/50">Thanks, {user.name || 'you'} — your Vendly account is confirmed.</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto text-black/40" size={40} />
            <h1 className="mt-5 text-3xl font-bold">That link has expired.</h1>
            <p className="mt-2 text-sm text-black/50">Verification links are valid for 48 hours. You can request a new one from your account page.</p>
          </>
        )}
        <Link href="/account" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Go to my account</Link>
      </div>
    </div>
  );
}
