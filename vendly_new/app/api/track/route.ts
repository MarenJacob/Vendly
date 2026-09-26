import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference = String(body?.reference || '').trim().toUpperCase();
    const email = String(body?.email || '').trim().toLowerCase();
    const phone = String(body?.phone || '').trim();
    if (!reference || (!email && !phone)) return NextResponse.json({ error: 'Order reference and email or phone are required.' }, { status: 400 });
    const order = await prisma.order.findFirst({ where: { reference, ...(email ? { email } : { phone }) }, include: { items: { include: { product: { select: { name: true, slug: true } } } } } });
    if (!order) return NextResponse.json({ error: 'We could not find that order. Check the details and try again.' }, { status: 404 });
    return NextResponse.json({ order: { reference: order.reference, status: order.status, total: Number(order.total), createdAt: order.createdAt, updatedAt: order.updatedAt, paidAt: order.paidAt, items: order.items.map(i => ({ name: i.product.name, slug: i.product.slug, quantity: i.quantity, price: Number(i.price) })) } });
  } catch { return NextResponse.json({ error: 'Unable to look up the order right now.' }, { status: 500 }); }
}
