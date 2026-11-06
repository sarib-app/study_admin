'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { Badge, Button, Card, EmptyState, ErrorText, PageHeader } from '@/components/ui';
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
      <PageHeader
        title="Users"
        description="Every student and admin account. No subscription column yet — that feature isn't built."
      />

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <Card className="max-w-5xl overflow-x-auto p-0">
          {users.length === 0 ? (
            <div className="p-6">
              <EmptyState>No users yet.</EmptyState>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-bold uppercase tracking-wide text-faint">
                  <th className="px-5 py-3 font-bold">Name</th>
                  <th className="px-5 py-3 font-bold">Email</th>
                  <th className="px-5 py-3 font-bold">Role</th>
                  <th className="px-5 py-3 font-bold">Subjects</th>
                  <th className="px-5 py-3 font-bold">XP</th>
                  <th className="px-5 py-3 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-semibold text-ink">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-soft">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={user.role === 'admin' ? 'accent' : 'neutral'}>{user.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-faint">{user.subjects_count}</td>
                    <td className="px-5 py-3 text-faint">{user.xp}</td>
                    <td className="px-5 py-3 text-faint">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {lastPage > 1 && (
        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-medium text-faint">
            Page {page} of {lastPage}
          </span>
          <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </Protected>
  );
}
