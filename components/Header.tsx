'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, X, Heart, ArrowUpRight, UserRound, ChevronDown, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';
import { useWishlist } from './WishlistProvider';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className="relative py-2 text-[13px] font-semibold text-white/85 transition hover:text-white">
      <span className={active ? 'text-white' : ''}>{children}</span>
      {active && <span className="absolute -bottom-[1px] left-0 h-[2px] w-full brand-gradient-bg rounded-full" />}
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { count } = useCart();
  const { ids } = useWishlist();
  const [categories, setCategories] = useState<string[]>([]);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d.categories) ? d.categories : [])).catch(() => {});
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) { if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return <>
    <header className="sticky top-0 z-50 bg-[#061426]">
      <div className="container flex h-[68px] items-center justify-between">
        <div className="flex items-center gap-9">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image src="/logo.jpg" alt="Vendly" width={38} height={38} className="h-9 w-9 rounded-full object-cover" priority />
            <span className="hidden text-[21px] font-black tracking-[-.06em] text-white sm:inline">vendly<span className="brand-gradient-text">.</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <NavLink href="/shop">Shop</NavLink>
            <div ref={catRef} className="relative">
              <button onClick={() => setCatOpen(v => !v)} className="flex items-center gap-1 py-2 text-[13px] font-semibold text-white/85 transition hover:text-white">
                Categories <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-[calc(100%+10px)] w-[420px] rounded-2xl border border-black/5 bg-white p-4 shadow-[0_24px_60px_rgba(6,20,38,.18)]">
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map(c => (
                      <Link key={c} onClick={() => setCatOpen(false)} href={`/category/${encodeURIComponent(c)}`} className="rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#161616] transition hover:bg-[#F7F8FA]">{c}</Link>
                    ))}
                    {!categories.length && <p className="col-span-2 px-3 py-2.5 text-[13px] text-black/40">No categories yet.</p>}
                  </div>
                </div>
              )}
            </div>
            <NavLink href="/track">Track order</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)} aria-label="Search Vendly" className="grid h-10 w-10 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"><Search size={18} /></button>
          <Link href="/account" aria-label="Account" className="hidden h-10 w-10 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white sm:grid"><UserRound size={18} /></Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative grid h-10 w-10 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"><Heart size={18} />{ids.length > 0 && <span className="count-dot">{ids.length > 9 ? '9+' : ids.length}</span>}</Link>
          <Link href="/cart" aria-label="Cart" className="relative grid h-10 w-10 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"><ShoppingBag size={18} />{count > 0 && <span className="count-dot">{count > 9 ? '9+' : count}</span>}</Link>
          <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white md:hidden" aria-label="Open menu">{open ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-[#061426] px-4 py-6 md:hidden">
          <div className="grid gap-1 text-[19px] font-semibold tracking-tight text-white">
            <Link onClick={() => setOpen(false)} className="rounded-xl px-2 py-2.5 hover:bg-white/5" href="/shop">Shop</Link>
            <Link onClick={() => setOpen(false)} className="rounded-xl px-2 py-2.5 hover:bg-white/5" href="/track">Track order</Link>
            <Link onClick={() => setOpen(false)} className="rounded-xl px-2 py-2.5 hover:bg-white/5" href="/account">Account</Link>
            <p className="mt-4 px-2 text-[11px] font-bold uppercase tracking-[.14em] text-white/35">Categories</p>
            {categories.map(c => <Link key={c} onClick={() => setOpen(false)} className="rounded-xl px-2 py-2.5 text-white/85 hover:bg-white/5" href={`/category/${encodeURIComponent(c)}`}>{c}</Link>)}
            <Link onClick={() => setOpen(false)} className="mt-3 flex items-center justify-between border-t border-white/10 px-2 pt-5 text-base text-white/85" href="/contact">Customer service <ArrowUpRight size={17} /></Link>
          </div>
        </nav>
      )}
    </header>
    {searchOpen && <SearchOverlay close={() => setSearchOpen(false)} categories={categories} />}
  </>;
}

function SearchOverlay({ close, categories }: { close: () => void; categories: string[] }) {
  const [q, setQ] = useState('');
  return (
    <div className="fixed inset-0 z-[100] bg-[#061426]/70 p-3 backdrop-blur-md" onMouseDown={close}>
      <div onMouseDown={e => e.stopPropagation()} className="mx-auto mt-3 max-w-2xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl md:mt-12">
        <div className="flex items-center gap-3 border-b border-black/10 p-5">
          <Search className="text-black/35" size={20} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="What are you looking for?" className="flex-1 bg-transparent text-lg outline-none" />
          <button onClick={close} className="rounded-full bg-black/5 p-2"><X size={17} /></button>
        </div>
        <div className="p-5">
          <p className="eyebrow text-black/35">Popular categories</p>
          <div className="mt-4 flex flex-wrap gap-2">{categories.map(x => <Link onClick={close} key={x} href={`/category/${encodeURIComponent(x)}`} className="chip">{x}</Link>)}</div>
          <Link onClick={close} href={q.trim() ? `/shop?q=${encodeURIComponent(q)}` : '/shop'} className="mt-6 flex items-center justify-between rounded-2xl bg-[#FF7200] px-5 py-4 text-sm font-bold text-white">{q.trim() ? `Search for "${q}"` : 'Browse everything'}<ArrowUpRight size={17} /></Link>
        </div>
      </div>
    </div>
  );
}
