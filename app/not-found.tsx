import Link from 'next/link';

export default function NotFound() {
  return <div className="container grid min-h-[60vh] place-items-center py-20 text-center"><div><p className="eyebrow text-black/45">404</p><h1 className="mt-3 text-5xl font-bold tracking-[-.06em]">Not found.</h1><p className="mt-4 text-sm text-black/50">That product or page may have moved.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Back to shop</Link></div></div>;
}
