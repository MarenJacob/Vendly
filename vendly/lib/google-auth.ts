export async function verifyGoogleIdToken(idToken: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('[google-auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set.');
    return null;
  }
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return null;
    const payload = await res.json();
    if (payload.aud !== clientId) return null;
    if (payload.email_verified !== 'true' && payload.email_verified !== true) return null;
    if (!payload.email) return null;
    return { email: String(payload.email).toLowerCase(), name: payload.name as string | undefined };
  } catch (error) {
    console.error('[google-auth] Token verification failed:', error);
    return null;
  }
}
