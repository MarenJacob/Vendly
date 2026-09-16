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

export async function sendEmail(to: string, subject: string, html: string) {
  const t = getTransporter();
  if (!t) {
    // Not configured yet — log instead of failing so signup/checkout never
    // breaks because email isn't wired up.
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — would have sent "${subject}" to ${to}`);
    return { sent: false };
  }
  try {
    await t.sendMail({ from: `Vendly <${process.env.GMAIL_USER}>`, to, subject, html });
    return { sent: true };
  } catch (error) {
    console.error('[email] Failed to send:', error);
    return { sent: false };
  }
}

export function verificationEmailHtml(name: string, verifyUrl: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#061426">Welcome to Vendly, ${name || 'there'}.</h2>
    <p style="color:#161616;font-size:14px;line-height:1.6">Please confirm your email address to finish setting up your account.</p>
    <a href="${verifyUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;border-radius:999px;background:#FF7200;color:#fff;text-decoration:none;font-weight:bold">Verify my email</a>
    <p style="color:#8A8F98;font-size:12px;margin-top:24px">If you didn't create a Vendly account, you can ignore this email.</p>
  </div>`;
}
