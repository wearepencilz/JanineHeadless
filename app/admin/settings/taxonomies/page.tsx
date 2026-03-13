'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TaxonomyValue {
  id: string;
  label: string;
  value: string;
  description?: string;
  sortOrder: number;
  archived: boolean;
}

interface TaxonomyCategory {
  key: string;
  label: string;
  description: string;
}

const TAXONOMY_CATEGORIES: TaxonomyCategory[] = [
  { key: 'ingredientCategories', label: 'Ingredient Categories', description: 'Categories for ingredient classification' },
  { key: 'ingredientRoles', label: 'Ingredient Roles', description: 'How ingredients are used in flavours' },
  { key: 'flavourTypes', label: 'Flavour Types', description: 'Types of flavours (determines format eligibility)' },
  { key: 'formatCategories', label: 'Format Categories', description: 'Categories for product formats' },
  { key: 'modifierTypes', label: 'Modifier Types', description: 'Types of modifiers (toppings, sauces, etc.)' },
  { key: 'allergens', label: 'Allergens', description: 'Common allergen tags' },
  { key: 'dietaryFlags', label: 'Dietary Flags', description: 'Dietary compatibility tags' },
  { key: 'contentBlockTypes', label: 'Content Block Types', description: 'Types of content blocks for launches' },
];

export default function TaxonomiesPage() {
  const [activeTab, setActiveTab] = useState('ingredientCategories');
  const [taxonomies, setTaxonomies] = useState<Record<string, TaxonomyValue[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ label: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  const fetchTaxonomies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/taxonomies');
      if (!response.ok) throw new Error('Failed to fetch taxonomies');
      const data = await response.json();
      setTaxonomies(data.taxonomies || {});
    } catch (error) {
      console.error('Error fetching taxonomies:', error);
      alert('Failed to load taxonomies');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!addForm.label.trim()) {
      alert('Label is required');
      return;
    }

    setSaving(true);
    try {
      // Generate value from label (lowercase, hyphenated)
      const generatedValue = addForm.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const response = await fetch(`/api/settings/taxonomies/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          value: generatedValue
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add value');
      }

      await fetchTaxonomies();
      setAddForm({ label: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding value:', error);
      alert(error instanceof Error ? error.message : 'Failed to add value');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.label.trim()) {
      alert('Label is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/settings/taxonomies/${activeTab}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update value');
      }

      await fetchTaxonomies();
      setEditingId(null);
      setEditForm({ label: '', description: '' });
    } catch (error) {
      console.error('Error updating value:', error);
      alert(error instanceof Error ? error.message : 'Failed to update value');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/settings/taxonomies/${activeTab}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !currentArchived }),
      });

      if (!response.ok) throw new Error('Failed to toggle archive');
      await fetchTaxonomies();
    } catch (error) {
      console.error('Error toggling archive:', error);
      alert('Failed to update value');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this value? This cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/settings/taxonomies/${activeTab}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete value');
      }

      await fetchTaxonomies();
    } catch (error) {
      console.error('Error deleting value:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete value');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (value: TaxonomyValue) => {
    setEditingId(value.id);
    setEditForm({ label: value.label, description: value.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ label: '', description: '' });
  };

  const currentValues = taxonomies[activeTab] || [];
  const sortedValues = [...currentValues].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeValues = sortedValues.filter(v => !v.archived);
  const archivedValues = sortedValues.filter(v => v.archived);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading taxonomies...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/settings"
          className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
        >
          ← Back to Settings
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Taxonomy Management</h1>
        <p className="text-gray-600 mt-1">Manage category and type lists used throughout the CMS</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {TAXONOMY_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === cat.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {TAXONOMY_CATEGORIES.find(c => c.key === activeTab)?.label}
            </h2>
            <p className="text-sm text-gray-600">
              {TAXONOMY_CATEGORIES.find(c => c.key === activeTab)?.description}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add Value
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Value</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Label *"
                value={addForm.label}
                onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={saving || !addForm.label.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                >
                  {saving ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm({ label: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Values */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Active Values ({activeValues.length})
          </h3>
          {activeValues.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No active values</p>
          ) : (
            activeValues.map((value) => (
              <div
                key={value.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {editingId === value.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(value.id)}
                        disabled={saving}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{value.label}</div>
                      {value.description && (
                        <div className="text-sm text-gray-500">{value.description}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">Value: {value.value}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(value)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleArchive(value.id, value.archived)}
                        disabled={saving}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(value.id)}
                        disabled={saving}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Archived Values */}
        {archivedValues.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Archived Values ({archivedValues.length})
            </h3>
            <div className="space-y-2">
              {archivedValues.map((value) => (
                <div
                  key={value.id}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">{value.label}</div>
                    {value.description && (
                      <div className="text-sm text-gray-500">{value.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleArchive(value.id, value.archived)}
                    disabled={saving}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
