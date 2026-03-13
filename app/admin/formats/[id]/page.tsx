'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Format, FormatCategory, ServingStyle } from '@/types';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';

export default function EditFormatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [format, setFormat] = useState<Format | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    fetchFormat();
    checkUsage();
  }, [params.id]);

  const fetchFormat = async () => {
    try {
      const response = await fetch(`/api/formats/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormat(data);
      } else {
        alert('Format not found');
        router.push('/admin/formats');
      }
    } catch (error) {
      console.error('Error fetching format:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsage = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const products = await response.json();
        const count = products.filter((p: any) => p.formatId === params.id).length;
        setUsageCount(count);
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!format) return;
    
    setSaving(true);

    try {
      const response = await fetch(`/api/formats/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(format),
      });

      if (response.ok) {
        const updatedFormat = await response.json();
        setFormat(updatedFormat);
        alert('Format updated successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update format');
      }
    } catch (error) {
      console.error('Error updating format:', error);
      alert('Failed to update format');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${format?.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/formats/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/formats');
      } else {
        const error = await response.json();
        alert(error.details?.message || error.error || 'Failed to delete format');
      }
    } catch (error) {
      console.error('Error deleting format:', error);
      alert('Failed to delete format');
    }
  };

  const categories: FormatCategory[] = ['frozen', 'food', 'experience', 'bundle'];
  const servingStyles: ServingStyle[] = ['scoop', 'soft-serve', 'packaged', 'plated'];

  if (loading || !format) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading format...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/formats"
          className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
        >
          ← Back to Formats
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Edit Format</h1>
        <p className="text-gray-600 mt-1">Update format template</p>
      </div>

      {usageCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            This format is used in {usageCount} offering{usageCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={format.name}
              onChange={(e) => setFormat({ ...format, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              required
              value={format.slug}
              onChange={(e) => setFormat({ ...format, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TaxonomySelect
              category="formatCategories"
              value={format.category}
              onChange={(value) => setFormat({ ...format, category: value as FormatCategory })}
              label="Category"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serving Style *
              </label>
              <select
                required
                value={format.servingStyle}
                onChange={(e) => setFormat({ ...format, servingStyle: e.target.value as ServingStyle })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {servingStyles.map((style) => (
                  <option key={style} value={style}>
                    {style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={format.description}
              onChange={(e) => setFormat({ ...format, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Section
            </label>
            <input
              type="text"
              value={format.menuSection}
              onChange={(e) => setFormat({ ...format, menuSection: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Flavour Requirements */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Flavour Requirements</h3>
            
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={format.requiresFlavours}
                  onChange={(e) => setFormat({ ...format, requiresFlavours: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Requires Flavours</span>
              </label>
            </div>

            {format.requiresFlavours && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Flavours *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={format.minFlavours}
                      onChange={(e) => setFormat({ ...format, minFlavours: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Flavours *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={format.maxFlavours}
                      onChange={(e) => setFormat({ ...format, maxFlavours: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={format.allowMixedTypes}
                      onChange={(e) => setFormat({ ...format, allowMixedTypes: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Mixed Types (gelato + sorbet)</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Additional Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Options</h3>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={format.canIncludeAddOns}
                  onChange={(e) => setFormat({ ...format, canIncludeAddOns: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Can Include Add-ons (toppings, sauces)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={usageCount > 0}
            className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={usageCount > 0 ? 'Cannot delete format that is in use' : 'Delete format'}
          >
            Delete
          </button>
          <Link
            href="/admin/formats"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
