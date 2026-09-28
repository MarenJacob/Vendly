'use client';
import Link from 'next/link';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { formatNaira } from '@/lib/products';

function VerifyContent() {
  const params = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const { clear } = useCart();
  const [state, setState] = useState<'checking' | 'success' | 'failed'>('checking');
  const [amount, setAmount] = useState<number>();
  const [orderRef, setOrderRef] = useState('');
  const [error, setError] = useState('');
  const [diag, setDiag] = useState('');

  useEffect(() => {
    let active = true;
    if (!reference) {
      setState('failed');
      setError('Payment reference is missing.');
      return;
    }
    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.verified) {
          if (active) {
            setError(data.error || 'Payment could not be verified.');
            setDiag([data.code, data.detail].filter(Boolean).join(' — '));
            setState('failed');
          }
          return;
        }
        if (active) {
          setAmount(Number(data.amount) / 100);
          setOrderRef(String(data.reference || ''));
          setState('success');
          clear();
        }
      })
      .catch(() => {
        if (active) {
          setError('We could not reach the server to confirm your payment.');
          setDiag('network_error');
          setState('failed');
        }
      });
    return () => { active = false; };
  }, [reference, clear]);

  const success = state === 'success';
  return (
    <main className="container grid min-h-[65vh] place-items-center py-20">
      <div className="max-w-xl text-center">
        {state === 'checking' ? (
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${success ? 'bg-slate-950 text-white' : 'bg-red-100 text-red-700'}`}>
            {success ? <CheckCircle2 className="h-8 w-8" /> : <CircleAlert className="h-8 w-8" />}
          </div>
        )}
        <p className="eyebrow mt-6">{state === 'checking' ? 'Confirming payment' : success ? 'Payment confirmed' : 'Payment needs attention'}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {state === 'checking' ? 'Just a moment…' : success ? 'Your order is confirmed.' : 'We could not confirm this payment.'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          {reference && <>Reference <strong className="text-slate-950">{reference}</strong>. </>}
          {success
            ? <>Your payment has been verified securely{amount ? ` for ${formatNaira(amount)}` : ''}. A confirmation email is on its way — keep the reference for your records.</>
            : state === 'failed' ? error : 'We are checking the transaction directly with the payment provider.'}
        </p>
        {state === 'failed' && (
          <>
            <p className="mt-3 text-sm leading-7 text-slate-500">If money left your account, please <strong>don&apos;t pay again</strong> — message us with the reference above and we&apos;ll confirm it for you.</p>
            {diag && <p className="mt-3 break-words font-mono text-[11px] text-slate-400">Error code: {diag}</p>}
          </>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className="btn-primary" href="/shop">Continue shopping</Link>
          {success && <Link className="btn-secondary" href={`/track?ref=${encodeURIComponent(orderRef)}`}>Track my order</Link>}
          {state === 'failed' && <Link className="btn-secondary" href="/contact">Contact support</Link>}
          {state === 'failed' && <Link className="btn-secondary" href="/checkout">Return to checkout</Link>}
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return <Suspense fallback={<main className="container py-24 text-center">Checking payment…</main>}><VerifyContent /></Suspense>;
}
