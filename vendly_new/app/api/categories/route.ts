import { NextResponse } from 'next/server';
import { getCategoryNames } from '@/lib/catalog';

export async function GET() {
  try {
    const categories = await getCategoryNames();
    return NextResponse.json({ categories: categories.filter((c) => c !== 'All') });
  } catch (error) {
    console.error('Failed to load categories:', error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
