'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { contentApi, type LearningContent } from '@/lib/api';

const TYPES: { value: LearningContent['type']; label: string; bodyLabel: string; bodyPlaceholder: string }[] = [
  { value: 'note', label: 'Note', bodyLabel: 'Body', bodyPlaceholder: 'The note text…' },
  { value: 'video', label: 'Video', bodyLabel: 'Video URL', bodyPlaceholder: 'https://…' },
  { value: 'flashcard', label: 'Flashcard', bodyLabel: 'Back', bodyPlaceholder: 'Back of the card…' },
];

export default function TopicContentPage() {
  return (
    <Suspense fallback={null}>
      <TopicContentInner />
    </Suspense>
  );
}

function TopicContentInner() {
  const { id } = useParams<{ id: string }>();
  const topicId = Number(id);

  const [items, setItems] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<LearningContent['type']>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      setItems(await contentApi.list(topicId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Genuine async API fetch-on-mount, not a synchronous re-render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await contentApi.create(topicId, { type, title: title.trim(), body: body.trim() || undefined });
      setTitle('');
      setBody('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content.');
    }
  }

  async function handleDelete(contentId: number) {
    try {
      await contentApi.remove(contentId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content.');
    }
  }

  const activeType = TYPES.find((t) => t.value === type)!;

  return (
    <Protected>
      <div className="mx-auto max-w-2xl">
        <Link href="/subjects" className="text-sm text-neutral-500 hover:text-neutral-300">
          &larr; Back to subjects
        </Link>
        <h1 className="mt-3 text-lg font-semibold text-neutral-50">Learning content</h1>
        <p className="mt-1 text-sm text-neutral-400">Notes, videos and flashcards shown in the Learn tab for this topic.</p>

        <form onSubmit={handleCreate} className="mt-6 space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  type === t.value
                    ? 'border-neutral-100 bg-neutral-100 text-neutral-900'
                    : 'border-neutral-700 text-neutral-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'flashcard' ? 'Front' : 'Title'}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={activeType.bodyPlaceholder}
            rows={3}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400"
          />
          <button type="submit" className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900">
            Add {activeType.label.toLowerCase()}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-neutral-500">Loading…</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-neutral-500">{item.type}</span>
                    <p className="mt-1 text-sm font-medium text-neutral-100">{item.title}</p>
                    {item.body && <p className="mt-1 text-sm text-neutral-400">{item.body}</p>}
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="shrink-0 text-xs text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {items.length === 0 && <p className="text-sm text-neutral-500">No content yet.</p>}
          </ul>
        )}
      </div>
    </Protected>
  );
}
