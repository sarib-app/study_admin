'use client';

import { useState, type FormEvent } from 'react';

import { Protected } from '@/components/protected';
import { Badge, Button, Card, ErrorText, Input, PageHeader } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { adminProfileApi } from '@/lib/api';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    setNameSaved(false);
    setNameSaving(true);
    try {
      await adminProfileApi.update({ name });
      await refreshUser();
      setNameSaved(true);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Failed to update name.');
    } finally {
      setNameSaving(false);
    }
  }

  async function handleSavePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    setPasswordSaving(true);
    try {
      await adminProfileApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <Protected>
      <PageHeader title="Settings" description="Your admin account." />

      <div className="max-w-xl space-y-6">
        <Card>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">Account</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{user?.email}</p>
              <p className="mt-0.5 text-xs text-faint">Email can&apos;t be changed here.</p>
            </div>
            <Badge tone="accent">{user?.role}</Badge>
          </div>
        </Card>

        <Card>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">Name</p>
          <form onSubmit={handleSaveName} className="flex items-end gap-3">
            <div className="flex-1">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <Button type="submit" disabled={nameSaving || !name.trim()}>
              {nameSaving ? 'Saving…' : 'Save'}
            </Button>
          </form>
          {nameSaved && <p className="mt-3 text-sm font-medium text-bio">Saved.</p>}
          <ErrorText>{nameError}</ErrorText>
        </Card>

        <Card>
          <p className="mb-4 text-xs font-bold uppercase tracking-wide text-faint">Change password</p>
          <form onSubmit={handleSavePassword} className="space-y-3">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 8 characters, 1 number)"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <Button
              type="submit"
              disabled={passwordSaving || !currentPassword || !newPassword || newPassword !== confirmPassword}
            >
              {passwordSaving ? 'Updating…' : 'Update password'}
            </Button>
          </form>
          {passwordSaved && <p className="mt-3 text-sm font-medium text-bio">Password updated.</p>}
          <ErrorText>{passwordError}</ErrorText>
        </Card>
      </div>
    </Protected>
  );
}
