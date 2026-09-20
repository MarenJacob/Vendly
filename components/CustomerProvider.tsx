'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type CustomerUser = { id: string; name: string | null; email: string } | null;
type Ctx = { user: CustomerUser; loading: boolean; refresh: () => void };

const CustomerContext = createContext<Ctx>({ user: null, loading: true, refresh: () => {} });

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return <CustomerContext.Provider value={{ user, loading, refresh: load }}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  return useContext(CustomerContext);
}
