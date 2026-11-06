'use client';

import { ArrowLeft, Download, FileText, Layers, Trash2, Upload, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { Button, Card, ErrorText, Input, PageHeader, Textarea } from '@/components/ui';
import { contentApi, type LearningContent } from '@/lib/api';

type ContentType = LearningContent['type'];

const TYPES: { value: ContentType; label: string; icon: typeof FileText }[] = [
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'flashcard', label: 'Flashcard', icon: Layers },
  { value: 'document', label: 'Document', icon: Upload },
];

const BODY_PLACEHOLDER: Record<Exclude<ContentType, 'document'>, string> = {
  note: 'The note text…',
  video: 'https://…',
  flashcard: 'Back of the card…',
};

const TYPE_ICON: Record<ContentType, typeof FileText> = {
  note: FileText,
  video: Video,
  flashcard: Layers,
  document: Upload,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const [type, setType] = useState<ContentType>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function resetForm() {
    setTitle('');
    setBody('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (type === 'document' && !file) return;

    setSaving(true);
    setError(null);
    try {
      if (type === 'document' && file) {
        await contentApi.createDocument(topicId, { title: title.trim(), file });
      } else {
        await contentApi.create(topicId, { type: type as 'note' | 'video' | 'flashcard', title: title.trim(), body: body.trim() || undefined });
      }
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content.');
    } finally {
      setSaving(false);
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

  async function handleDownload(item: LearningContent) {
    try {
      await contentApi.download(item.id, item.original_filename ?? `${item.title}.pdf`);
    } catch {
      setError('Download failed.');
    }
  }

  const canSubmit = !!title.trim() && (type !== 'document' || !!file) && !saving;

  return (
    <Protected>
      <Link href="/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-ink">
        <ArrowLeft size={14} /> Back to subjects
      </Link>
      <PageHeader title="Learning content" description="Notes, videos, flashcards and documents shown in the Learn tab for this topic." />

      <div className="max-w-2xl space-y-6">
        <Card>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="flex flex-wrap gap-2">
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
            {type === 'document' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-left text-sm text-soft hover:border-accent"
                >
                  <Upload size={16} className="shrink-0 text-accent" />
                  {file ? file.name : 'Choose a PDF (max 20MB)'}
                </button>
              </div>
            ) : (
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={BODY_PLACEHOLDER[type]}
                rows={3}
              />
            )}
            <Button type="submit" disabled={!canSubmit}>
              {saving ? 'Adding…' : `Add ${type}`}
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
                        {item.type === 'document' ? (
                          <button
                            onClick={() => handleDownload(item)}
                            className="mt-1 flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                          >
                            <Download size={12} /> {item.original_filename} · {formatSize(item.size_bytes)}
                          </button>
                        ) : (
                          item.body && <p className="mt-1 text-sm text-soft">{item.body}</p>
                        )}
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
