'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ImageIcon, LoaderCircle, Trash2, UploadCloud, VideoIcon, X } from 'lucide-react';

export default function MediaUploader({ kind, value, onUploaded, onRemove }: { kind: 'image' | 'video'; value?: string; onUploaded: (url: string) => void; onRemove?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(file: File) {
    setError('');
    setProgress(0);

    if (kind === 'image' && !file.type.startsWith('image/')) { setError(`That's a ${file.type || 'unknown'} file, not an image.`); return; }
    if (kind === 'video' && !file.type.startsWith('video/')) { setError(`That's a ${file.type || 'unknown'} file, not a video.`); return; }
    const maxSize = kind === 'image' ? 8 * 1024 * 1024 : 80 * 1024 * 1024;
    if (file.size > maxSize) { setError(`This file is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is ${maxSize / 1024 / 1024}MB.`); return; }

    setBusy(true);

    fetch('/api/admin/media/sign', { method: 'POST' })
      .then(async (sigRes) => {
        const sigData = await sigRes.json();
        if (!sigRes.ok) throw new Error(sigData.error || 'Could not authorize the upload.');
        if (!sigData.cloudName || !sigData.apiKey || !sigData.signature) throw new Error('Upload signing returned incomplete data.');

        await new Promise<void>((resolve, reject) => {
          const body = new FormData();
          body.append('file', file);
          body.append('api_key', sigData.apiKey);
          body.append('timestamp', sigData.timestamp);
          body.append('folder', sigData.folder);
          body.append('signature', sigData.signature);

          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`);
          xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
          xhr.onload = () => {
            try {
              const out = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300 && out.secure_url) {
                onUploaded(out.secure_url);
                resolve();
              } else {
                reject(new Error(out?.error?.message || `Cloudinary rejected the upload (HTTP ${xhr.status}).`));
              }
            } catch {
              reject(new Error('Cloudinary returned an unexpected response.'));
            }
          };
          xhr.onerror = () => reject(new Error('Network error while uploading — check your connection and try again.'));
          xhr.send(body);
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Upload failed.'))
      .finally(() => { setBusy(false); setProgress(0); });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  const Icon = kind === 'image' ? ImageIcon : VideoIcon;

  if (value && !busy) {
    return (
      <div>
        <div className={`relative overflow-hidden rounded-2xl bg-slate-950 ${kind === 'image' ? 'aspect-square' : 'aspect-video'}`}>
          {kind === 'image' ? (
            <Image src={value} alt="Uploaded preview" fill className="object-cover" />
          ) : (
            <video src={value} controls className="h-full w-full object-cover" />
          )}
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold shadow hover:bg-white">Replace</button>
            {onRemove && <button type="button" onClick={onRemove} aria-label="Remove" className="rounded-full bg-white/90 p-1.5 shadow hover:bg-white"><Trash2 size={13} /></button>}
          </div>
        </div>
        <input ref={inputRef} type="file" className="hidden" accept={kind === 'image' ? 'image/*' : 'video/*'} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
        {error && <p role="alert" className="mt-2 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"><X size={13} className="mt-0.5 shrink-0" />{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-center transition ${kind === 'image' ? 'aspect-square' : 'aspect-video'} ${dragOver ? 'border-[#FF7200] bg-[#FFF6EF]' : 'border-slate-200 bg-slate-50 hover:border-slate-300'} ${busy ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input ref={inputRef} type="file" className="hidden" accept={kind === 'image' ? 'image/*' : 'video/*'} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
        {busy ? (
          <>
            <LoaderCircle className="animate-spin text-[#FF7200]" size={22} />
            <p className="text-xs font-semibold text-slate-600">Uploading… {progress}%</p>
            <div className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-[#FF7200] transition-all" style={{ width: `${progress}%` }} /></div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-slate-400"><Icon size={18} /><UploadCloud size={18} /></div>
            <p className="text-xs font-semibold text-slate-600">Tap to upload {kind}, or drag one here</p>
            <p className="text-[11px] text-slate-400">{kind === 'image' ? 'Up to 8MB' : 'Up to 80MB'}</p>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          <X size={13} className="mt-0.5 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}
