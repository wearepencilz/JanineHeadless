'use client';

import { useState, useEffect, useRef } from 'react';
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
  allowCreate?: boolean;
}

export default function TaxonomyMultiSelect({
  category,
  values,
  onChange,
  label,
  description,
  showArchived = false,
  className = '',
  allowCreate = true
}: TaxonomyMultiSelectProps) {
  const [options, setOptions] = useState<TaxonomyValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure values is always an array
  const selectedValues = Array.isArray(values) ? values : [];

  useEffect(() => {
    let mounted = true;
    
    async function loadOptions() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/settings/taxonomies/${category}`);
        
        if (!response.ok) {
          console.error('Failed to fetch taxonomy values');
          if (mounted) {
            setOptions([]);
            setIsLoading(false);
          }
          return;
        }
        
        const data = await response.json();
        
        if (mounted) {
          setOptions(Array.isArray(data.values) ? data.values : []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading taxonomy values:', error);
        if (mounted) {
          setOptions([]);
          setIsLoading(false);
        }
      }
    }
    
    loadOptions();
    
    return () => {
      mounted = false;
    };
  }, [category]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNew = async () => {
    if (!newLabel.trim()) return;

    setIsCreating(true);
    try {
      // Generate value from label (lowercase, hyphenated)
      const generatedValue = newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const response = await fetch(`/api/settings/taxonomies/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel.trim(),
          value: generatedValue,
          description: ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create taxonomy value');
      }

      const created = await response.json();
      
      // Add to options list
      setOptions([...options, created]);
      
      // Add to selected values
      onChange([...selectedValues, created.value]);
      
      // Reset form
      setNewLabel('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating taxonomy value:', error);
      alert(error instanceof Error ? error.message : 'Failed to create taxonomy value');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  // Filter and sort options
  const visibleOptions = options
    .filter(opt => showArchived || !opt.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Get selected items for display
  const selectedItems = options.filter(opt => selectedValues.includes(opt.value));

  if (isLoading) {
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
      <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
        {visibleOptions.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(item.value)}
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
      </div>
    </div>
  );
}
