'use client';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/components/WishlistProvider';
import { useCatalog } from '@/components/useCatalog';

export default function Wishlist() {
  const { ids } = useWishlist();
  const { products, loading } = useCatalog();
  const saved = products.filter((p) => ids.includes(p.id));

  return (
    <div className="container py-12 md:py-16">
      <Link href="/shop" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-black/40"><ArrowLeft size={14} /> Continue shopping</Link>
      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="eyebrow text-black/40">Saved for later</p>
          <h1 className="mt-3 text-5xl font-bold tracking-[-.07em] md:text-7xl">Wishlist.</h1>
        </div>
        <Heart className="mb-2 hidden md:block" size={30} />
      </div>
      {loading ? (
        <div className="mt-12"><div className="skeleton h-10 w-52" /></div>
      ) : saved.length ? (
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-5">
          {saved.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-black/15 px-6 py-24 text-center">
          <Heart className="mx-auto text-black/30" size={32} />
          <h2 className="mt-5 text-xl font-bold">Your wishlist is waiting.</h2>
          <p className="mt-2 text-sm text-black/45">Save pieces you love and come back to them anytime.</p>
          <Link href="/shop" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Discover products</Link>
        </div>
      )}
    </div>
  );
}
