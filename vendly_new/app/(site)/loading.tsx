import Image from 'next/image';

export default function Loading() {
  return (
    <div className="container grid min-h-[60vh] place-items-center py-20">
      <div className="text-center">
        <div className="relative mx-auto grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#FF7200] opacity-20" />
          <div className="relative h-12 w-12 animate-pulse overflow-hidden rounded-full shadow-[0_8px_24px_rgba(6,20,38,.25)]">
            <Image src="/logo.jpg" alt="Loading Vendly" fill className="object-cover" />
          </div>
        </div>
        <p className="mt-5 text-xs uppercase tracking-[.18em] text-[rgba(0,0,0,0.4)]">Loading Vendly</p>
      </div>
    </div>
  );
}
