'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';

import { Sidebar } from './sidebar';

export function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-faint">Loading…</div>;
  }

  if (!user) return null;

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
