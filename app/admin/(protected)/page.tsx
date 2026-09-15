import Link from 'next/link'; import { ArrowUpRight, CircleDollarSign, Package, ShoppingBag, Users, MessageSquare, TrendingUp, AlertTriangle, RefreshCcw } from 'lucide-react'; import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
async function loadStats() {
  const [products,orders,customers,messages,pending,revenue,lowStock] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({where:{role:'CUSTOMER'}}),
    prisma.message.count(),
    prisma.order.count({where:{status:'PENDING'}}),
    prisma.order.aggregate({_sum:{total:true},where:{status:{in:['PAID','PROCESSING','SHIPPED','DELIVERED']}}}),
    prisma.product.count({where:{stock:{lte:5}}}),
  ]);
  const recent = await prisma.order.findMany({take:5,orderBy:{createdAt:'desc'},include:{items:true}});
  return {stats:{products,orders,customers,messages,pending,revenue:Number(revenue._sum.total||0),lowStock},recent};
}
export default async function AdminDashboard(){
  let data:Awaited<ReturnType<typeof loadStats>>|null=null;let failed=false;
  try{ data=await loadStats(); }
  catch{
    try{ await new Promise(r=>setTimeout(r,400)); data=await loadStats(); } catch{ failed=true; }
  }
  const s=data?.stats??{products:0,orders:0,customers:0,messages:0,pending:0,revenue:0,lowStock:0};
  const recent=data?.recent??[];
  const cards=[['Revenue',`₦${s.revenue.toLocaleString()}`,CircleDollarSign],['Orders',s.orders,ShoppingBag],['Products',s.products,Package],['Customers',s.customers,Users]] as const;
  return <><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="eyebrow text-slate-500">Overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Good afternoon, Admin.</h1><p className="mt-2 text-sm text-slate-500">Your store at a glance — what needs attention and what is moving.</p></div><Link href="/admin/products/new" className="btn-primary w-fit">Add product <ArrowUpRight size={16}/></Link></div>
  {failed&&<div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle size={18}/><span>Couldn&apos;t reach the database just now — these numbers may be stale.</span><a href="." className="ml-auto flex items-center gap-1 font-semibold underline"><RefreshCcw size={14}/> Retry</a></div>}
  <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><Icon size={19}/></span><TrendingUp size={16} className="text-slate-300"/></div><p className="mt-7 text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p></div>)}</section>
  <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]"><div className="rounded-2xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Recent orders</h2><p className="mt-1 text-xs text-slate-400">Latest customer activity</p></div><Link href="/admin/orders" className="text-xs font-semibold underline">View all</Link></div><div className="divide-y">{recent.map(o=><Link href={`/admin/orders/${o.id}`} key={o.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><div><p className="text-sm font-semibold">{o.reference}</p><p className="mt-1 text-xs text-slate-400">{o.items.length} item{o.items.length!==1?'s':''} · {new Date(o.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="text-sm font-semibold">₦{Number(o.total).toLocaleString()}</p><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{o.status}</span></div></Link>)}{!recent.length&&!failed&&<p className="p-10 text-center text-sm text-slate-400">No orders yet.</p>}{!recent.length&&failed&&<p className="p-10 text-center text-sm text-slate-400">Couldn&apos;t load orders right now.</p>}</div></div><div className="space-y-4"><div className="rounded-2xl bg-black p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">Attention</p><div className="mt-5 space-y-4"><Link href="/admin/orders" className="flex items-center justify-between rounded-xl border border-white/10 p-4 hover:bg-white/5"><span><span className="block text-sm font-semibold">Pending orders</span><span className="text-xs text-slate-400">Need processing</span></span><b>{s.pending}</b></Link><Link href="/admin/products" className="flex items-center justify-between rounded-xl border border-white/10 p-4 hover:bg-white/5"><span><span className="block text-sm font-semibold">Low stock</span><span className="text-xs text-slate-400">5 units or less</span></span><b>{s.lowStock}</b></Link></div></div><Link href="/admin/messages" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><MessageSquare size={18}/></span><div><p className="text-sm font-semibold">Customer inbox</p><p className="text-xs text-slate-400">{s.messages} conversations</p></div></div><ArrowUpRight size={17}/></Link></div></section></>
}
