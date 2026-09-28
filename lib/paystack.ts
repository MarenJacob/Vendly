// Single source of truth for deciding whether a Paystack transaction really
// pays for a given order. Used by BOTH the verify route (customer returns to
// the site) and the webhook (Paystack calls us server-to-server), so the two
// paths can never disagree about what counts as a valid payment.

export type PaystackTx = {
  status?: string;
  amount?: number | string;
  currency?: string;
  paid_at?: string | null;
  metadata?: { orderReference?: string } | null;
  customer?: { email?: string } | null;
};

export type TxCheck = { ok: true } | { ok: false; code: string; detail: string };

export function checkTransaction(tx: PaystackTx, order: { total: unknown }): TxCheck {
  const expected = Math.round(Number(order.total) * 100); // kobo
  const received = Number(tx.amount);

  if (tx.status !== 'success') {
    return { ok: false, code: 'not_successful', detail: `Paystack reports status "${tx.status ?? 'unknown'}"` };
  }
  if (tx.currency !== 'NGN') {
    return { ok: false, code: 'currency_mismatch', detail: `currency was ${tx.currency ?? 'unknown'}` };
  }
  // Underpayment is the real fraud risk, so anything below the order total is
  // rejected. Paying slightly more (e.g. if fees are added on top) is not.
  if (!Number.isFinite(received) || received < expected) {
    return { ok: false, code: 'amount_mismatch', detail: `expected ${expected} kobo, received ${received}` };
  }
  return { ok: true };
}
