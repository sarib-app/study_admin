'use client';

import { BookOpen, ChevronDown, ChevronRight, ListTree, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { Button, Card, ErrorText, Input, PageHeader } from '@/components/ui';
import { subjectsApi, topicsApi, type Subject } from '@/lib/api';

const SUBJECT_COLORS: Record<string, string> = {
  math: 'bg-math/15 text-math',
  bio: 'bg-bio/15 text-bio',
  hist: 'bg-hist/15 text-hist',
  eng: 'bg-eng/15 text-eng',
};

function subjectColorClass(colorKey: string | null): string {
  return SUBJECT_COLORS[colorKey ?? ''] ?? 'bg-accent-soft text-accent';
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newTopicName, setNewTopicName] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      setSubjects(await subjectsApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Genuine async API fetch-on-mount, not a synchronous re-render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  async function handleCreateSubject(e: FormEvent) {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await subjectsApi.create({ name: newSubjectName.trim() });
      setNewSubjectName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subject.');
    }
  }

  async function handleDeleteSubject(id: number) {
    if (!confirm('Delete this subject and all its topics?')) return;
    try {
      await subjectsApi.remove(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject.');
    }
  }

  async function handleCreateTopic(subjectId: number, e: FormEvent) {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    try {
      await topicsApi.create(subjectId, newTopicName.trim());
      setNewTopicName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic.');
    }
  }

  async function handleDeleteTopic(topicId: number) {
    try {
      await topicsApi.remove(topicId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic.');
    }
  }

  return (
    <Protected>
      <PageHeader
        title="Subjects & Topics"
        description="The global list every student picks from during onboarding."
      />

      <Card className="mb-6 max-w-2xl">
        <form onSubmit={handleCreateSubject} className="flex gap-2">
          <Input
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="New subject name"
          />
          <Button type="submit" disabled={!newSubjectName.trim()}>
            <Plus size={16} /> Add
          </Button>
        </form>
      </Card>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : (
        <div className="max-w-2xl space-y-3">
          {subjects.map((subject) => {
            const isOpen = expanded === subject.id;
            return (
              <Card key={subject.id} className="p-0 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : subject.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown size={16} className="shrink-0 text-faint" />
                    ) : (
                      <ChevronRight size={16} className="shrink-0 text-faint" />
                    )}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${subjectColorClass(subject.color_key)}`}>
                      <BookOpen size={16} strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{subject.name}</p>
                      <p className="text-xs text-faint">
                        {subject.topics.length} topic{subject.topics.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/subjects/${subject.id}/questions`}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-soft hover:bg-white/[0.04] hover:text-ink"
                    >
                      <ListTree size={13} /> Question bank
                    </Link>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="rounded-lg p-2 text-faint hover:bg-[rgba(255,107,107,0.1)] hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-line bg-black/10 px-5 py-4">
                    <ul className="space-y-1.5">
                      {subject.topics.map((topic) => (
                        <li
                          key={topic.id}
                          className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-sm text-soft"
                        >
                          {topic.name}
                          <div className="flex items-center gap-3">
                            <Link href={`/topics/${topic.id}/content`} className="text-xs font-semibold text-accent hover:underline">
                              Content
                            </Link>
                            <button onClick={() => handleDeleteTopic(topic.id)} className="text-faint hover:text-danger">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </li>
                      ))}
                      {subject.topics.length === 0 && (
                        <li className="px-3 py-2 text-sm text-faint">No topics yet.</li>
                      )}
                    </ul>
                    <form onSubmit={(e) => handleCreateTopic(subject.id, e)} className="mt-3 flex gap-2">
                      <Input
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        placeholder="New topic name"
                      />
                      <Button type="submit" variant="outline" disabled={!newTopicName.trim()}>
                        Add
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Protected>
  );
}
