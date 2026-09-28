import { getAppUrl } from '@/lib/app-url';
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, paymentConfirmedEmailHtml } from '@/lib/email';
import { checkTransaction, type PaystackTx } from '@/lib/paystack';

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });

  // Paystack signs the raw body with HMAC-SHA512 using our secret key.
  const raw = await request.text();
  const signature = request.headers.get('x-paystack-signature') ?? '';
  const hash = crypto.createHmac('sha512', secret).update(raw).digest('hex');
  if (!signature || signature.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    if (event.event === 'charge.success' && event.data?.reference && process.env.DATABASE_URL) {
      const tx = event.data as PaystackTx & { reference: string };
      const reference = String(tx.reference);
      const order = await prisma.order.findFirst({
        where: { OR: [{ paymentReference: reference }, { reference: String(tx.metadata?.orderReference || '') }] },
      });

      if (!order) {
        console.error('[paystack webhook] no order for reference', reference);
      } else if (order.status === 'PENDING') {
        const result = checkTransaction(tx, order);
        if (!result.ok) {
          console.error('[paystack webhook] rejected:', { reference, order: order.reference, code: result.code, detail: result.detail });
        } else {
          const moved = await prisma.order.updateMany({
            where: { id: order.id, status: 'PENDING' },
            data: { status: 'PAID', paymentReference: reference, paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date() },
          });
          if (moved.count === 1) {
            try {
              const full = await prisma.order.findUnique({ where: { id: order.id }, include: { items: { include: { product: true } } } });
              if (full) {
                await sendEmail(
                  full.email,
                  `Payment confirmed — ${full.reference}`,
                  paymentConfirmedEmailHtml(
                    { reference: full.reference, total: Number(full.total), address: full.address, phone: full.phone, items: full.items.map((i) => ({ quantity: i.quantity, price: Number(i.price), product: { name: i.product.name } })) },
                    `${getAppUrl(request)}/track?ref=${full.reference}`,
                  ),
                );
              }
            } catch (e) {
              console.error('[paystack webhook] confirmation email failed:', e);
            }
          }
        }
      } else if (order.status === 'CANCELLED') {
        console.error('[paystack webhook] payment received for a CANCELLED order — needs manual review', { reference, order: order.reference });
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook processing failed:', error);
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
}
