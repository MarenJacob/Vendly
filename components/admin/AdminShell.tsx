'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Boxes, LayoutDashboard, MessageSquare, Package, ShoppingBag, Users, Store, Menu, X, History } from 'lucide-react';
import { useState } from 'react';
import LogoutButton from './LogoutButton';
const nav=[['Overview','/admin',LayoutDashboard],['Products','/admin/products',Package],['Orders','/admin/orders',ShoppingBag],['Customers','/admin/customers',Users],['Categories','/admin/categories',Boxes],['Analytics','/admin/analytics',BarChart3],['Inventory','/admin/inventory',Boxes],['Settings','/admin/settings',Boxes],['Inbox','/admin/messages',MessageSquare],['Activity','/admin/audit',History]] as const;
export default function AdminShell({children}:{children:React.ReactNode}){
  const path=usePathname();const [open,setOpen]=useState(false);
  return <div className="min-h-screen bg-[#F7F8FA] text-[#161616]">
    <aside className={`on-navy fixed inset-y-0 left-0 z-50 w-72 bg-[#061426] transition-transform lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-2.5"><Image src="/logo.jpg" alt="Vendly" width={30} height={30} className="h-[30px] w-[30px] rounded-full object-cover"/><span className="text-lg font-black tracking-tight text-white">vendly<span className="brand-gradient-text">.</span></span></Link>
          <button onClick={()=>setOpen(false)} className="rounded-lg p-2 text-[rgba(255,255,255,.7)] hover:bg-[rgba(255,255,255,.12)] lg:hidden"><X size={19}/></button>
        </div>
        <div className="mt-8 rounded-2xl bg-[rgba(255,255,255,.06)] p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[rgba(255,255,255,.4)]">Control centre</p>
          <p className="mt-2 text-sm font-semibold">Store operations</p>
          <p className="mt-1 text-xs text-[rgba(255,255,255,.4)]">Catalogue, orders &amp; customers</p>
        </div>
        <nav className="mt-7 space-y-1">{nav.map(([label,href,Icon])=>{const active=path===href||path.startsWith(href+'/');return <Link key={href} href={href} onClick={()=>setOpen(false)} className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active?'bg-[rgba(255,255,255,.12)] text-white':'text-[rgba(255,255,255,.55)] hover:bg-[rgba(255,255,255,.06)] hover:text-white'}`}>{active&&<span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FF7200]"/>}<Icon size={18}/>{label}</Link>})}</nav>
        <div className="mt-auto border-t border-[rgba(255,255,255,.12)] pt-4">
          <Link href="/" className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[rgba(255,255,255,.55)] hover:bg-[rgba(255,255,255,.06)] hover:text-white"><Store size={18}/>View storefront</Link>
          <LogoutButton/>
        </div>
      </div>
    </aside>
    <div className="lg:pl-72">
      <header className="sticky top-0 z-30 border-b border-black/[.06] bg-[#F7F8FA]/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button onClick={()=>setOpen(true)} className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-2 lg:hidden"><Menu size={19}/></button>
          <div className="hidden text-sm text-slate-500 lg:block">Vendly / <span className="text-[#161616]">{path.split('/').filter(Boolean).slice(-1)[0]||'overview'}</span></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 sm:block">Admin workspace</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#FF7200] text-xs font-bold text-white">A</span></div>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  </div>
}
