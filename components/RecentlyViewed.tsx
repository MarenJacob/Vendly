'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatNaira } from '@/lib/products';
import { getRecentlyViewed, type RecentlyViewedEntry } from '@/lib/recentlyViewed';

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedEntry[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (!items.length) return null;

  return (
    <section className="container py-14">
      <p className="eyebrow text-black/45">Pick up where you left off</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-.05em] md:text-4xl">Recently viewed.</h2>
      <div className="mt-7 flex gap-4 overflow-x-auto pb-2">
        {items.map(item => (
          <Link key={item.id} href={`/product/${item.slug}`} className="group w-[220px] shrink-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#F7F8FA]">
              <Image src={item.image} alt={item.name} fill sizes="220px" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
            </div>
            <p className="mt-2.5 truncate text-[13px] font-semibold">{item.name}</p>
            <p className="text-[12px] font-semibold text-black/45">{formatNaira(item.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
