'use client';

import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { usersApi, type ManagedUser } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Genuine async API fetch-on-page-change, not a synchronous re-render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    usersApi
      .list(page)
      .then((result) => {
        setUsers(result.data);
        setLastPage(result.last_page);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Protected>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-lg font-semibold text-neutral-50">Users</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Every student and admin account. No subscription column yet &mdash; that feature isn&apos;t built.
        </p>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-neutral-500">Loading…</p>
        ) : (
          <>
            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Subjects</th>
                  <th className="py-2 font-medium">XP</th>
                  <th className="py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-900">
                    <td className="py-2 text-neutral-100">{user.name}</td>
                    <td className="py-2 text-neutral-300">{user.email}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          user.role === 'admin' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2 text-neutral-400">{user.subjects_count}</td>
                    <td className="py-2 text-neutral-400">{user.xp}</td>
                    <td className="py-2 text-neutral-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="mt-4 text-sm text-neutral-500">No users yet.</p>}

            {lastPage > 1 && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500">
                  Page {page} of {lastPage}
                </span>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Protected>
  );
}
