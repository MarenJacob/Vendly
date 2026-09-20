import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const t = getTransporter();
  if (!t) {
    // Not configured yet — log instead of failing so signup/checkout never
    // breaks because email isn't wired up.
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — would have sent "${subject}" to ${to}`);
    return { sent: false };
  }
  try {
    await t.sendMail({ from: `Vendly <${process.env.GMAIL_USER}>`, to, subject, html, ...(replyTo ? { replyTo } : {}) });
    return { sent: true };
  } catch (error) {
    console.error('[email] Failed to send:', error);
    return { sent: false };
  }
}

export function verificationEmailHtml(name: string, verifyUrl: string) {
  return emailShell(`
    <h2 style="color:#061426;margin:0 0 14px">Welcome to Vendly, ${escapeHtml(name) || 'there'}.</h2>
    <p style="color:#161616;font-size:14px;line-height:1.6;margin:0 0 20px">Please confirm your email address to finish setting up your account.</p>
    ${button('Verify my email', verifyUrl)}
    <p style="color:#8A8F98;font-size:12px;margin-top:24px">If you didn't create a Vendly account, you can ignore this email.</p>
  `);
}

function escapeHtml(s: string) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function button(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#FF7200;color:#fff;text-decoration:none;font-weight:bold;font-size:14px">${escapeHtml(label)}</a>`;
}

function emailShell(inner: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:8px">
    <p style="font-weight:900;letter-spacing:-.03em;font-size:20px;color:#061426;margin:0 0 20px">vendly<span style="color:#FF7200">.</span></p>
    ${inner}
    <p style="color:#C4C7CD;font-size:11px;margin-top:32px;border-top:1px solid #F0F0F0;padding-top:16px">Vendly · this is an automated message from your order activity.</p>
  </div>`;
}

type EmailOrder = {
  reference: string;
  total: number | string;
  address: string;
  phone: string;
  items: { quantity: number; price: number | string; product: { name: string } }[];
};

function formatNaira(n: number | string) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

function itemsTable(items: EmailOrder['items']) {
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;color:#161616">
    ${items.map((i) => `<tr style="border-bottom:1px solid #F0F0F0"><td style="padding:8px 0">${escapeHtml(i.product.name)} × ${i.quantity}</td><td style="padding:8px 0;text-align:right;font-weight:600">${formatNaira(Number(i.price) * i.quantity)}</td></tr>`).join('')}
  </table>`;
}

export function orderConfirmationEmailHtml(order: EmailOrder, trackUrl: string) {
  return emailShell(`
    <h2 style="color:#061426;margin:0 0 8px">Order received.</h2>
    <p style="color:#161616;font-size:14px;line-height:1.6;margin:0 0 4px">Reference <strong>${escapeHtml(order.reference)}</strong></p>
    <p style="color:#8A8F98;font-size:13px;margin:0 0 16px">We'll email you again once payment is confirmed.</p>
    ${itemsTable(order.items)}
    <p style="font-weight:bold;font-size:15px;color:#061426;margin:8px 0 20px">Total: ${formatNaira(order.total)}</p>
    ${button('Track my order', trackUrl)}
  `);
}

export function paymentConfirmedEmailHtml(order: EmailOrder, trackUrl: string) {
  return emailShell(`
    <h2 style="color:#061426;margin:0 0 8px">Payment confirmed. 🎉</h2>
    <p style="color:#161616;font-size:14px;line-height:1.6;margin:0 0 16px">Thanks for shopping with Vendly — your order <strong>${escapeHtml(order.reference)}</strong> is now being processed.</p>
    ${itemsTable(order.items)}
    <p style="font-weight:bold;font-size:15px;color:#061426;margin:8px 0 20px">Total paid: ${formatNaira(order.total)}</p>
    ${button('Track my order', trackUrl)}
  `);
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  PROCESSING: { title: 'Your order is being processed.', body: 'We\'re getting your items ready.' },
  SHIPPED: { title: 'Your order has shipped. 🚚', body: 'It\'s on its way to you.' },
  DELIVERED: { title: 'Your order has been delivered. ✅', body: 'We hope you love it — thanks for shopping with Vendly.' },
  CANCELLED: { title: 'Your order was cancelled.', body: 'If this wasn\'t expected, please reach out and we\'ll help sort it out.' },
};

export function orderStatusEmailHtml(order: EmailOrder, status: string, trackUrl: string) {
  const copy = STATUS_COPY[status] || { title: `Order status: ${status}`, body: '' };
  return emailShell(`
    <h2 style="color:#061426;margin:0 0 8px">${escapeHtml(copy.title)}</h2>
    <p style="color:#161616;font-size:14px;line-height:1.6;margin:0 0 16px">Order <strong>${escapeHtml(order.reference)}</strong>. ${escapeHtml(copy.body)}</p>
    ${button('View order status', trackUrl)}
  `);
}

export function supportMessageAdminEmailHtml(message: { name: string; phone: string; email?: string | null; message: string; productName?: string }) {
  return emailShell(`
    <h2 style="color:#061426;margin:0 0 8px">New customer message</h2>
    <p style="color:#161616;font-size:13px;margin:0 0 4px"><strong>${escapeHtml(message.name)}</strong> · ${escapeHtml(message.phone)}${message.email ? ' · ' + escapeHtml(message.email) : ''}</p>
    ${message.productName ? `<p style="color:#8A8F98;font-size:12px;margin:0 0 12px">About: ${escapeHtml(message.productName)}</p>` : ''}
    <p style="color:#161616;font-size:14px;line-height:1.6;background:#F7F8FA;padding:14px;border-radius:12px;margin:12px 0">${escapeHtml(message.message)}</p>
    <p style="color:#8A8F98;font-size:12px;margin-top:16px">Reply directly to this email${message.email ? ', or use ' + escapeHtml(message.email) : ''} to respond to the customer.</p>
  `);
}
