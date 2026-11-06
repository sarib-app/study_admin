'use client';

import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Layers,
  ListChecks,
  LogOut,
  Rocket,
  Settings,
  Users as UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/subjects', label: 'Subjects & Topics', icon: BookOpen },
  { href: '/question-bank', label: 'Question Bank', icon: ListChecks },
  { href: '/content', label: 'Learning Content', icon: Layers },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/users', label: 'Users', icon: UsersIcon },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent2 shadow-[0_8px_16px_rgba(91,127,255,0.35)]">
          <Rocket size={19} className="text-white" strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-sm font-extrabold leading-tight">
            Study<span className="text-accent">Pilot</span>
          </p>
          <p className="text-xs font-semibold text-faint">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_LINKS.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-accent-soft text-ink'
                  : 'text-soft hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              <Icon size={18} strokeWidth={2} className={active ? 'text-accent' : ''} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs text-faint">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="shrink-0 rounded-lg p-2 text-faint hover:bg-white/[0.06] hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
