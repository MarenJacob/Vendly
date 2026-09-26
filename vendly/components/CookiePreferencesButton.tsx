'use client';
export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="text-left"
      onClick={() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('vendly:open-cookie-preferences')); }}
    >
      Cookie preferences
    </button>
  );
}
