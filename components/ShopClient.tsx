'use client';

import { useMemo, useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/products';

export default function ShopClient({ products, categories }: { products: Product[]; categories: string[] }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('featured');
  useEffect(() => { const value = new URLSearchParams(window.location.search).get('q'); if (value) setQ(value); }, []);

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      const matchesCategory = cat === 'All' || p.category === cat;
      const searchable = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      return matchesCategory && searchable.includes(q.toLowerCase().trim());
    });
    return [...result].sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'newest') return b.id.localeCompare(a.id);
      return 0;
    });
  }, [products, cat, q, sort]);

  return (
    <div className="container py-8 md:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow text-black/45">Category listing</p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><h1 className="mt-3 text-5xl font-bold tracking-[-.06em] md:text-7xl">Shop all.</h1><div className="hidden rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-black/45 sm:block">Curated in Nigeria · 2026</div></div>
        <p className="mt-5 max-w-xl text-sm leading-7 text-black/50">Explore the catalogue. Products with available video previews are marked directly on their listing.</p>
      </div>

      <div className="sticky top-[72px] z-40 mt-10 border-y border-black/10 bg-[#faf9f6]/95 py-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-black/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, categories..." aria-label="Search products" className="w-full border-b border-black/15 bg-transparent py-3 pl-7 pr-8 text-sm outline-none focus:border-black" />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="absolute right-1 top-1/2 -translate-y-1/2 text-black/45"><X size={16} /></button>}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[55%]">
            <button onClick={() => setCat('All')} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${cat === 'All' ? 'border-black bg-black text-white' : 'border-black/10 bg-white'}`}><SlidersHorizontal className="mr-1 inline h-3.5 w-3.5" />All</button>
            {categories.filter((c) => c !== 'All').map((c) => <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold ${cat === c ? 'border-black bg-black text-white' : 'border-black/10 bg-white'}`}>{c}</button>)}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className="w-full border border-black/10 bg-white px-3 py-2.5 text-xs outline-none lg:w-44">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between py-7 text-xs text-black/45">
        <span>{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</span>
        {(q || cat !== 'All') && <button onClick={() => { setQ(''); setCat('All'); }} className="font-bold text-black underline underline-offset-4">Clear filters</button>}
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-5 md:gap-y-14">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="border border-dashed border-black/15 py-24 text-center">
          <h2 className="text-xl font-bold">{products.length ? 'Nothing matched your search.' : 'No products yet.'}</h2>
          <p className="mt-2 text-sm text-black/45">{products.length ? 'Try a different product name or category.' : 'Check back soon — new items are on the way.'}</p>
        </div>
      )}
    </div>
  );
}
