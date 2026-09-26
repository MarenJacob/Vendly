'use client';
import { useEffect } from 'react';
import { recordProductView } from '@/lib/recentlyViewed';
import type { Product } from '@/lib/products';

export default function TrackProductView({ product }: { product: Product }) {
  useEffect(() => {
    recordProductView({ id: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price });
  }, [product.id, product.name, product.image, product.price, product.slug]);
  return null;
}
