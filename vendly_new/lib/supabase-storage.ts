import { createClient } from '@supabase/supabase-js';

const BUCKET = 'product-media';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isStorageConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function randomPath(originalName: string) {
  const ext = (originalName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  return `products/${name}`;
}

export async function uploadImageBuffer(buffer: Buffer, originalName: string, contentType: string) {
  const client = getClient();
  if (!client) throw new Error('Supabase Storage is not configured.');
  const path = randomPath(originalName);
  const { error } = await client.storage.from(BUCKET).upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createSignedVideoUpload(originalName: string) {
  const client = getClient();
  if (!client) throw new Error('Supabase Storage is not configured.');
  const path = randomPath(originalName);
  const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(error.message);
  const { data: pub } = client.storage.from(BUCKET).getPublicUrl(path);
  return { signedUrl: data.signedUrl, token: data.token, path, publicUrl: pub.publicUrl };
}
