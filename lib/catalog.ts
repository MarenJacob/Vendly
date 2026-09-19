import { prisma } from '@/lib/prisma';
import type { Product } from './products';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (const delayMs of [250, 600]) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return await fn().catch((error) => { throw lastError ?? error; });
}

type ProductWithRelations = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: unknown;
  oldPrice: unknown;
  stock: number;
  isPreorder: boolean;
  preorderNote: string | null;
  featured: boolean;
  createdAt: Date;
  category: { name: string };
  images: { url: string }[];
  videos: { url: string }[];
};

function mapProduct(row: ProductWithRelations): Product {
  const images = row.images?.length ? row.images.map((i) => i.url) : [PLACEHOLDER_IMAGE];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category?.name ?? 'Uncategorised',
    price: Number(row.price),
    oldPrice: row.oldPrice != null ? Number(row.oldPrice) : undefined,
    image: images[0],
    images,
    video: row.videos?.[0]?.url || undefined,
    description: row.description,
    stock: row.stock,
    isPreorder: row.isPreorder,
    preorderNote: row.preorderNote ?? undefined,
    featured: row.featured,
    createdAt: row.createdAt.toISOString(),
  };
}

// Live catalogue as managed by the admin panel. This is the single source of
// truth for everything customers see — the storefront must never fall back
// to the static demo list in lib/products.ts for real listings.
export async function getAllProducts(): Promise<Product[]> {
  const rows = await withRetry(() => prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      videos: true,
    },
    orderBy: { createdAt: 'desc' },
  }));
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await withRetry(() => prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      videos: true,
    },
  }));
  return row ? mapProduct(row) : null;
}

export async function getCategoryNames(): Promise<string[]> {
  const rows = await withRetry(() => prisma.category.findMany({ orderBy: { name: 'asc' } }));
  return ['All', ...rows.map((c) => c.name)];
}
