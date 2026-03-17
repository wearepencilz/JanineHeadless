'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/app/admin/components/ui/buttons/button';
import { Input } from '@/app/admin/components/ui/input';
import { useToast } from '@/app/admin/components/ToastContainer';

const ROLES = ['super_admin', 'admin', 'editor'] as const;
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

interface UserForm {
  name: string;
  email: string;
  username: string;
  role: string;
  active: boolean;
  password?: string;
}

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params?.id === 'new';
  const toast = useToast();

  const [form, setForm] = useState<UserForm>({
    name: '', email: '', username: '', role: 'editor', active: true, password: '',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetch('/api/users')
        .then((r) => r.json())
        .then((users) => {
          const user = users.find((u: any) => u.id === params?.id);
          if (user) setForm({ ...user, password: '' });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const body: any = { name: form.name, email: form.email, username: form.username, role: form.role, active: form.active };
    if (isNew) body.password = form.password;

    try {
      const res = await fetch(isNew ? '/api/users' : `/api/users/${params?.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isNew ? 'User created' : 'User saved');
        router.push('/admin/users');
      } else {
        const err = await res.json();
        toast.error('Save failed', err.error ?? 'Something went wrong');
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{isNew ? 'New User' : 'Edit User'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Name</label>
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} isRequired />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Email</label>
            <Input value={form.email} onChange={(v) => setForm({ ...form, email: v })} isRequired />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Username</label>
            <Input value={form.username} onChange={(v) => setForm({ ...form, username: v })} isRequired />
          </div>
          {isNew && (
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-900">Password</label>
              <Input value={form.password ?? ''} onChange={(v) => setForm({ ...form, password: v })} isRequired />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          {!isNew && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="active" className="text-sm text-gray-700">Active</label>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="submit" color="primary" size="sm" isDisabled={saving} isLoading={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button color="secondary" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
