'use client';

import { useState, useEffect, useRef } from 'react';

export type TaxonomyCategory = 
  | 'ingredientCategories'
  | 'ingredientRoles'
  | 'flavourTypes'
  | 'formatCategories'
  | 'modifierTypes'
  | 'allergens'
  | 'dietaryFlags'
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
  allowCreate?: boolean;
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
  description,
  allowCreate = true
}: TaxonomySelectProps) {
  const [options, setOptions] = useState<TaxonomyValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      
      // Select the newly created value
      onChange(created.value);
      
      // Reset form
      setNewLabel('');
      setShowCreateForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating taxonomy value:', error);
      alert(error instanceof Error ? error.message : 'Failed to create taxonomy value');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter and sort options
  const visibleOptions = options
    .filter(opt => showArchived || !opt.archived)
    .filter(opt => 
      searchQuery === '' || 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedOption = options.find(opt => opt.value === value);

  if (isLoading) {
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
    <div className={className} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      <div className="relative">
        {/* Selected value display / trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {visibleOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No options found
                </div>
              ) : (
                visibleOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500">{option.description}</div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create new option */}
            {allowCreate && (
              <div className="border-t border-gray-200">
                {!showCreateForm ? (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 font-medium"
                  >
                    + Create new
                  </button>
                ) : (
                  <div className="p-3 bg-blue-50 space-y-2">
                    <input
                      type="text"
                      placeholder="Enter label"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateNew();
                        } else if (e.key === 'Escape') {
                          setShowCreateForm(false);
                          setNewLabel('');
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        disabled={isCreating || !newLabel.trim()}
                        className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {isCreating ? 'Creating...' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewLabel('');
                        }}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
