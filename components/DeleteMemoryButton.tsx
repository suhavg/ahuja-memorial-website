'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteMemoryButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm('Delete this submission permanently?')) return;

    setDeleting(true);
    const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });

    if (res.ok) {
      router.refresh();
    } else {
      alert('Could not delete this submission.');
      setDeleting(false);
    }
  }

  return (
    <button className="delete-memory" type="button" onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Deleting…' : 'Delete'}
    </button>
  );
}
