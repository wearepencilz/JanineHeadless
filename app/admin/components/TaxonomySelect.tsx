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
  const [options, setOptions] = useState<TaxonomyValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Filter and sort options
  const visibleOptions = options
    .filter(opt => showArchived || !opt.archived)
    .sort((a, b) => a.sortOrder - b.sortOrder);

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
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {visibleOptions.map((item) => (
          <option key={item.id} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
