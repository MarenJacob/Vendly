'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchPill() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState('Search products, categories…');
  const keywordsRef = useRef<string[]>(['Search products, categories…']);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const names = Array.from(new Set(data.map((p: { name: string }) => p.name))).slice(0, 6) as string[];
        if (names.length) keywordsRef.current = names.map((n) => `Search "${n}"…`);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (focused || query) return;
    let cancelled = false;
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      if (cancelled) return;
      const words = keywordsRef.current;
      const word = words[wordIndex % words.length];
      if (!deleting) {
        charIndex++;
        setPlaceholder(word.slice(0, charIndex));
        if (charIndex >= word.length) {
          deleting = true;
          setTimeout(tick, 1500);
          return;
        }
      } else {
        charIndex--;
        setPlaceholder(word.slice(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          wordIndex++;
        }
      }
      setTimeout(tick, deleting ? 30 : 55);
    }
    const start = setTimeout(tick, 400);
    return () => { cancelled = true; clearTimeout(start); };
  }, [focused, query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/shop?q=${encodeURIComponent(query.trim())}` : '/shop');
  }

  return (
    <form onSubmit={submit} className="hidden min-w-0 max-w-md flex-1 items-center gap-2.5 rounded-full bg-[rgba(255,255,255,0.08)] px-4 py-2.5 transition focus-within:bg-[rgba(255,255,255,0.14)] lg:flex">
      <Search size={16} className="shrink-0 text-[rgba(255,255,255,0.5)]" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full min-w-0 bg-transparent text-[13px] text-white outline-none placeholder:text-[rgba(255,255,255,0.45)]"
      />
    </form>
  );
}
