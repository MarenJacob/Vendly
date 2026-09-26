'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

type Campaign = { eyebrow: string; headline: string; sub: string; cta: string; href: string; images: string[] };

export default function CampaignHero({ campaigns }: { campaigns: Campaign[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (campaigns.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % campaigns.length), 6000);
    return () => clearInterval(id);
  }, [campaigns.length]);

  if (!campaigns.length) return null;
  const c = campaigns[index];

  return (
    <div className="relative grid gap-8 overflow-hidden rounded-[28px] bg-[#061426] p-7 text-white sm:p-10 md:grid-cols-2 md:items-center md:p-16">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF7200] opacity-20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-[#F50063] opacity-10 blur-[100px]" />
      <div className="relative z-10">
        <p className="eyebrow brand-gradient-text">{c.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.02] tracking-[-.04em] sm:text-5xl md:text-6xl">{c.headline}</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-[rgba(255,255,255,0.65)]">{c.sub}</p>
        <Link href={c.href} className="btn-gradient mt-8 inline-flex px-7 py-3.5 text-[13px]">{c.cta} <ArrowUpRight size={17} /></Link>
        {campaigns.length > 1 && (
          <div className="mt-9 flex gap-1.5">
            {campaigns.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Show campaign ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-[#FF7200]' : 'w-1.5 bg-[rgba(255,255,255,0.25)]'}`} />
            ))}
          </div>
        )}
      </div>
      <div className="relative z-10 hidden aspect-square md:block">
        <div className="absolute inset-0 grid grid-cols-2 gap-3">
          {c.images.slice(0, 4).map((src, i) => (
            <div key={src + i} className={`relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.92)] shadow-[0_20px_60px_rgba(0,0,0,.35)] ${i === 0 ? 'row-span-2' : ''}`}>
              <Image src={src} alt="" fill sizes="240px" className="object-contain p-4" />
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.92)] md:hidden">
        {c.images[0] && <Image src={c.images[0]} alt="" fill sizes="100vw" className="object-contain p-6" />}
      </div>
    </div>
  );
}
