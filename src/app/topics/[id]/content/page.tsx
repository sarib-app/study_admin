'use client';

import { ArrowLeft, FileText, Layers, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { Button, Card, ErrorText, Input, PageHeader, Textarea } from '@/components/ui';
import { contentApi, type LearningContent } from '@/lib/api';

const TYPES: { value: LearningContent['type']; label: string; bodyPlaceholder: string; icon: typeof FileText }[] = [
  { value: 'note', label: 'Note', bodyPlaceholder: 'The note text…', icon: FileText },
  { value: 'video', label: 'Video', bodyPlaceholder: 'https://…', icon: Video },
  { value: 'flashcard', label: 'Flashcard', bodyPlaceholder: 'Back of the card…', icon: Layers },
];

const TYPE_ICON: Record<LearningContent['type'], typeof FileText> = {
  note: FileText,
  video: Video,
  flashcard: Layers,
};

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
      <Link href="/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-ink">
        <ArrowLeft size={14} /> Back to subjects
      </Link>
      <PageHeader title="Learning content" description="Notes, videos and flashcards shown in the Learn tab for this topic." />

      <div className="max-w-2xl space-y-6">
        <Card>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
                      type === t.value
                        ? 'border-transparent bg-gradient-to-br from-accent to-accent2 text-white'
                        : 'border-line text-soft hover:text-ink'
                    }`}
                  >
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'flashcard' ? 'Front' : 'Title'} />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={activeType.bodyPlaceholder} rows={3} />
            <Button type="submit" disabled={!title.trim()}>
              Add {activeType.label.toLowerCase()}
            </Button>
          </form>
        </Card>

        <ErrorText>{error}</ErrorText>

        {loading ? (
          <p className="text-sm text-faint">Loading…</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = TYPE_ICON[item.type];
              return (
                <Card key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold uppercase tracking-wide text-faint">{item.type}</span>
                        <p className="mt-0.5 text-sm font-semibold text-ink">{item.title}</p>
                        {item.body && <p className="mt-1 text-sm text-soft">{item.body}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="shrink-0 rounded-lg p-2 text-faint hover:bg-[rgba(255,107,107,0.1)] hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              );
            })}
            {items.length === 0 && <p className="text-sm text-faint">No content yet.</p>}
          </div>
        )}
      </div>
    </Protected>
  );
}
