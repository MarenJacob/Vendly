import Image from 'next/image';

// To replace the Vendly logo everywhere at once: swap /public/logo.jpg for
// the new file (keep the same filename, or update LOGO_SRC below to match
// a new filename/format, e.g. '/logo.svg'). Also update app/icon.jpg
// separately for the browser favicon, since Next.js requires that as its
// own file.
const LOGO_SRC = '/logo.jpg';

export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Vendly"
      width={size}
      height={size}
      priority
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
