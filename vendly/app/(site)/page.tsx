import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import CampaignHero from '@/components/CampaignHero';
import CategoryRail from '@/components/CategoryRail';
import { getAllProducts, getCategoryNames } from '@/lib/catalog';
import type { Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

const CAMPAIGN_DEFS = [
  { eyebrow: '01 — Tech', headline: 'Upgrade Your Everyday.', sub: 'Phones, computers & accessories built for how you live and work.', cta: 'Shop Technology', match: ['Electronics & Gadgets', 'Phones, Computer & Mobile Accessories'] },
  { eyebrow: '02 — Home', headline: 'Make Home Feel Better.', sub: 'Appliances, kitchen essentials and smart living picks.', cta: 'Explore Home', match: ['Home Appliances', 'Home and Living', 'Kitchen'] },
  { eyebrow: '03 — Power', headline: 'Stay Powered. Stay Ready.', sub: 'Reliable power and energy solutions for everyday life.', cta: 'Shop Power', match: ['Power & Energy'] },
  { eyebrow: '04 — Trending', headline: "What's New Is Here.", sub: "Discover the products everyone's talking about.", cta: 'Explore Trending', match: ['New Arrivals & Trending'] },
];

function buildCampaigns(products: Product[]) {
  return CAMPAIGN_DEFS.map((def) => {
    const inCategory = products.filter((p) => def.match.includes(p.category));
    const pool = inCategory.length ? inCategory : products;
    if (!pool.length) return null;
    return {
      eyebrow: def.eyebrow,
      headline: def.headline,
      sub: def.sub,
      cta: def.cta,
      href: `/category/${encodeURIComponent(inCategory[0]?.category || pool[0].category)}`,
      images: pool.slice(0, 4).map((p) => p.image),
    };
  }).filter((c): c is NonNullable<typeof c> => c !== null);
}

export default async function Home() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const [products, categories] = await Promise.all([getAllProducts(), getCategoryNames()]);
  const campaigns = buildCampaigns(products);
  const trending = products.slice(0, 8);

  return (
    <>
      <section className="container pt-6 md:pt-10">
        <CampaignHero campaigns={campaigns} />
      </section>
      <CategoryRail categories={categories.filter((c) => c !== 'All')} />
      <RecentlyViewed />
      <section className="container py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-[rgba(0,0,0,0.5)]">Today&apos;s picks</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-.05em] md:text-5xl">Made to be seen.</h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-bold underline underline-offset-4 md:block">Shop all</Link>
        </div>
        {trending.length ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
            {trending.map((p) => <ProductCard key={p.id} product={p} hoverVideo />)}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-[rgba(0,0,0,0.15)] px-6 py-20 text-center">
            <p className="text-[rgba(0,0,0,0.5)]">Products coming soon! We&apos;re preparing the collection now.</p>
          </div>
        )}
      </section>
      <section className="bg-[#061426] text-white">
        <div className="container grid gap-14 py-24 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow text-[rgba(255,255,255,0.45)]">The Vendly difference</p>
            <h2 className="mt-5 text-5xl font-bold tracking-[-.06em] md:text-7xl">Confidence before checkout.</h2>
          </div>
          <div>
            <p className="max-w-md text-sm leading-7 text-[rgba(255,255,255,0.6)]">Static photos don&apos;t always tell the full story. Where available, category listings can include short product video previews using the product image as the visual starting point.</p>
            <div className="mt-8 grid gap-3 text-sm">
              {['Clear product information', 'Optional video previews', 'Direct customer support'].map((x) => (
                <div key={x} className="flex items-center gap-3"><Check size={16} />{x}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container py-24">
        <div className="rounded-[2px] border border-[rgba(0,0,0,0.1)] p-8 md:p-14">
          <p className="eyebrow text-[rgba(0,0,0,0.45)]">Need a closer look?</p>
          <div className="mt-4 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-bold tracking-[-.05em] md:text-6xl">Talk directly to Vendly before you buy.</h2>
            <a href={whatsapp ? `https://wa.me/${whatsapp}?text=Hello%20Vendly%2C%20I%20have%20a%20question%20about%20a%20product.` : '/contact'} style={{backgroundColor:'#061426',color:'#ffffff'}} className="inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3 text-sm font-bold">Message Vendly <ArrowUpRight className="ml-2" size={17} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
