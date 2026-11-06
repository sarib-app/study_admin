'use client';

import { BookOpen, CheckCircle2, Clock, FileText, Layers, ListChecks, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { Card, PageHeader, EmptyState } from '@/components/ui';
import { dashboardApi, type OverviewStats } from '@/lib/api';

function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .overview()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load overview.'));
  }, []);

  return (
    <Protected>
      <PageHeader title="Overview" description="How Study Pilot is being used, at a glance." />

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {!stats ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Link href="/users">
              <Card className="flex items-center gap-4 transition hover:border-accent/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Users size={20} strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold leading-tight text-ink">{stats.total_students}</p>
                  <p className="truncate text-xs font-semibold text-faint">Students</p>
                </div>
              </Card>
            </Link>
            <Card className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(52,211,153,0.16)] text-bio">
                <Target size={20} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-tight text-ink">{stats.active_students_30d}</p>
                <p className="truncate text-xs font-semibold text-faint">Active (30d)</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <CheckCircle2 size={20} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-tight text-ink">{stats.completed_sessions}</p>
                <p className="truncate text-xs font-semibold text-faint">Completed sessions</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,201,77,0.16)] text-gold">
                <Clock size={20} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-tight text-ink">{formatHours(stats.total_study_minutes)}h</p>
                <p className="truncate text-xs font-semibold text-faint">Total study time</p>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">Quizzes</p>
              <p className="text-3xl font-extrabold text-ink">{stats.total_quiz_attempts}</p>
              <p className="mt-1 text-sm text-soft">attempts started</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
                  style={{ width: `${stats.quiz_completion_rate}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-faint">{stats.quiz_completion_rate}% completed</p>
            </Card>

            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-faint">Recent documents</p>
                <Link href="/documents" className="text-xs font-semibold text-accent hover:underline">
                  View all
                </Link>
              </div>
              {stats.recent_documents.length === 0 ? (
                <EmptyState>No documents uploaded yet.</EmptyState>
              ) : (
                <ul className="space-y-3">
                  {stats.recent_documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-faint">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{doc.title}</p>
                        <p className="truncate text-xs text-faint">
                          {doc.user.name} · {doc.subject.name}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/subjects">
              <Card className="flex items-center gap-4 transition hover:border-accent/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <BookOpen size={20} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{stats.total_subjects} subjects</p>
                  <p className="text-xs text-faint">Subjects &amp; topics</p>
                </div>
              </Card>
            </Link>
            <Link href="/question-bank">
              <Card className="flex items-center gap-4 transition hover:border-accent/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <ListChecks size={20} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Question bank</p>
                  <p className="text-xs text-faint">Add or import quiz questions</p>
                </div>
              </Card>
            </Link>
            <Link href="/content">
              <Card className="flex items-center gap-4 transition hover:border-accent/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Layers size={20} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Learning content</p>
                  <p className="text-xs text-faint">Notes, videos &amp; flashcards</p>
                </div>
              </Card>
            </Link>
            <Link href="/documents">
              <Card className="flex items-center gap-4 transition hover:border-accent/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <FileText size={20} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{stats.total_documents} documents</p>
                  <p className="text-xs text-faint">Everything students have uploaded</p>
                </div>
              </Card>
            </Link>
          </div>
        </>
      )}
    </Protected>
  );
}
