import { getAppUrl } from '@/lib/app-url';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { sendEmail, paymentConfirmedEmailHtml } from '@/lib/email';
import { checkTransaction, type PaystackTx } from '@/lib/paystack';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`payverify:${ip}`, 30, 60_000).ok) {
    return NextResponse.json({ error: 'Too many verification requests. Please try again shortly.' }, { status: 429 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: 'Payment verification is not configured.' }, { status: 503 });

  try {
    const reference = new URL(request.url).searchParams.get('reference');
    if (!reference) return NextResponse.json({ error: 'Missing payment reference.', code: 'missing_reference' }, { status: 400 });

    // Always confirm directly with Paystack using our secret key — the
    // reference in the URL alone proves nothing.
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.status) {
      console.error('[paystack verify] Paystack rejected the lookup:', { reference, http: response.status, message: data.message });
      return NextResponse.json(
        { error: data.message || 'Verification failed.', code: 'paystack_error', detail: `HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const tx = data.data as PaystackTx;
    const order = await prisma.order.findFirst({
      where: { OR: [{ paymentReference: reference }, { reference: String(tx.metadata?.orderReference || '') }] },
    });
    if (!order) {
      console.error('[paystack verify] no order for reference', reference);
      return NextResponse.json({ error: 'We could not find an order for this payment.', code: 'order_not_found' }, { status: 404 });
    }

    const result = checkTransaction(tx, order);
    if (!result.ok) {
      console.error('[paystack verify] rejected:', { reference, order: order.reference, code: result.code, detail: result.detail });
      return NextResponse.json({ error: 'Payment could not be verified.', code: result.code, detail: result.detail }, { status: 409 });
    }

    if (String(tx.customer?.email || '').toLowerCase() !== order.email.toLowerCase()) {
      console.warn('[paystack verify] customer email differs (non-blocking):', { reference, txEmail: tx.customer?.email, orderEmail: order.email });
    }

    if (order.status === 'CANCELLED') {
      // Stock was already returned when this order was cancelled, so it must not
      // silently flip to paid. A person needs to look at this one.
      console.error('[paystack verify] payment received for a CANCELLED order', { reference, order: order.reference });
      return NextResponse.json(
        { error: 'This order was cancelled before payment arrived. Please contact support with your reference so we can refund or restore it.', code: 'order_cancelled' },
        { status: 409 },
      );
    }

    // Atomic PENDING -> PAID. If the webhook got there first, count is 0 and we
    // simply report success without sending a second confirmation email.
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
        console.error('[paystack verify] confirmation email failed:', e);
      }
    }

    return NextResponse.json({ verified: true, reference: order.reference, status: 'PAID', amount: Math.round(Number(order.total) * 100) });
  } catch (error) {
    console.error('Paystack verification failed:', error);
    return NextResponse.json({ error: 'Unable to verify payment.', code: 'server_error' }, { status: 500 });
  }
}
