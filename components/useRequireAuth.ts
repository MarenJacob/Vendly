'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useCustomer } from './CustomerProvider';

export function useRequireAuth() {
  const { user, loading } = useCustomer();
  const router = useRouter();
  const pathname = usePathname();

  function requireAuth(action: () => void) {
    if (loading) return; // avoid a false redirect while the session check is still in flight
    if (!user) {
      router.push(`/account/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    action();
  }

  return { requireAuth, isAuthed: !!user, loading };
}
