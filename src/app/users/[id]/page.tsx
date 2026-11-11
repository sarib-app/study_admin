'use client';

import { ArrowLeft, BookOpen, CheckCircle2, Clock, FileText, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Protected } from '@/components/protected';
import { Badge, Button, Card, ErrorText, Input, PageHeader, StatCard } from '@/components/ui';
import { usersApi, type ManagedUserDetail } from '@/lib/api';

function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={null}>
      <UserDetailInner />
    </Suspense>
  );
}

function UserDetailInner() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const [user, setUser] = useState<ManagedUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [gradeYear, setGradeYear] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    usersApi
      .show(userId)
      .then((result) => {
        setUser(result);
        setName(result.name);
        setGradeYear(result.grade_year ?? '');
        setCurriculum(result.curriculum ?? '');
        setCity(result.city ?? '');
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load user.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const dirty = user
    ? name.trim() !== user.name ||
      gradeYear.trim() !== (user.grade_year ?? '') ||
      curriculum.trim() !== (user.curriculum ?? '') ||
      city.trim() !== (user.city ?? '')
    : false;

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await usersApi.update(user.id, {
        name: name.trim(),
        grade_year: gradeYear.trim() || null,
        curriculum: curriculum.trim() || null,
        city: city.trim() || null,
      });
      setUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected>
      <Link href="/users" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-ink">
        <ArrowLeft size={14} /> Back to users
      </Link>

      {loading ? (
        <p className="text-sm text-faint">Loading…</p>
      ) : !user ? (
        <ErrorText>{error ?? 'User not found.'}</ErrorText>
      ) : (
        <>
          <PageHeader
            title={user.name}
            description={user.email}
            action={<Badge tone={user.role === 'admin' ? 'accent' : 'neutral'}>{user.role}</Badge>}
          />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard icon={CheckCircle2} label="Completed sessions" value={user.stats.completed_sessions} />
            <StatCard icon={Clock} label="Study time" value={`${formatHours(user.stats.total_study_minutes)}h`} accent="gold" />
            <StatCard icon={ListChecks} label="Quiz attempts" value={user.stats.total_quiz_attempts} />
            <StatCard icon={BookOpen} label="Quiz completion" value={`${user.stats.quiz_completion_rate}%`} accent="bio" />
            <StatCard icon={FileText} label="Documents" value={user.stats.documents_count} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">Profile</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-faint">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-faint">Grade / year</label>
                    <Input value={gradeYear} onChange={(e) => setGradeYear(e.target.value)} placeholder="Not set" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-faint">Curriculum</label>
                    <Input value={curriculum} onChange={(e) => setCurriculum(e.target.value)} placeholder="Not set" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-faint">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Not set" />
                </div>
                <ErrorText>{error}</ErrorText>
                <div className="flex items-center gap-3 pt-1">
                  <Button onClick={handleSave} disabled={!dirty || saving || !name.trim()}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                  {saved && !dirty && <span className="text-sm font-semibold text-bio">Saved.</span>}
                </div>
              </div>
            </Card>

            <Card>
              <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">Subjects</p>
              {user.subjects.length === 0 ? (
                <p className="text-sm text-faint">No subjects picked yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.subjects.map((subject) => (
                    <Badge key={subject.id}>{subject.name}</Badge>
                  ))}
                </div>
              )}
              <p className="mt-5 text-xs font-bold uppercase tracking-wide text-faint">Joined</p>
              <p className="mt-1.5 text-sm text-soft">{new Date(user.created_at).toLocaleDateString()}</p>
            </Card>
          </div>
        </>
      )}
    </Protected>
  );
}
