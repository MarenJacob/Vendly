'use client';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/products';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/products', { cache: 'no-store' })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Could not load products.');
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Could not load products.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}
