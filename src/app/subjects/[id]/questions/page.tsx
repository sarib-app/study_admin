'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
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
      <div className="mx-auto max-w-2xl">
        <Link href="/subjects" className="text-sm text-neutral-500 hover:text-neutral-300">
          &larr; Back to subjects
        </Link>
        <h1 className="mt-3 text-lg font-semibold text-neutral-50">Question bank</h1>
        <p className="mt-1 text-sm text-neutral-400">The pool quizzes for this subject draw from.</p>

        <div className="mt-6 flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <button onClick={downloadTemplate} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200">
            Download CSV template
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200"
          >
            Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </div>

        {importResult && (
          <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
            <p className="text-neutral-200">{importResult.created} question(s) imported.</p>
            {importResult.errors.length > 0 && (
              <ul className="mt-2 space-y-1 text-red-400">
                {importResult.errors.map((e) => (
                  <li key={e.row}>
                    Row {e.row}: {Object.values(e.errors).flat().join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-6 space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
          >
            <option value="">No topic (mixed-practice bank)</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Question prompt"
            rows={2}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400"
          />
          <div className="space-y-2">
            {choices.map((choice, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={choice.is_correct}
                  onChange={() => setCorrectChoice(i)}
                  title="Correct answer"
                />
                <input
                  value={choice.text}
                  onChange={(e) => updateChoiceText(i, e.target.value)}
                  placeholder={`Choice ${i + 1}`}
                  className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-400"
                />
                {choices.length > 2 && (
                  <button type="button" onClick={() => removeChoice(i)} className="text-xs text-red-400">
                    Remove
                  </button>
                )}
              </div>
            ))}
            {choices.length < 6 && (
              <button type="button" onClick={addChoice} className="text-xs text-neutral-400 hover:text-neutral-200">
                + Add choice
              </button>
            )}
          </div>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explanation shown after the quiz is submitted (optional)"
            rows={2}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-400"
          />
          <button type="submit" className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900">
            Add question
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-neutral-500">Loading…</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {questions.map((q) => (
              <li key={q.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-100">{q.prompt}</p>
                    <ul className="mt-2 space-y-0.5 text-sm">
                      {q.choices.map((c) => (
                        <li key={c.text} className={c.is_correct ? 'text-green-400' : 'text-neutral-400'}>
                          {c.is_correct ? '✓ ' : '· '}
                          {c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => handleDelete(q.id)} className="shrink-0 text-xs text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {questions.length === 0 && <p className="text-sm text-neutral-500">No questions yet.</p>}
          </ul>
        )}
      </div>
    </Protected>
  );
}
