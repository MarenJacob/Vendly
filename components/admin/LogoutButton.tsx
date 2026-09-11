'use client';
import { useRouter } from 'next/navigation';
export default function LogoutButton(){const router=useRouter();return <button className="btn-primary" onClick={async()=>{await fetch('/api/admin/auth/logout',{method:'POST'});router.replace('/admin/login');router.refresh();}}>Sign out</button>}
