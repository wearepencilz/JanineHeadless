'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Select } from '@/app/admin/components/ui/select';
import { Checkbox } from '@/app/admin/components/ui/checkbox';

interface Modifier {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  image?: string;
  price: number;
  allergens: string[];
  dietaryFlags: string[];
  availableForFormatIds: string[];
  status: string;
}

interface Format {
  id: string;
  name: string;
}

export default function EditModifierPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [modifier, setModifier] = useState<Modifier | null>(null);
  const [formats, setFormats] = useState<Format[]>([]);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [modifierRes, formatsRes] = await Promise.all([
        fetch(`/api/modifiers/${params.id}`),
        fetch('/api/formats')
      ]);

      if (modifierRes.ok) {
        const modifierData = await modifierRes.json();
        setModifier(modifierData);
      } else {
        setError('Modifier not found');
      }

      if (formatsRes.ok) {
        const formatsData = await formatsRes.json();
        setFormats(formatsData.data || formatsData);
      }
    } catch (err) {
      setError('Failed to load modifier');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifier) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/modifiers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifier),
      });

      if (response.ok) {
        router.push('/admin/modifiers');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update modifier');
      }
    } catch (err) {
      setError('An error occurred while updating the modifier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this modifier? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/modifiers/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/modifiers');
      } else {
        const data = await response.json();
        if (data.usedIn) {
          setError(`Cannot delete: This modifier is used in ${data.usedIn.length} product(s)`);
        } else {
          setError(data.error || 'Failed to delete modifier');
        }
      }
    } catch (err) {
      setError('An error occurred while deleting the modifier');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormatToggle = (formatId: string) => {
    if (!modifier) return;
    setModifier({
      ...modifier,
      availableForFormatIds: modifier.availableForFormatIds.includes(formatId)
        ? modifier.availableForFormatIds.filter(id => id !== formatId)
        : [...modifier.availableForFormatIds, formatId]
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!modifier) {
    return (
      <EditPageLayout
        title="Edit Modifier"
        backHref="/admin/modifiers"
        backLabel="Back to Modifiers"
        onSave={() => {}}
        onCancel={() => router.push('/admin/modifiers')}
        error={error || 'Modifier not found'}
      >
        <div />
      </EditPageLayout>
    );
  }

  return (
    <EditPageLayout
      title="Edit Modifier"
      backHref="/admin/modifiers"
      backLabel="Back to Modifiers"
      onSave={() => handleSubmit(new Event('submit') as any)}
      onDelete={handleDelete}
      onCancel={() => router.push('/admin/modifiers')}
      saving={saving}
      deleting={deleting}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg px-6 py-4 space-y-6">

          <div>
            <Input
              label="Name *"
              type="text"
              name="name"
              isRequired
              value={modifier.name}
              onChange={(value) => setModifier({ ...modifier, name: value })}
            />
          </div>

          <div>
            <Input
              label="Slug"
              type="text"
              name="slug"
              value={modifier.slug}
              onChange={(value) => setModifier({ ...modifier, slug: value })}
            />
          </div>

          <div>
            <Select
              label="Type *"
              isRequired
              value={modifier.type}
              onChange={(value) => setModifier({ ...modifier, type: value })}
              options={[
                { id: 'topping', label: 'Topping' },
                { id: 'sauce', label: 'Sauce' },
                { id: 'crunch', label: 'Crunch' },
                { id: 'drizzle', label: 'Drizzle' },
                { id: 'premium-addon', label: 'Premium Add-on' },
                { id: 'pack-in', label: 'Pack-in' },
              ]}
            />
          </div>

          <div>
            <Textarea
              label="Description"
              name="description"
              rows={3}
              value={modifier.description || ''}
              onChange={(value) => setModifier({ ...modifier, description: value })}
            />
          </div>

          <div>
            <Input
              label="Price (in cents) *"
              type="number"
              name="price"
              isRequired
              value={String(modifier.price)}
              onChange={(value) => setModifier({ ...modifier, price: parseFloat(value) || 0 })}
              helperText={`Current price: $${(modifier.price / 100).toFixed(2)}`}
            />
          </div>

          <div>
            <Input
              label="Image URL"
              type="text"
              name="image"
              value={modifier.image || ''}
              onChange={(value) => setModifier({ ...modifier, image: value })}
            />
            {modifier.image && (
              <img src={modifier.image} alt="Modifier preview" className="mt-2 h-32 w-auto rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available for Formats
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {formats.map((format) => (
                <Checkbox
                  key={format.id}
                  isSelected={modifier.availableForFormatIds.includes(format.id)}
                  onChange={() => handleFormatToggle(format.id)}
                  label={format.name}
                />
              ))}
            </div>
          </div>

          <div>
            <Select
              label="Status"
              value={modifier.status}
              onChange={(value) => setModifier({ ...modifier, status: value })}
              options={[
                { id: 'active', label: 'Active' },
                { id: 'archived', label: 'Archived' },
              ]}
            />
          </div>

        </div>
      </form>
    </EditPageLayout>
  );
}
