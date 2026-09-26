'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCategoryIcon } from './category-icons';

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
        {categories.map((c) => {
          const Icon = getCategoryIcon(c);
          return (
            <Link key={c} href={`/category/${encodeURIComponent(c)}`} className="chip whitespace-nowrap">
              <Icon size={14} className="mr-1.5 inline -mt-0.5" />{c}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
