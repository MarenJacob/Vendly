'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container grid min-h-[60vh] place-items-center py-20 text-center"><div><p className="eyebrow text-[rgba(0,0,0,0.45)]">Something went wrong</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Let's try that again.</h1><p className="mt-3 text-sm text-[rgba(0,0,0,0.5)]">Vendly couldn't load this section right now.</p><button onClick={() => reset()} className="mt-7 rounded-full bg-black px-6 py-3 text-sm font-bold text-white">Retry</button></div></div>;
}
