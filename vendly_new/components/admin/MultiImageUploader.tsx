'use client';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import MediaUploader from './MediaUploader';

const MAX_IMAGES = 10;

export default function MultiImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  function addImage(url: string) {
    if (images.length >= MAX_IMAGES) return;
    onChange([...images, url]);
  }
  function remove(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-950">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-[#FF7200] px-2 py-0.5 text-[9px] font-bold uppercase text-white">Main</span>}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent p-1.5">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full bg-[rgba(255,255,255,0.9)] p-1 disabled:opacity-30"><ArrowLeft size={11} /></button>
                <button type="button" onClick={() => remove(i)} aria-label="Remove image" className="rounded-full bg-[rgba(255,255,255,0.9)] p-1"><Trash2 size={11} /></button>
                <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="rounded-full bg-[rgba(255,255,255,0.9)] p-1 disabled:opacity-30"><ArrowRight size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {images.length < MAX_IMAGES ? (
        <MediaUploader kind="image" onUploaded={addImage} />
      ) : (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center text-xs text-slate-400">Maximum of {MAX_IMAGES} images reached.</p>
      )}
      <p className="mt-2 text-[11px] text-slate-400">{images.length}/{MAX_IMAGES} images · the first image is used as the main photo across the store.</p>
    </div>
  );
}
