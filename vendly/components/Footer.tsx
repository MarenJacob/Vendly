import Logo from './Logo';
import Link from 'next/link';
import { getCategoryNames } from '@/lib/catalog';
import CookiePreferencesButton from './CookiePreferencesButton';
import { InstagramIcon, XIcon, WhatsAppIcon, PhoneIcon } from './SocialIcons';

export default async function Footer(){
  const whatsapp=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const instagram=process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const xUrl=process.env.NEXT_PUBLIC_X_URL;
  const phone=process.env.NEXT_PUBLIC_PHONE_NUMBER;
  const categories=(await getCategoryNames().catch(()=>[])).filter(c=>c!=='All').slice(0,4);
  const socials=[
    instagram?{href:instagram,label:'Instagram',Icon:InstagramIcon}:null,
    xUrl?{href:xUrl,label:'X',Icon:XIcon}:null,
    whatsapp?{href:`https://wa.me/${whatsapp}`,label:'WhatsApp',Icon:WhatsAppIcon}:null,
    phone?{href:`tel:${phone}`,label:'Call us',Icon:PhoneIcon}:null,
  ].filter((s):s is NonNullable<typeof s> =>s!==null);
  return <footer className="mt-24 bg-[#05070B] text-white"><div className="container grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><Link href="/" className="flex items-center gap-2.5"><Logo height={34} /></Link><p className="mt-4 max-w-sm text-sm leading-6 text-[rgba(255,255,255,0.5)]">A modern storefront built around products you can discover, understand and confidently buy.</p>{socials.length>0&&<div className="mt-5 flex gap-2">{socials.map(({href,label,Icon})=><a key={label} href={href} target={href.startsWith('http')?'_blank':undefined} rel={href.startsWith('http')?'noopener noreferrer':undefined} aria-label={label} className="grid h-9 w-9 place-items-center rounded-full bg-[rgba(255,255,255,0.08)] text-white transition hover:bg-[rgba(255,255,255,0.16)]"><Icon/></a>)}</div>}</div><div><p className="eyebrow text-[rgba(255,255,255,0.4)]">Shop</p><div className="mt-4 grid gap-3 text-sm text-[rgba(255,255,255,0.65)]"><Link href="/shop">All products</Link>{categories.map(c=><Link key={c} href={`/category/${encodeURIComponent(c)}`}>{c}</Link>)}</div></div><div><p className="eyebrow text-[rgba(255,255,255,0.4)]">Help</p><div className="mt-4 grid gap-3 text-sm text-[rgba(255,255,255,0.65)]"><Link href="/checkout">Checkout</Link><Link href="/cart">Your cart</Link><Link href="/track">Customer service</Link>{whatsapp?<a href={`https://wa.me/${whatsapp}`}>Message Vendly</a>:<Link href="/contact">Message Vendly</Link>}<Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><CookiePreferencesButton/></div></div><div><p className="eyebrow text-[rgba(255,255,255,0.4)]">Promise</p><p className="mt-4 text-sm leading-6 text-[rgba(255,255,255,0.65)]">Real products. Clear information. Human support when you need it.</p></div></div><div className="container border-t border-[rgba(255,255,255,0.1)] py-6 text-xs text-[rgba(255,255,255,0.4)]">© 2026 Vendly. All rights reserved.</div></footer>
}
