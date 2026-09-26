let cache: boolean | null = null;

export async function isLoggedIn(): Promise<boolean> {
  if (cache !== null) return cache;
  try {
    const r = await fetch('/api/auth/me', { cache: 'no-store' });
    const d = await r.json();
    cache = !!d.user;
  } catch {
    cache = false;
  }
  return cache;
}

export function redirectToLogin() {
  if (typeof window === 'undefined') return;
  window.location.href = `/account/login?next=${encodeURIComponent(window.location.pathname)}`;
}
