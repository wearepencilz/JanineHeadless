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

interface TaxonomyTagSelectProps {
  category: TaxonomyCategory;
  values: string[];
  onChange: (values: string[]) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  showArchived?: boolean;
  className?: string;
  allowCreate?: boolean;
}

export default function TaxonomyTagSelect({
  category,
  values,
  onChange,
  label,
  description,
  placeholder = 'Type to search or add...',
  showArchived = false,
  className = '',
  allowCreate = true
}: TaxonomyTagSelectProps) {
  const [options, setOptions] = useState<TaxonomyValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNew = async () => {
    if (!searchQuery.trim()) return;

    setIsCreating(true);
    try {
      // Generate value from label (lowercase, hyphenated)
      const generatedValue = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const response = await fetch(`/api/settings/taxonomies/${category}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: searchQuery.trim(),
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
      
      // Reset
      setSearchQuery('');
      setFocusedIndex(-1);
      inputRef.current?.focus();
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
    setSearchQuery('');
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter(v => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      setFocusedIndex(-1);
      return;
    }

    if (e.key === 'Backspace' && searchQuery === '' && selectedValues.length > 0) {
      // Remove last tag on backspace when input is empty
      onChange(selectedValues.slice(0, -1));
      return;
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    const filteredOptions = getFilteredOptions();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        toggleValue(filteredOptions[focusedIndex].value);
      } else if (allowCreate && searchQuery.trim() && filteredOptions.length === 0) {
        handleCreateNew();
      }
    }
  };

  const getFilteredOptions = () => {
    return options
      .filter(opt => showArchived || !opt.archived)
      .filter(opt => 
        searchQuery === '' || 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const filteredOptions = getFilteredOptions();
  const selectedItems = options.filter(opt => selectedValues.includes(opt.value));
  const showCreateOption = allowCreate && searchQuery.trim() && 
    !filteredOptions.some(opt => opt.label.toLowerCase() === searchQuery.toLowerCase());

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
    <div className={className} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      {/* Input with tags */}
      <div
        className={`min-h-[42px] px-3 py-2 border rounded-lg bg-white cursor-text flex flex-wrap gap-2 items-center ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20' : 'border-gray-300'
        }`}
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {/* Selected tags */}
        {selectedItems.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium"
          >
            {item.label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(item.value);
              }}
              className="hover:text-blue-900 focus:outline-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedItems.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options found
              </div>
            ) : (
              <>
                {filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleValue(option.value)}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                        isFocused ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500">{option.description}</div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Create new option */}
                {showCreateOption && (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    disabled={isCreating}
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isCreating ? 'Creating...' : `Create "${searchQuery}"`}
                  </button>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
