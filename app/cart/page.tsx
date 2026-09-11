'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatNaira } from '@/lib/products';
import { useCart } from '@/components/CartProvider';
import { useCatalog } from '@/components/useCatalog';

export default function Cart() {
  const { items, add, remove, clear } = useCart();
  const { products, loading } = useCatalog();
  const rows = items.map((i) => ({ item: i, product: products.find((p) => p.id === i.id) })).filter((x) => x.product);
  const total = rows.reduce((s, x) => s + x.product!.price * x.item.quantity, 0);

  if (loading) {
    return <div className="container py-16"><div className="skeleton h-10 w-52" /></div>;
  }

  return (
    <div className="container py-16">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-black/45">Your selection</p>
          <h1 className="mt-3 text-6xl font-bold tracking-[-.07em]">Cart.</h1>
        </div>
        {rows.length > 0 && <button onClick={clear} className="hidden items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/45 md:flex"><Trash2 size={14} /> Clear</button>}
      </div>
      {!rows.length ? (
        <div className="py-24 text-center">
          <ShoppingBag className="mx-auto" size={35} />
          <p className="mt-5 text-black/50">Your cart is empty.</p>
          <Link href="/shop" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 md:grid-cols-[1fr_360px]">
          <div className="divide-y divide-black/10">
            {rows.map(({ item, product: p }) => (
              <div key={p!.id} className="flex gap-4 py-5">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[#eee]">
                  <Image src={p!.image} alt={p!.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex flex-1 justify-between gap-4">
                  <div>
                    <p className="font-semibold">{p!.name}</p>
                    <p className="mt-1 text-xs text-black/45">{p!.category}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <button onClick={() => remove(p!.id)} className="rounded-full border border-black/10 p-1.5"><Minus size={13} /></button>
                      <span className="w-4 text-center text-xs">{item.quantity}</span>
                      <button onClick={() => add(p!.id)} className="rounded-full border border-black/10 p-1.5"><Plus size={13} /></button>
                    </div>
                  </div>
                  <p className="font-semibold">{formatNaira(p!.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit border border-black/10 p-6 md:sticky md:top-28">
            <div className="flex justify-between text-sm"><span>Total</span><strong>{formatNaira(total)}</strong></div>
            <p className="mt-2 text-xs text-black/40">Delivery charges are confirmed at checkout.</p>
            <Link href="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-black py-4 text-sm font-bold text-white">Checkout <ArrowRight size={16} /></Link>
          </div>
        </div>
      )}
    </div>
  );
}
