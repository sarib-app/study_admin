'use client';

import { Rocket } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button, ErrorText, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent2 shadow-[0_8px_16px_rgba(91,127,255,0.35)]">
            <Rocket size={21} className="text-white" strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-ink">
              Study<span className="text-accent">Pilot</span>
            </h1>
            <p className="text-xs font-semibold text-faint">Admin</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <ErrorText>{error}</ErrorText>

        <Button type="submit" disabled={submitting} className="mt-6 w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
