'use client';

import { ArrowLeft, CheckCircle2, Circle, Download, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { Button, Card, ErrorText, Input, PageHeader, Select, Textarea } from '@/components/ui';
import { questionsApi, topicsApi, type Question, type QuestionChoice, type Topic } from '@/lib/api';

const EMPTY_CHOICES: QuestionChoice[] = [
  { text: '', is_correct: true },
  { text: '', is_correct: false },
];

const CSV_TEMPLATE =
  'topic_id,prompt,explanation,choice_1,choice_2,choice_3,choice_4,correct_choice\n' +
  ',What is 2 + 2?,Basic addition.,3,4,5,6,2\n';

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_bank_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function QuestionBankPage() {
  return (
    <Suspense fallback={null}>
      <QuestionBankContent />
    </Suspense>
  );
}

function QuestionBankContent() {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [topicId, setTopicId] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [choices, setChoices] = useState<QuestionChoice[]>(EMPTY_CHOICES);

  const [importResult, setImportResult] = useState<{ created: number; errors: { row: number; errors: Record<string, string[]> }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [q, t] = await Promise.all([questionsApi.list(subjectId), topicsApi.list(subjectId)]);
      setQuestions(q);
      setTopics(t);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the question bank.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Genuine async API fetch-on-mount, not a synchronous re-render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  function resetForm() {
    setTopicId('');
    setPrompt('');
    setExplanation('');
    setChoices(EMPTY_CHOICES);
  }

  function updateChoiceText(index: number, text: string) {
    setChoices((prev) => prev.map((c, i) => (i === index ? { ...c, text } : c)));
  }

  function setCorrectChoice(index: number) {
    setChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === index })));
  }

  function addChoice() {
    if (choices.length >= 6) return;
    setChoices((prev) => [...prev, { text: '', is_correct: false }]);
  }

  function removeChoice(index: number) {
    if (choices.length <= 2) return;
    setChoices((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.some((c) => c.is_correct)) next[0].is_correct = true;
      return next;
    });
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || choices.some((c) => !c.text.trim())) return;
    try {
      await questionsApi.create(subjectId, {
        topic_id: topicId ? Number(topicId) : undefined,
        prompt: prompt.trim(),
        explanation: explanation.trim() || undefined,
        choices,
      });
      resetForm();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question.');
    }
  }

  async function handleDelete(questionId: number) {
    try {
      await questionsApi.remove(questionId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question.');
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await questionsApi.importCsv(subjectId, file);
      setImportResult(result);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <Protected>
      <Link href="/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-ink">
        <ArrowLeft size={14} /> Back to subjects
      </Link>
      <PageHeader title="Question bank" description="The pool quizzes for this subject draw from." />

      <div className="max-w-2xl space-y-6">
        <Card className="flex items-center gap-3">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download size={15} /> Download CSV template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={15} /> Import CSV
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </Card>

        {importResult && (
          <Card>
            <p className="text-sm font-semibold text-ink">{importResult.created} question(s) imported.</p>
            {importResult.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-danger">
                {importResult.errors.map((e) => (
                  <li key={e.row}>
                    Row {e.row}: {Object.values(e.errors).flat().join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Card>
          <form onSubmit={handleCreate} className="space-y-3">
            <Select value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">No topic (mixed-practice bank)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question prompt" rows={2} />
            <div className="space-y-2">
              {choices.map((choice, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => setCorrectChoice(i)} title="Mark as correct answer">
                    {choice.is_correct ? (
                      <CheckCircle2 size={18} className="text-bio" />
                    ) : (
                      <Circle size={18} className="text-faint" />
                    )}
                  </button>
                  <Input value={choice.text} onChange={(e) => updateChoiceText(i, e.target.value)} placeholder={`Choice ${i + 1}`} />
                  {choices.length > 2 && (
                    <button type="button" onClick={() => removeChoice(i)} className="shrink-0 text-faint hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {choices.length < 6 && (
                <button type="button" onClick={addChoice} className="text-xs font-semibold text-accent hover:underline">
                  + Add choice
                </button>
              )}
            </div>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explanation shown after the quiz is submitted (optional)"
              rows={2}
            />
            <Button type="submit" disabled={!prompt.trim() || choices.some((c) => !c.text.trim())}>
              Add question
            </Button>
          </form>
        </Card>

        <ErrorText>{error}</ErrorText>

        {loading ? (
          <p className="text-sm text-faint">Loading…</p>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <Card key={q.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{q.prompt}</p>
                    <ul className="mt-2 space-y-0.5 text-sm">
                      {q.choices.map((c) => (
                        <li key={c.text} className={c.is_correct ? 'font-medium text-bio' : 'text-faint'}>
                          {c.is_correct ? '✓ ' : '· '}
                          {c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => handleDelete(q.id)} className="shrink-0 rounded-lg p-2 text-faint hover:bg-[rgba(255,107,107,0.1)] hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
            {questions.length === 0 && <p className="text-sm text-faint">No questions yet.</p>}
          </div>
        )}
      </div>
    </Protected>
  );
}
