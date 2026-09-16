import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { getProductBySlug } from '@/lib/catalog';
import { formatNaira } from '@/lib/products';
import AddToCart from '@/components/AddToCart';
import ProductGallery from '@/components/ProductGallery';
import WishlistButton from '@/components/WishlistButton';
import TrackProductView from '@/components/TrackProductView';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return notFound();
  const p = product;
  return (
    <div className="container py-8 md:py-12">
      <TrackProductView product={p} />
      <Link href="/shop" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-black/40"><ArrowLeft size={14} /> Back to shop</Link>
      <div className="mt-8 grid gap-10 md:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <ProductGallery product={p} />
        <div className="md:sticky md:top-28 md:self-start">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="eyebrow text-black/40">{p.category}</p>
              <h1 className="mt-4 text-5xl font-bold tracking-[-.075em] md:text-6xl">{p.name}</h1>
            </div>
            <WishlistButton productId={p.id} />
          </div>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-xl font-semibold">{formatNaira(p.price)}</span>
            {p.oldPrice && <span className="text-sm text-black/30 line-through">{formatNaira(p.oldPrice)}</span>}
          </div>
          {p.isPreorder ? (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-black px-4 py-3 text-xs text-white">
              <span className="font-bold uppercase tracking-[.1em]">Preorder</span>
              <span className="text-white/70">{p.preorderNote || 'This item ships once it arrives in stock.'}</span>
            </div>
          ) : (p.stock ?? 1) <= 0 ? (
            <div className="mt-4 rounded-2xl bg-black/5 px-4 py-3 text-xs font-semibold text-black/50">Currently out of stock</div>
          ) : null}
          <p className="mt-6 text-sm leading-7 text-black/55">{p.description}</p>
          {p.sizes && (
            <div className="mt-8">
              <p className="text-xs font-bold">Select size</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.sizes.map((x) => <button key={x} className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold hover:border-black">{x}</button>)}
              </div>
            </div>
          )}
          <div className="mt-8">
            <AddToCart productId={p.id} isPreorder={p.isPreorder} outOfStock={!p.isPreorder && (p.stock ?? 1) <= 0} />
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Vendly, I'm interested in ${p.name}. Is it available?`)}`} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-black/15 py-4 text-sm font-bold"><MessageCircle size={17} /> Message Vendly</a>
          </div>
          <div className="mt-9 grid gap-3 border-t border-black/10 pt-6 text-xs text-black/55">
            <div className="flex items-center gap-3"><ShieldCheck size={16} /> Secure checkout with Paystack</div>
            <div className="flex items-center gap-3"><Truck size={16} /> Delivery arranged at checkout</div>
            <div className="flex items-center gap-3"><RotateCcw size={16} /> Contact support for returns & exchanges</div>
          </div>
        </div>
      </div>
    </div>
  );
}
