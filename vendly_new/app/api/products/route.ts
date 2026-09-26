import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/catalog';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    return NextResponse.json(
      { error: 'Database unavailable. Connect DATABASE_URL before using the production catalogue.' },
      { status: 503 },
    );
  }
}
