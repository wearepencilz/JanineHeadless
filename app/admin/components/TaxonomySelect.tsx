'use client';

import { useState, useEffect } from 'react';

export type TaxonomyCategory = 
  | 'ingredientCategories'
  | 'ingredientRoles'
  | 'flavourTypes'
  | 'formatCategories'
  | 'modifierTypes'
  | 'allergens'
  | 'dietaryFlags'
  | 'seasons'
  | 'contentBlockTypes';

interface TaxonomyValue {
  id: string;
  label: string;
  value: string;
  description?: string;
  sortOrder: number;
  archived: boolean;
}

interface TaxonomySelectProps {
  category: TaxonomyCategory;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  showArchived?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

export default function TaxonomySelect({
  category,
  value,
  onChange,
  required = false,
  placeholder = 'Select an option',
  showArchived = false,
  className = '',
  label,
  description
}: TaxonomySelectProps) {
  const [taxonomyValues, setTaxonomyValues] = useState<TaxonomyValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newValue, setNewValue] = useState({ label: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTaxonomyValues();
  }, [category]);

  const fetchTaxonomyValues = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/settings/taxonomies/${category}`);
      if (!response.ok) throw new Error('Failed to fetch taxonomy values');
      const data = await response.json();
      setTaxonomyValues(data.values || []);
    } catch (error) {
      console.error('Error fetching taxonomy values:', error);
    } finally {
      setLoading(false);
    }
  };

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
      
      // Select the newly created value
      onChange(created.value);
      
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

  // Filter out archived values unless showArchived is true
  const filteredValues = taxonomyValues.filter(v => showArchived || !v.archived);
  
  // Sort by sortOrder
  const sortedValues = [...filteredValues].sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
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
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      {!showAddNew ? (
        <div className="space-y-2">
          <select
            value={value}
            onChange={(e) => {
              if (e.target.value === '__ADD_NEW__') {
                setShowAddNew(true);
              } else {
                onChange(e.target.value);
              }
            }}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{placeholder}</option>
            {sortedValues.map((item) => (
              <option key={item.id} value={item.value}>
                {item.label}
              </option>
            ))}
            <option value="__ADD_NEW__" className="text-blue-600 font-medium">
              + Add New
            </option>
          </select>
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
            {creating ? 'Creating...' : 'Create & Select'}
          </button>
        </div>
      )}
    </div>
  );
}
