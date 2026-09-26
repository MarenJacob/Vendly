import Image from 'next/image';

// Landscape wordmark, transparent background — swap /public/logo-landscape.png
// to replace the logo everywhere at once. app/icon.jpg (browser favicon) is
// a separate file since Next.js requires a square/icon-shaped asset there.
const LOGO_SRC = '/logo-landscape.png';
const ASPECT_RATIO = 1376 / 412;

export default function Logo({ height = 32, className = '' }: { height?: number; className?: string }) {
  const width = Math.round(height * ASPECT_RATIO);
  return (
    <Image
      src={LOGO_SRC}
      alt="Vendly"
      width={width}
      height={height}
      priority
      className={`object-contain ${className}`}
      style={{ height, width: 'auto' }}
    />
  );
}
