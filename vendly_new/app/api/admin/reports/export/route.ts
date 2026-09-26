import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
function csv(value: unknown) { const s = String(value ?? ''); return `"${s.replace(/"/g, '""')}"`; }
export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
  const rows = [['Reference','Status','Email','Phone','Total NGN','Items','Payment Reference','Created At'], ...orders.map(o => [o.reference,o.status,o.email,o.phone,Number(o.total),o.items.reduce((n,i)=>n+i.quantity,0),o.paymentReference ?? '',o.createdAt.toISOString()])];
  const body = rows.map(r => r.map(csv).join(',')).join('\n');
  return new NextResponse(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="vendly-orders-${new Date().toISOString().slice(0,10)}.csv"`, 'Cache-Control': 'no-store' } });
}
