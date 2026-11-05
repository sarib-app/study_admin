'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { subjectsApi, topicsApi, type Subject } from '@/lib/api';

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
      <div className="mx-auto max-w-2xl">
        <h1 className="text-lg font-semibold text-neutral-50">Subjects &amp; Topics</h1>
        <p className="mt-1 text-sm text-neutral-400">
          The global subject list every student picks from during onboarding.
        </p>

        <form onSubmit={handleCreateSubject} className="mt-6 flex gap-2">
          <input
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="New subject name"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900"
          >
            Add subject
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-neutral-500">Loading…</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {subjects.map((subject) => (
              <li key={subject.id} className="rounded-lg border border-neutral-800 bg-neutral-900">
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => setExpanded(expanded === subject.id ? null : subject.id)}
                    className="text-left text-sm font-medium text-neutral-100"
                  >
                    {subject.name}
                    <span className="ml-2 text-xs text-neutral-500">
                      {subject.topics.length} topic{subject.topics.length === 1 ? '' : 's'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                {expanded === subject.id && (
                  <div className="border-t border-neutral-800 px-4 py-3">
                    <ul className="space-y-1">
                      {subject.topics.map((topic) => (
                        <li
                          key={topic.id}
                          className="flex items-center justify-between rounded-md bg-neutral-950 px-3 py-1.5 text-sm text-neutral-300"
                        >
                          {topic.name}
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                    <form
                      onSubmit={(e) => handleCreateTopic(subject.id, e)}
                      className="mt-3 flex gap-2"
                    >
                      <input
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        placeholder="New topic name"
                        className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
                      />
                      <button
                        type="submit"
                        className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200"
                      >
                        Add topic
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Protected>
  );
}
