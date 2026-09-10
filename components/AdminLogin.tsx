'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.refresh();
      return;
    }

    setStatus('Incorrect password.');
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <h1>Admin</h1>
      <p>Enter your admin password to manage submissions.</p>
      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {status && <div className="form-status">{status}</div>}
      <button className="button primary" type="submit">Sign in</button>
    </form>
  );
}
