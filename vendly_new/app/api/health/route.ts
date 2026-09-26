import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, database: 'ok', latencyMs: Date.now() - started, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, database: 'unavailable', latencyMs: Date.now() - started, timestamp: new Date().toISOString() }, { status: 503 });
  }
}
