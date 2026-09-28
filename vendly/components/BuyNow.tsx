'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Zap, LoaderCircle } from 'lucide-react';
import { useCart } from './CartProvider';

export default function BuyNow({ productId, outOfStock }: { productId: string; outOfStock?: boolean }) {
  const { buyNow } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (outOfStock || busy) return;
    setBusy(true);
    const ok = await buyNow(productId);
    if (ok) router.push('/checkout');
    else setBusy(false);
  }

  return (
    <button
      type="button"
      disabled={outOfStock || busy}
      onClick={go}
      style={outOfStock ? undefined : { backgroundColor: '#061426', color: '#ffffff' }}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold transition-all hover:brightness-125 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-[rgba(0,0,0,0.08)] disabled:text-[rgba(0,0,0,0.35)]"
    >
      {busy ? <LoaderCircle size={17} className="animate-spin" /> : <Zap size={17} />} {busy ? 'Taking you to checkout…' : 'Buy now'}
    </button>
  );
}
