import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'vendly_admin_session';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    // Refuse to fall back to a guessable default in production: anyone who
    // has read this source (it's boilerplate) could otherwise forge a valid
    // admin session cookie. Fail loudly instead so misconfiguration is
    // caught immediately rather than silently shipping a forgeable secret.
    throw new Error('ADMIN_SESSION_SECRET must be set in production.');
  }
  return 'dev-only-insecure-secret-do-not-use-in-production';
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

// The email is base64url-encoded before it goes into the cookie. Splitting
// the raw cookie string on '.' is not safe because real email addresses
// contain '.' themselves (e.g. "admin@example.com") — that previously
// truncated the email and shifted the signature, so verification failed
// for every realistic admin email and login never actually succeeded.
export function createSession(email: string) {
  const encodedEmail = Buffer.from(email, 'utf8').toString('base64url');
  const payload = `${encodedEmail}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(value?: string) {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [encodedEmail, issuedAt, signature] = parts;
  if (!encodedEmail || !issuedAt || !signature) return false;
  const payload = `${encodedEmail}.${issuedAt}`;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  if (Date.now() - Number(issuedAt) > TTL_MS) return false;
  return true;
}

export async function getAdminSession() {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (!isValidSession(value)) return null;
  const encodedEmail = value!.split('.')[0];
  return Buffer.from(encodedEmail, 'base64url').toString('utf8');
}

export { COOKIE };
