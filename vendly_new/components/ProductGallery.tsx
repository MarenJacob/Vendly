'use client';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/lib/products';

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : [product.image];
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#ecebe6]">
        {showVideo && product.video ? (
          <>
            <video src={product.video} autoPlay controls playsInline poster={images[0]} className="absolute inset-0 h-full w-full object-cover" />
            <button onClick={() => setShowVideo(false)} aria-label="Close video" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[rgba(255,255,255,0.9)] backdrop-blur"><X size={16} /></button>
          </>
        ) : (
          <>
            <Image src={images[index]} alt={product.name} fill priority sizes="(max-width:768px) 100vw,60vw" className="object-cover transition duration-700" />
            {index === 0 && product.video && (
              <button onClick={() => setShowVideo(true)} aria-label="Play product video" className="absolute inset-0 grid place-items-center bg-[rgba(0,0,0,0.0)] transition hover:bg-[rgba(0,0,0,0.1)]">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[rgba(255,255,255,0.92)] shadow-lg backdrop-blur"><Play size={22} fill="currentColor" className="ml-1" /></span>
              </button>
            )}
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url + i}
              onClick={() => { setIndex(i); setShowVideo(false); }}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl transition ${!showVideo && index === i ? 'ring-2 ring-[#FF7200] ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
            >
              <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
