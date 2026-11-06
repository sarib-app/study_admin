'use client';

import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { Card, ErrorText, PageHeader } from '@/components/ui';
import { subjectsApi, type Subject } from '@/lib/api';

export default function ContentLandingPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    subjectsApi
      .list()
      .then(setSubjects)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load subjects.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected>
      <PageHeader
        title="Learning Content"
        description="Pick a topic to add the notes, videos, and flashcards shown in Learn."
      />

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <div className="max-w-2xl space-y-3">
          {subjects.map((subject) => {
            const isOpen = expanded === subject.id;
            const totalContent = subject.topics.reduce((sum, t) => sum + (t.content_count ?? 0), 0);
            return (
              <Card key={subject.id} className="overflow-hidden p-0">
                <button
                  onClick={() => setExpanded(isOpen ? null : subject.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  {isOpen ? (
                    <ChevronDown size={16} className="shrink-0 text-faint" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-faint" />
                  )}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Layers size={16} strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{subject.name}</p>
                    <p className="text-xs text-faint">
                      {subject.topics.length} topic{subject.topics.length === 1 ? '' : 's'} · {totalContent} content item
                      {totalContent === 1 ? '' : 's'}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line bg-black/10 px-5 py-4">
                    {subject.topics.length === 0 ? (
                      <p className="px-1 py-1 text-sm text-faint">
                        No topics yet — add one under Subjects &amp; Topics first.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {subject.topics.map((topic) => (
                          <li key={topic.id}>
                            <Link
                              href={`/topics/${topic.id}/content`}
                              className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-sm text-soft transition hover:bg-white/[0.05] hover:text-ink"
                            >
                              <span>{topic.name}</span>
                              <span className="flex items-center gap-2 text-faint">
                                {topic.content_count ?? 0} item{topic.content_count === 1 ? '' : 's'}
                                <ChevronRight size={14} />
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
          {subjects.length === 0 && <p className="text-sm text-faint">No subjects yet.</p>}
        </div>
      )}
    </Protected>
  );
}
