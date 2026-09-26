import ShopClient from '@/components/ShopClient';
import { getAllProducts, getCategoryNames } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getCategoryNames()]);
  return <ShopClient products={products} categories={categories} />;
}
