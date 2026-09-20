'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const ICONS: Record<string, string> = {
  'Phones, Computer & Mobile Accessories': '📱',
  'Electronics & Gadgets': '🎧',
  'Home Appliances': '🏠',
  'Power & Energy': '⚡',
  'Home and Living': '🛋️',
  'Lifestyle and Gift': '🎁',
  'Kitchen': '🍳',
  'New Arrivals & Trending': '🔥',
};

export default function CategoryRail({ categories: initial }: { categories?: string[] }) {
  const [categories, setCategories] = useState<string[]>(initial || []);
  useEffect(() => {
    if (initial?.length) return;
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(Array.isArray(d.categories) ? d.categories : [])).catch(() => {});
  }, [initial]);
  if (!categories.length) return null;
  return (
    <section className="container py-8">
      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {categories.map((c) => (
          <Link key={c} href={`/category/${encodeURIComponent(c)}`} className="chip whitespace-nowrap">
            <span className="mr-1.5">{ICONS[c] || '🛍️'}</span>{c}
          </Link>
        ))}
      </div>
    </section>
  );
}
