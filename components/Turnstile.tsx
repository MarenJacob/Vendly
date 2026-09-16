'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void }; }
}

export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;
    const existing = document.getElementById('cf-turnstile-script');
    function render() {
      if (ref.current && window.turnstile) {
        window.turnstile.render(ref.current, { sitekey: siteKey, callback: onToken });
      }
    }
    if (existing) {
      render();
      return;
    }
    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-1" />;
}
