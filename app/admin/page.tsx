import AdminLogin from '@/components/AdminLogin';
import AdminLogout from '@/components/AdminLogout';
import DeleteMemoryButton from '@/components/DeleteMemoryButton';
import { adminPasswordConfigured, isAdmin } from '@/lib/admin';
import { getMemories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  if (!adminPasswordConfigured()) {
    return (
      <main className="admin-page">
        <div className="container admin-shell">
          <h1>Admin setup needed</h1>
          <p>Create a <code>.env.local</code> file and add:</p>
          <pre>ADMIN_PASSWORD=your-private-password</pre>
          <p>Then restart <code>npm run dev</code>.</p>
        </div>
      </main>
    );
  }

  if (!isAdmin()) {
    return (
      <main className="admin-page">
        <div className="container admin-shell"><AdminLogin /></div>
      </main>
    );
  }

  const memories = getMemories();

  return (
    <main className="admin-page">
      <div className="container admin-shell">
        <div className="admin-topbar">
          <div>
            <p className="kicker dark-kicker">Private management</p>
            <h1>Submissions</h1>
          </div>
          <AdminLogout />
        </div>

        <div className="admin-list">
          {memories.length === 0 && <div className="empty">No submissions yet.</div>}
          {memories.map((memory) => (
            <article className="admin-card" key={memory.id}>
              {memory.photos.length > 0 && (
                <div className="admin-photo-row">
                  {memory.photos.map((src, index) => (
                    <img key={src} src={src} alt={`Photo ${index + 1}`} />
                  ))}
                </div>
              )}
              <p>{memory.message}</p>
              <small>— {memory.name}{memory.relationship ? `, ${memory.relationship}` : ''}</small>
              <DeleteMemoryButton id={memory.id} />
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
