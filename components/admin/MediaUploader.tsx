'use client';
import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, UploadCloud } from 'lucide-react';

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (options: Record<string, unknown>, callback: (error: unknown, result: any) => void) => { open: () => void };
    };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadWidgetScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.cloudinary) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load the Cloudinary upload widget script.'));
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export default function MediaUploader({ kind, onUploaded }: { kind: 'image' | 'video'; onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const widgetRef = useRef<{ open: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadWidgetScript()
      .then(async () => {
        if (cancelled || !window.cloudinary) return;
        const sigRes = await fetch('/api/admin/media/sign', { method: 'POST' });
        const sigData = await sigRes.json();
        if (!sigRes.ok) { setError(sigData.error || 'Cloudinary is not configured.'); return; }
        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName: sigData.cloudName,
            apiKey: sigData.apiKey,
            uploadSignature: (callback: (sig: string) => void, paramsToSign: Record<string, unknown>) => {
              fetch('/api/admin/media/sign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paramsToSign }) })
                .then(r => r.json())
                .then(d => callback(d.signature))
                .catch(() => setError('Could not sign the upload. Please try again.'));
            },
            folder: 'vendly/products',
            sources: ['local', 'camera', 'url'],
            multiple: false,
            resourceType: kind === 'video' ? 'video' : 'image',
            clientAllowedFormats: kind === 'video' ? ['mp4', 'mov', 'webm', 'm4v'] : ['png', 'jpg', 'jpeg', 'webp', 'gif'],
            maxFileSize: kind === 'video' ? 80 * 1024 * 1024 : 8 * 1024 * 1024,
            styles: { palette: { tabIcon: '#FF7200', link: '#FF7200' } },
          },
          (widgetError: unknown, result: any) => {
            if (widgetError) { setError('Upload failed. Please try again.'); setBusy(false); return; }
            if (result?.event === 'success') { onUploaded(result.info.secure_url); setBusy(false); }
            if (result?.event === 'close') setBusy(false);
          }
        );
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Could not load the uploader.'));
    return () => { cancelled = true; };
  }, [kind, onUploaded]);

  return (
    <div>
      <button
        type="button"
        disabled={!widgetRef.current}
        onClick={() => { setError(''); setBusy(true); widgetRef.current?.open(); }}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold shadow-sm hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <LoaderCircle className="animate-spin" size={15} /> : <UploadCloud size={15} />} {busy ? 'Working…' : `Upload ${kind}`}
      </button>
      {error && <p role="alert" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
    </div>
  );
}
