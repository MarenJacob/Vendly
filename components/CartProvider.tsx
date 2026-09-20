'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {isLoggedIn,redirectToLogin} from '@/lib/auth-gate';

type CartItem={id:string;quantity:number};
type CartContext={items:CartItem[];count:number;add:(id:string)=>void;remove:(id:string)=>void;clear:()=>void};
const Ctx=createContext<CartContext|null>(null);
const STORAGE_KEY='vendly_cart_v1';
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]); const [hydrated,setHydrated]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(Array.isArray(saved))setItems(saved.filter((x):x is CartItem=>typeof x?.id==='string'&&Number.isFinite(x?.quantity)&&x.quantity>0).map(x=>({...x,quantity:Math.min(20,Math.floor(x.quantity))})))}catch{}finally{setHydrated(true)}},[]);
 useEffect(()=>{if(hydrated)localStorage.setItem(STORAGE_KEY,JSON.stringify(items))},[items,hydrated]);
 const api=useMemo(()=>({items,count:items.reduce((n,i)=>n+i.quantity,0),add:(id:string)=>{isLoggedIn().then(ok=>{if(!ok){redirectToLogin();return}setItems(a=>{const x=a.find(i=>i.id===id);return x?a.map(i=>i.id===id?{...i,quantity:Math.min(20,i.quantity+1)}:i):[...a,{id,quantity:1}]})})},remove:(id:string)=>setItems(a=>a.map(i=>i.id===id?{...i,quantity:i.quantity-1}:i).filter(i=>i.quantity>0)),clear:()=>setItems([])}),[items]);
 return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
export function useCart(){const c=useContext(Ctx);if(!c)throw new Error('useCart must be used inside CartProvider');return c}
