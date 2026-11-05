'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/subjects', label: 'Subjects & Topics' },
  { href: '/documents', label: 'Documents' },
];

export function Protected({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center text-neutral-500">Loading…</div>;
  }

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-800">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-sm font-medium text-neutral-200">Study Pilot Admin</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{user.email}</span>
            <button onClick={() => logout()} className="text-sm text-neutral-400 hover:text-neutral-100">
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 px-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 px-3 py-2 text-sm font-medium ${
                  active ? 'border-neutral-100 text-neutral-100' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
