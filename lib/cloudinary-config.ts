function parseCloudinaryUrl(raw: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
  const match = raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;
  const [, apiKey, apiSecret, cloudName] = match;
  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryConfig(): { cloudName?: string; apiKey?: string; apiSecret?: string } {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };

  // Fall back to the combined CLOUDINARY_URL format Cloudinary's dashboard
  // shows first (cloudinary://<api_key>:<api_secret>@<cloud_name>).
  const combined = process.env.CLOUDINARY_URL;
  if (combined) {
    const parsed = parseCloudinaryUrl(combined);
    if (parsed) return parsed;
  }
  return { cloudName, apiKey, apiSecret };
}
