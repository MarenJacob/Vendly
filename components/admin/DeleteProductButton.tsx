'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2, LoaderCircle } from 'lucide-react';

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Could not delete product.');
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      alert('Could not delete product.');
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      aria-label={`Delete ${name}`}
      className="inline-flex rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {busy ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}
    </button>
  );
}
