import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { isStorageConfigured, uploadImageBuffer } from '@/lib/supabase-storage';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isStorageConfigured()) return NextResponse.json({ error: 'Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    if (!file.type.startsWith('image/') && file.type !== '') return NextResponse.json({ error: `That file looks like "${file.type}", not an image.` }, { status: 400 });
    if (file.size > 4.5 * 1024 * 1024) return NextResponse.json({ error: `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB — please keep images under 4.5MB.` }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageBuffer(buffer, file.name || 'upload.jpg', file.type || 'image/jpeg');
    return NextResponse.json({ url });
  } catch (e) {
    console.error('[media/upload-image]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed.' }, { status: 500 });
  }
}
