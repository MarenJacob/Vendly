import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getAllProducts, getCategoryNames } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = decodeURIComponent(slug);
  const categories = await getCategoryNames();
  if (!categories.includes(name) || name === 'All') notFound();
  const products = await getAllProducts();
  const items = products.filter((p) => p.category === name);
  return (
    <div className="container py-14">
      <p className="eyebrow text-black/45">Category listing</p>
      <h1 className="mt-3 text-6xl font-bold tracking-[-.07em]">{name}.</h1>
      <p className="mt-5 max-w-xl text-sm leading-6 text-black/50">Explore {name.toLowerCase()} selected for the Vendly collection. Products with video previews show a play control on their listing image.</p>
      {items.length ? (
        <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="mt-12 border border-dashed border-black/15 py-20 text-center">
          <p className="text-black/50">No products in this category yet.</p>
        </div>
      )}
    </div>
  );
}
