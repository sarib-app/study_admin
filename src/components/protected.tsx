'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';

export function Protected({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-neutral-500">Loading…</div>;
  }

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <span className="text-sm font-medium text-neutral-200">Study Pilot Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">{user.email}</span>
          <button onClick={() => logout()} className="text-sm text-neutral-400 hover:text-neutral-100">
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
