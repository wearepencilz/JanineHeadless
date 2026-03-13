'use client';

import { ReactNode } from 'react';

export interface FilterConfig {
  type: 'search' | 'select';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options?: { value: string; label: string }[];
}

interface TableFiltersProps {
  filters: FilterConfig[];
  children?: ReactNode;
}

export default function TableFilters({ filters, children }: TableFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filters.map((filter, index) => (
          <div key={index}>
            {filter.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
            )}
            {filter.type === 'search' ? (
              <input
                type="text"
                placeholder={filter.placeholder || 'Search...'}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}
