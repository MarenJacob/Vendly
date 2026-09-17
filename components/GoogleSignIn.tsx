'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (opts: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function GoogleSignIn({ onSuccess }: { onSuccess: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    async function handleCredential(response: { credential: string }) {
      const r = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: response.credential }) });
      if (r.ok) onSuccess();
    }
    function render() {
      if (ref.current && window.google) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
        window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: 320, shape: 'pill' });
      }
    }
    const existing = document.getElementById('google-identity-script');
    if (existing) { render(); return; }
    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [clientId, onSuccess]);

  if (!clientId) return null;
  return (
    <div className="mt-4">
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-[rgba(0,0,0,0.35)]"><span className="h-px flex-1 bg-[rgba(0,0,0,0.1)]" />or<span className="h-px flex-1 bg-[rgba(0,0,0,0.1)]" /></div>
      <div ref={ref} className="flex justify-center" />
    </div>
  );
}
