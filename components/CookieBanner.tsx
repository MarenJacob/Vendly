'use client';
import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

const KEY = 'vendly_cookie_consent';
export type CookieConsent = 'all' | 'essential';

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  return v === 'all' || v === 'essential' ? v : null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
    const reopen = () => { setVisible(true); setManaging(true); };
    window.addEventListener('vendly:open-cookie-preferences', reopen);
    return () => window.removeEventListener('vendly:open-cookie-preferences', reopen);
  }, []);

  function choose(value: CookieConsent) {
    localStorage.setItem(KEY, value);
    setVisible(false);
    setManaging(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4">
      <div className="mx-auto max-w-lg rounded-2xl border border-black/10 bg-white p-4 shadow-[0_18px_50px_rgba(6,20,38,.14)] sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F7F8FA]"><Cookie size={17} /></span>
          <div className="flex-1">
            <p className="text-sm font-bold">We use cookies</p>
            <p className="mt-1 text-xs leading-5 text-black/55">We use essential cookies to keep Vendly working properly. We may also use optional cookies to understand how customers use our store and improve your experience.</p>
            {managing && (
              <div className="mt-3 rounded-xl bg-[#F7F8FA] p-3 text-xs text-black/60">
                <p><strong className="text-black">Essential</strong> — required for cart, checkout and login. Always on.</p>
                <p className="mt-1.5"><strong className="text-black">Optional</strong> — helps us understand store usage. Only set if you accept.</p>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => choose('all')} className="btn-primary px-4! py-2! text-xs!">Accept all</button>
              <button onClick={() => choose('essential')} className="btn-secondary px-4! py-2! text-xs!">Reject optional</button>
              {!managing && <button onClick={() => setManaging(true)} className="px-2! py-2! text-xs font-bold text-black/50 underline underline-offset-4">Manage preferences</button>}
            </div>
          </div>
          <button onClick={() => choose('essential')} aria-label="Dismiss" className="text-black/30 hover:text-black/60"><X size={16} /></button>
        </div>
      </div>
    </div>
  );
}
