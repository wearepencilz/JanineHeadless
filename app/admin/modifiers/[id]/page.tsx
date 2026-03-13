'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!modifier) return;
    const { name, value, type } = e.target;
    setModifier({
      ...modifier,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Modifier not found'}
        </div>
        <Link href="/admin/modifiers" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Modifiers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/modifiers" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Modifiers
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Modifier</h1>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={modifier.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={modifier.slug}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={modifier.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="topping">Topping</option>
              <option value="sauce">Sauce</option>
              <option value="crunch">Crunch</option>
              <option value="drizzle">Drizzle</option>
              <option value="premium-addon">Premium Add-on</option>
              <option value="pack-in">Pack-in</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={modifier.description || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (in cents) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="1"
              value={modifier.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Current price: ${(modifier.price / 100).toFixed(2)}
            </p>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={modifier.image || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {modifier.image && (
              <img src={modifier.image} alt="Modifier preview" className="mt-2 h-32 w-auto rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available for Formats
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {formats.map((format) => (
                <label key={format.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={modifier.availableForFormatIds.includes(format.id)}
                    onChange={() => handleFormatToggle(format.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{format.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={modifier.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Link
              href="/admin/modifiers"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
