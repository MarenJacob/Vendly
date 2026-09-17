import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import { getAllProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const products = await getAllProducts();
  const hero = products[3] ?? products[0];
  const trending = products.slice(0, 8);

  return (
    <>
      <section className="container pt-8 md:pt-12">
        <div className="relative min-h-[620px] overflow-hidden bg-[#F7F8FA] md:min-h-[720px]">
          {hero && (
            <Image src={hero.image} alt="Vendly fashion collection" fill priority className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] via-[rgba(0,0,0,0.1)] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 text-white md:p-14">
            <p className="eyebrow">Curated for everyday confidence</p>
            <h1 className="display mt-5 max-w-4xl">Shop products.<br />See them closer.</h1>
            <p className="mt-7 max-w-md text-sm leading-6 text-[rgba(255,255,255,0.75)]">Discover a considered collection with clear product details, optional video previews and direct access to Vendly support.</p>
            <Link href="/shop" className="btn-gradient mt-8 inline-flex px-7 py-3.5 text-[13px]">Explore the collection <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>
      <RecentlyViewed />
      <section className="container py-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-[rgba(0,0,0,0.5)]">Trending now</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-.05em] md:text-5xl">Made to be seen.</h2>
          </div>
          <Link href="/shop" className="hidden text-sm font-bold underline underline-offset-4 md:block">Shop all</Link>
        </div>
        {trending.length ? (
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-[rgba(0,0,0,0.15)] px-6 py-20 text-center">
            <p className="text-[rgba(0,0,0,0.5)]">No products yet. Add your first product from the admin dashboard.</p>
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
            <a href={whatsapp ? `https://wa.me/${whatsapp}?text=Hello%20Vendly%2C%20I%20have%20a%20question%20about%20a%20product.` : '/contact'} className="inline-flex shrink-0 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Message Vendly <ArrowUpRight className="ml-2" size={17} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
