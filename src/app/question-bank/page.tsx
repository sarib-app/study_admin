'use client';

import { ChevronRight, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { Card, ErrorText, PageHeader } from '@/components/ui';
import { questionsApi, subjectsApi, type Subject } from '@/lib/api';

export default function QuestionBankLandingPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subjectsApi
      .list()
      .then(async (list) => {
        setSubjects(list);
        const pairs = await Promise.all(
          list.map(async (s) => [s.id, (await questionsApi.list(s.id)).length] as const)
        );
        setCounts(Object.fromEntries(pairs));
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load subjects.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected>
      <PageHeader
        title="Question Bank"
        description="Pick a subject to add, edit, or bulk-import the quiz questions it draws from."
      />

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="cursor-pointer transition hover:border-accent/40"
              onClick={() => router.push(`/subjects/${subject.id}/questions`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <ListChecks size={18} strokeWidth={2.25} />
                </div>
                <ChevronRight size={16} className="mt-2 text-faint" />
              </div>
              <p className="mt-3 text-base font-bold text-ink">{subject.name}</p>
              <p className="mt-1 text-sm text-faint">
                {counts[subject.id] ?? 0} question{counts[subject.id] === 1 ? '' : 's'} · {subject.topics.length} topic
                {subject.topics.length === 1 ? '' : 's'}
              </p>
            </Card>
          ))}
          {subjects.length === 0 && <p className="text-sm text-faint">No subjects yet — add one under Subjects & Topics first.</p>}
        </div>
      )}
    </Protected>
  );
}
