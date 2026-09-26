const KEY = 'vendly_recently_viewed';
const WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours
const MAX_ENTRIES = 12;

export type RecentlyViewedEntry = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  viewedAt: number;
};

export function recordProductView(entry: Omit<RecentlyViewedEntry, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const list: RecentlyViewedEntry[] = raw ? JSON.parse(raw) : [];
    const next = [{ ...entry, viewedAt: Date.now() }, ...list.filter(x => x.id !== entry.id)].slice(0, MAX_ENTRIES);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewed(excludeId?: string): RecentlyViewedEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list: RecentlyViewedEntry[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - WINDOW_MS;
    return list.filter(x => x.viewedAt >= cutoff && x.id !== excludeId);
  } catch { return []; }
}
