'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HeroSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <div key={src + i} className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${i === index ? 'opacity-100' : 'opacity-0'}`}>
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            style={{ animation: i === index ? 'vendlyHeroZoom 7s ease-in-out forwards' : undefined }}
          />
        </div>
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-[rgba(255,255,255,0.4)]'}`} />
          ))}
        </div>
      )}
      <style>{`@keyframes vendlyHeroZoom { from { transform: scale(1); } to { transform: scale(1.08); } }`}</style>
    </div>
  );
}
