'use client';
import {ShoppingBag,Check,Clock} from 'lucide-react'; import {useState} from 'react'; import {useCart} from './CartProvider';
export default function AddToCart({productId,outOfStock,isPreorder}:{productId:string;outOfStock?:boolean;isPreorder?:boolean}){
  const {add}=useCart();const [done,setDone]=useState(false);
  return <button disabled={outOfStock} onClick={()=>{if(outOfStock)return;add(productId);setDone(true);setTimeout(()=>setDone(false),1600)}} className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF7200] py-4 text-sm font-bold text-white transition-all hover:brightness-95 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-[rgba(0,0,0,0.15)] disabled:text-[rgba(0,0,0,0.4)] disabled:hover:brightness-100 disabled:active:scale-100">{outOfStock?'Out of stock':done?<><Check size={17}/> Added to cart</>:isPreorder?<><Clock size={17}/> Preorder now</>:<><ShoppingBag size={17}/> Add to cart</>}</button>
}
