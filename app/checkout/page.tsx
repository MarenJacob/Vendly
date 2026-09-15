'use client';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LockKeyhole, ShoppingBag } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { formatNaira } from '@/lib/products';
import { useCart } from '@/components/CartProvider';
import { useCatalog } from '@/components/useCatalog';

export default function Checkout() {
  const { items, clear } = useCart();
  const { products, loading: catalogLoading, error: catalogError } = useCatalog();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const rows = useMemo(() => items.map((i) => ({ item: i, product: products.find((p) => p.id === i.id) })).filter((x) => x.product), [items, products]);
  const total = rows.reduce((sum, x) => sum + x.product!.price * x.item.quantity, 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const orderRes = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: form, items }) });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || 'Unable to create order.');
      setReference(order.reference);
      const paymentRes = await fetch('/api/paystack/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, reference: order.reference }) });
      const payment = await paymentRes.json();
      if (paymentRes.ok && payment.authorizationUrl) {
        window.location.href = payment.authorizationUrl;
        return;
      }
      if (paymentRes.status === 503) {
        clear();
        return;
      }
      throw new Error(payment.error || 'Payment could not be initialized.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (catalogLoading) {
    return <div className="container py-16"><div className="skeleton h-10 w-52" /></div>;
  }

  if (catalogError && items.length > 0 && !rows.length) {
    return (
      <main className="container grid min-h-[65vh] place-items-center py-20 text-center">
        <div>
          <AlertTriangle className="mx-auto h-9 w-9" />
          <h1 className="mt-5 text-3xl font-semibold">Couldn&apos;t load your cart.</h1>
          <p className="mt-2 text-sm text-slate-500">We had trouble reaching the store just now.</p>
          <button onClick={() => location.reload()} className="btn-primary mt-7">Retry</button>
        </div>
      </main>
    );
  }

  if (!rows.length) {
    return (
      <main className="container grid min-h-[65vh] place-items-center py-20 text-center">
        <div>
          <ShoppingBag className="mx-auto h-9 w-9" />
          <h1 className="mt-5 text-3xl font-semibold">Your cart is empty.</h1>
          <p className="mt-2 text-sm text-slate-500">Add something before checking out.</p>
          <Link className="btn-primary mt-7" href="/shop">Back to shop</Link>
        </div>
      </main>
    );
  }

  if (reference && !loading) {
    return (
      <main className="container grid min-h-[65vh] place-items-center py-20 text-center">
        <div className="max-w-lg">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-950 text-white"><Check /></div>
          <p className="eyebrow mt-6">Order created</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Ready for payment.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-500">Reference <strong className="text-slate-950">{reference}</strong>. Connect Paystack credentials to send the customer to secure payment.</p>
          <Link className="btn-primary mt-7" href="/shop">Continue shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"><ArrowLeft className="h-4 w-4" />Back to cart</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_390px]">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Delivery details.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Tell us where to deliver your order. Payment is handled securely through Paystack when production credentials are configured.</p>
          <form onSubmit={submit} className="mt-10 max-w-2xl space-y-5">
            <Field label="Full name"><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone number"><input required type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Email address"><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            </div>
            <Field label="Delivery address"><textarea required rows={4} className="input h-auto py-3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <button disabled={loading} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Preparing secure payment…' : <>Continue to payment<ArrowRight className="h-4 w-4" /></>}</button>
            <p className="flex items-center justify-center gap-2 text-xs text-slate-400"><LockKeyhole className="h-3.5 w-3.5" />Secure payment processing</p>
          </form>
        </div>
        <aside className="h-fit rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-28">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-6 divide-y divide-slate-100">
            {rows.map(({ item, product: p }) => (
              <div key={p!.id} className="flex justify-between gap-4 py-4 text-sm"><span>{p!.name}<span className="text-slate-400">×{item.quantity}</span></span><strong>{formatNaira(p!.price * item.quantity)}</strong></div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-slate-200 pt-5"><span className="font-medium">Total</span><strong>{formatNaira(total)}</strong></div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">{label}</span>{children}</label>;
}
