'use client';

import { useState, useEffect } from 'react';
import type { TaxonomyCategory } from './TaxonomySelect';

interface TaxonomyValue {
  id: string;
  label: string;
  value: string;
  description?: string;
  sortOrder: number;
  archived: boolean;
}

interface TaxonomyMultiSelectProps {
  category: TaxonomyCategory;
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  description?: string;
  showArchived?: boolean;
  className?: string;
}

export default function TaxonomyMultiSelect({
  category,
  values,
  onChange,
  label,
  description,
  showArchived = false,
  className = ''
}: TaxonomyMultiSelectProps) {
  const [taxonomyValues, setTaxonomyValues] = useState<TaxonomyValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newValue, setNewValue] = useState({ label: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchTaxonomyValues = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/taxonomies/${category}`);
      if (!response.ok) throw new Error('Failed to fetch taxonomy values');
      const data = await response.json();
      setTaxonomyValues(data.values || []);
    } catch (error) {
      console.error('Error fetching taxonomy values:', error);
      setTaxonomyValues([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomyValues();
  }, [category]);

  const createNewValue = async () => {
    if (!newValue.label.trim()) {
      alert('Label is required');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`/api/settings/taxonomies/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newValue.label,
          description: newValue.description
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create taxonomy value');
      }

      const created = await response.json();
      
      // Add to local list
      setTaxonomyValues([...taxonomyValues, created]);
      
      // Add to selected values
      onChange([...values, created.value]);
      
      // Reset form
      setNewValue({ label: '', description: '' });
      setShowAddNew(false);
    } catch (error) {
      console.error('Error creating taxonomy value:', error);
      alert(error instanceof Error ? error.message : 'Failed to create taxonomy value');
    } finally {
      setCreating(false);
    }
  };

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const removeValue = (value: string) => {
    onChange(values.filter(v => v !== value));
  };

  // Filter out archived values unless showArchived is true
  const filteredValues = taxonomyValues.filter(v => showArchived || !v.archived);
  
  // Sort by sortOrder
  const sortedValues = [...filteredValues].sort((a, b) => a.sortOrder - b.sortOrder);

  // Get selected taxonomy items for display
  const selectedItems = taxonomyValues.filter(v => values.includes(v.value));

  if (loading) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      {/* Selected Values as Tags */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {item.label}
              <button
                type="button"
                onClick={() => removeValue(item.value)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Checkbox List */}
      {!showAddNew ? (
        <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
          {sortedValues.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={values.includes(item.value)}
                onChange={() => toggleValue(item.value)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500">{item.description}</div>
                )}
              </div>
            </label>
          ))}
          
          {/* Add New Option */}
          <button
            type="button"
            onClick={() => setShowAddNew(true)}
            className="w-full p-3 text-left text-sm text-blue-600 hover:bg-blue-50 font-medium"
          >
            + Add New
          </button>
        </div>
      ) : (
        <div className="border border-blue-300 rounded-lg p-4 bg-blue-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Add New Value</h4>
            <button
              type="button"
              onClick={() => {
                setShowAddNew(false);
                setNewValue({ label: '', description: '' });
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Label *"
            value={newValue.label}
            onChange={(e) => setNewValue({ ...newValue, label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          <input
            type="text"
            placeholder="Description (optional)"
            value={newValue.description}
            onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            type="button"
            onClick={createNewValue}
            disabled={creating || !newValue.label.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {creating ? 'Creating...' : 'Create & Add'}
          </button>
        </div>
      )}
    </div>
  );
}
