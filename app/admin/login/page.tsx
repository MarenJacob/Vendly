'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(e: FormEvent){ e.preventDefault(); setLoading(true); setError(''); const r=await fetch('/api/admin/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); const data=await r.json(); if(!r.ok){setError(data.error||'Unable to sign in.');setLoading(false);return;} router.replace('/admin'); router.refresh(); }
  return <main className="grid min-h-screen place-items-center bg-slate-950 px-4"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[rgba(255,255,255,0.1)] bg-white p-7 shadow-2xl"><p className="eyebrow">Vendly admin</p><h1 className="mt-2 text-3xl font-semibold">Sign in</h1><p className="mt-2 text-sm text-slate-500">Manage products, orders and customer activity.</p><div className="mt-7 space-y-4"><label className="block text-sm font-medium">Email<input className="input mt-2" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block text-sm font-medium">Password<input className="input mt-2" type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="btn-primary w-full justify-center">{loading?'Signing in…':'Sign in securely'}</button></div></form></main>;
}
