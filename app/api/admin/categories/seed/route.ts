import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';

const DEFAULT_CATEGORIES = [
  'Phones, Computer & Mobile Accessories',
  'Electronics & Gadgets',
  'Home Appliances',
  'Power & Energy',
  'Home and Living',
  'Lifestyle and Gift',
  'Kitchen',
  'New Arrivals & Trending',
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST() {
  const actor = await getAdminSession();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const created: string[] = [];
  for (const name of DEFAULT_CATEGORIES) {
    const slug = slugify(name);
    const existing = await prisma.category.findFirst({ where: { OR: [{ name }, { slug }] } });
    if (!existing) {
      await prisma.category.create({ data: { name, slug } });
      created.push(name);
    }
  }
  if (created.length) {
    await prisma.auditLog.create({ data: { actor, action: 'CATEGORIES_SEEDED', entity: 'Category', details: created.join(', ') } });
  }
  return NextResponse.json({ created });
}
