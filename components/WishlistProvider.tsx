'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {isLoggedIn,redirectToLogin} from '@/lib/auth-gate';
type WishlistContext={ids:string[];toggle:(id:string)=>void;has:(id:string)=>boolean};
const Ctx=createContext<WishlistContext|null>(null); const KEY='vendly_wishlist_v1';
export function WishlistProvider({children}:{children:React.ReactNode}){const [ids,setIds]=useState<string[]>([]);const [ready,setReady]=useState(false);useEffect(()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(v))setIds(v.filter(x=>typeof x==='string'));}catch{}finally{setReady(true)}},[]);useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify(ids))},[ids,ready]);const api=useMemo(()=>({ids,toggle:(id:string)=>{isLoggedIn().then(ok=>{if(!ok){redirectToLogin();return}setIds(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id])})},has:(id:string)=>ids.includes(id)}),[ids]);return <Ctx.Provider value={api}>{children}</Ctx.Provider>}
export function useWishlist(){const c=useContext(Ctx);if(!c)throw new Error('useWishlist must be used inside WishlistProvider');return c}
