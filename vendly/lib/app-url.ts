// Resolves the public base URL of the site for links in emails and payment
// callbacks. NEXT_PUBLIC_APP_URL is preferred, but if it is missing, malformed
// (no http/https + host) or still pointing at localhost in production, we fall
// back to the address the current request actually came in on — so a
// misconfigured variable can never produce a broken or localhost link again.
export function getAppUrl(req?: Request): string {
  const env = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/+$/, '');
  const validEnv = /^https?:\/\/[^/\s]+/.test(env);
  const isLocalhost = /localhost|127\.0\.0\.1/.test(env);
  const isProd = process.env.NODE_ENV === 'production';

  if (validEnv && !(isProd && isLocalhost)) return env;

  if (req) {
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (host) {
      const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }
  return validEnv ? env : '';
}
