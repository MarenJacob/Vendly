import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { createSignedVideoUpload, isStorageConfigured } from '@/lib/supabase-storage';

export async function POST(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isStorageConfigured()) return NextResponse.json({ error: 'Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
  try {
    const { filename } = await req.json().catch(() => ({ filename: 'video.mp4' }));
    const result = await createSignedVideoUpload(String(filename || 'video.mp4'));
    return NextResponse.json(result);
  } catch (e) {
    console.error('[media/sign-video]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not prepare the upload.' }, { status: 500 });
  }
}
