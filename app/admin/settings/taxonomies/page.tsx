'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';

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
  { key: 'flavourTypes', label: 'Flavour Types', description: 'Types of flavours (determines format eligibility)' },
  { key: 'keyNotes', label: 'Flavour Tags', description: 'Tags for describing flavour profiles' },
  { key: 'ingredientCategories', label: 'Ingredient Categories', description: 'Categories for ingredient classification' },
  { key: 'ingredientRoles', label: 'Ingredient Roles', description: 'How ingredients are used in flavours' },
  { key: 'tastingNotes', label: 'Tasting Notes', description: 'Common tasting note descriptors for ingredients' },
  { key: 'formatCategories', label: 'Format Categories', description: 'Categories for product formats' },
  { key: 'servingStyles', label: 'Serving Styles', description: 'How formats are served (scoop, soft-serve, etc.)' },
  { key: 'modifierTypes', label: 'Modifier Types', description: 'Types of modifiers (toppings, sauces, etc.)' },
  { key: 'allergens', label: 'Allergens', description: 'Common allergen tags' },
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            + Add Value
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Value</h3>
            <div className="space-y-3">
              <Input
                placeholder="Label *"
                value={addForm.label}
                onChange={(value) => setAddForm({ ...addForm, label: value })}
              />
              <Input
                placeholder="Description (optional)"
                value={addForm.description}
                onChange={(value) => setAddForm({ ...addForm, description: value })}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAdd}
                  isLoading={saving}
                  isDisabled={saving || !addForm.label.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setAddForm({ label: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
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
                    <Input
                      value={editForm.label}
                      onChange={(value) => setEditForm({ ...editForm, label: value })}
                    />
                    <Input
                      value={editForm.description}
                      onChange={(value) => setEditForm({ ...editForm, description: value })}
                      placeholder="Description (optional)"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdate(value.id)}
                        isLoading={saving}
                        isDisabled={saving}
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(value)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleArchive(value.id, value.archived)}
                        isDisabled={saving}
                      >
                        Archive
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(value.id)}
                        isDisabled={saving}
                      >
                        Delete
                      </Button>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleArchive(value.id, value.archived)}
                    isDisabled={saving}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
