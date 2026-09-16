import Image from 'next/image';
import Link from 'next/link';
import { getCategoryNames } from '@/lib/catalog';

export default async function Footer(){
  const whatsapp=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const categories=(await getCategoryNames().catch(()=>[])).filter(c=>c!=='All').slice(0,4);
  return <footer className="mt-24 bg-[#05070B] text-white"><div className="container grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><Link href="/" className="flex items-center gap-2.5"><Image src="/logo.jpg" alt="Vendly" width={40} height={40} className="h-10 w-10 rounded-full object-cover"/><span className="text-2xl font-black tracking-[-.06em]">vendly<span className="brand-gradient-text">.</span></span></Link><p className="mt-4 max-w-sm text-sm leading-6 text-white/50">A modern storefront built around products you can discover, understand and confidently buy.</p></div><div><p className="eyebrow text-white/40">Shop</p><div className="mt-4 grid gap-3 text-sm text-white/65"><Link href="/shop">All products</Link>{categories.map(c=><Link key={c} href={`/category/${encodeURIComponent(c)}`}>{c}</Link>)}</div></div><div><p className="eyebrow text-white/40">Help</p><div className="mt-4 grid gap-3 text-sm text-white/65"><Link href="/checkout">Checkout</Link><Link href="/cart">Your cart</Link><Link href="/track">Customer service</Link>{whatsapp?<a href={`https://wa.me/${whatsapp}`}>Message Vendly</a>:<Link href="/contact">Message Vendly</Link>}<Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><CookiePreferencesLink/></div></div><div><p className="eyebrow text-white/40">Promise</p><p className="mt-4 text-sm leading-6 text-white/65">Real products. Clear information. Human support when you need it.</p></div></div><div className="container border-t border-white/10 py-6 text-xs text-white/40">© 2026 Vendly. All rights reserved.</div></footer>
}

function CookiePreferencesLink(){
  return <button type="button" className="text-left" onClick={()=>{if(typeof window!=='undefined')window.dispatchEvent(new Event('vendly:open-cookie-preferences'))}}>Cookie preferences</button>
}
