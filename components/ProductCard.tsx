'use client';
import Image from 'next/image';import Link from 'next/link';import {Check,Heart,Play,ShoppingBag,Clock,Ban} from 'lucide-react';import {useState} from 'react';import {Product,formatNaira} from '@/lib/products';import {useCart} from './CartProvider';import {useWishlist} from './WishlistProvider';
export default function ProductCard({product}:{product:Product}){
  const [added,setAdded]=useState(false);const {add}=useCart();const {toggle,has}=useWishlist();const liked=has(product.id);
  const outOfStock = !product.isPreorder && (product.stock ?? 1) <= 0;
  const isNew = product.createdAt ? (Date.now()-new Date(product.createdAt).getTime()) < 14*24*60*60*1000 : false;
  const badge = product.oldPrice ? {label:'Sale',className:'bg-[#F50063] text-white'}
    : product.featured ? {label:'Featured',className:'bg-[#FF7200] text-white'}
    : (!outOfStock && !product.isPreorder && (product.stock ?? 99) > 0 && (product.stock ?? 99) <= 5) ? {label:'Low stock',className:'bg-[#FF3D32] text-white'}
    : isNew ? {label:'New',className:'bg-black text-white'}
    : null;
  function handleAdd(){ if(outOfStock) return; add(product.id);setAdded(true);window.setTimeout(()=>setAdded(false),1400)}
  return (
    <article className="group flex w-full min-w-0 flex-col">
      <div className="relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-2xl bg-[#ecebe6] shadow-[0_18px_50px_rgba(0,0,0,.04)]">
        <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 block">
          <Image src={product.image} alt={product.name} fill sizes="(max-width:768px) 50vw,25vw" className={`object-cover transition duration-700 group-hover:scale-[1.045] ${outOfStock?'grayscale-[.35] opacity-70':''}`}/>
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3">
          <div className="flex flex-col gap-1.5">
            {product.isPreorder&&<span className="inline-flex w-fit items-center gap-1 rounded-full bg-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-white"><Clock size={10}/> Preorder</span>}
            {outOfStock&&<span className="inline-flex w-fit items-center gap-1 rounded-full bg-[rgba(255,255,255,0.9)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[rgba(0,0,0,0.6)] backdrop-blur"><Ban size={10}/> Out of stock</span>}
            {badge&&!product.isPreorder&&!outOfStock&&<span className={`w-fit rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] ${badge.className}`}>{badge.label}</span>}
          </div>
          <button onClick={()=>toggle(product.id)} aria-label={liked?'Remove from wishlist':'Add to wishlist'} className={`pointer-events-auto grid h-9 w-9 shrink-0 place-items-center rounded-full backdrop-blur transition ${liked?'bg-black text-white':'bg-[rgba(255,255,255,0.9)] text-black hover:bg-white'}`}><Heart size={15} fill={liked?'currentColor':'none'}/></button>
        </div>
        {product.video&&<span className="pointer-events-none absolute bottom-3 right-3 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(255,255,255,0.92)] shadow-sm backdrop-blur"><Play size={12} fill="currentColor"/></span>}
      </div>
      <div className="flex min-w-0 justify-between gap-3 px-0.5 pt-3">
        <div className="min-w-0 flex-1">
          <Link href={`/product/${product.slug}`} className="block truncate text-[13px] font-semibold hover:underline underline-offset-4">{product.name}</Link>
          <p className="truncate pt-1 text-[11px] text-[rgba(0,0,0,0.4)]">{product.category}</p>
        </div>
        <div className="shrink-0 text-right text-[13px] font-semibold">
          <p>{formatNaira(product.price)}</p>
          {product.oldPrice&&<p className="text-[11px] text-[rgba(0,0,0,0.3)] line-through">{formatNaira(product.oldPrice)}</p>}
        </div>
      </div>
      <button onClick={handleAdd} disabled={outOfStock} className="mt-3 flex w-full min-w-0 items-center justify-center gap-2 rounded-full bg-[#FF7200] py-2.5 text-[11px] font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[rgba(0,0,0,0.1)] disabled:text-[rgba(0,0,0,0.35)] disabled:hover:brightness-100">{outOfStock?'Out of stock':added?<><Check size={13}/> Added to bag</>:product.isPreorder?<><Clock size={13}/> Preorder</>:<><ShoppingBag size={13}/> Add to bag</>}</button>
    </article>
  );
}
