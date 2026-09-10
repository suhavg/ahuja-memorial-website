'use client';

import { useRouter } from 'next/navigation';

export default function AdminLogout() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  return <button className="button" onClick={logout}>Log out</button>;
}
