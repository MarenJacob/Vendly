import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/admin-auth';
import {cloudinarySignature} from '@/lib/cloudinary';
import {getCloudinaryConfig} from '@/lib/cloudinary-config';

export async function POST(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 503 });

  // The official Cloudinary Upload Widget calls this with whatever params it
  // wants signed (paramsToSign); our own custom flow calls it with an empty
  // body, in which case we sign a sensible default ourselves.
  let paramsToSign: Record<string, string | number> = { folder: 'vendly/products', timestamp: Math.floor(Date.now() / 1000) };
  try {
    const body = await req.json();
    if (body?.paramsToSign && typeof body.paramsToSign === 'object') paramsToSign = body.paramsToSign;
  } catch {}

  const signature = cloudinarySignature(paramsToSign, apiSecret);
  return NextResponse.json({ cloudName, apiKey, signature, ...paramsToSign });
}
