'use client';

import { useEffect, useState } from 'react';

interface Format {
  id: string;
  name: string;
  description?: string;
  eligibleFlavourTypes?: string[];
  minFlavours: number;
  maxFlavours: number;
  allowMixedTypes?: boolean;
}

interface Flavour {
  id: string;
  name: string;
  type: string;
}

interface FormatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFormatIds: string[]) => void;
  formats: Format[];
  selectedFlavours: Flavour[];
  isGenerating?: boolean;
}

export default function FormatSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  formats,
  selectedFlavours,
  isGenerating = false
}: FormatSelectionModalProps) {
  const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>([]);

  // Determine eligible formats based on selected flavours
  const eligibleFormats = formats.filter(format => {
    // Get unique flavour types from selected flavours
    const flavourTypes = new Set(selectedFlavours.map(f => f.type));
    
    // If format has no eligibility rules, it accepts all flavours
    if (!format.eligibleFlavourTypes || format.eligibleFlavourTypes.length === 0) {
      return true;
    }
    
    // Check if at least one selected flavour type is eligible for this format
    const hasEligibleType = Array.from(flavourTypes).some(type => 
      format.eligibleFlavourTypes!.includes(type)
    );
    
    if (!hasEligibleType) {
      return false;
    }
    
    // For multi-flavour formats, check mixed type rules
    if (format.minFlavours > 1 && flavourTypes.size > 1 && !format.allowMixedTypes) {
      // This format requires multiple flavours but doesn't allow mixed types
      // Only show it if we have enough flavours of the same type
      for (const type of flavourTypes) {
        const flavoursOfType = selectedFlavours.filter(f => f.type === type);
        if (flavoursOfType.length >= format.minFlavours) {
          return true;
        }
      }
      return false;
    }
    
    return true;
  });

  // Auto-select all eligible formats when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFormatIds(eligibleFormats.map(f => f.id));
    }
  }, [isOpen, eligibleFormats.length]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleFormat = (formatId: string) => {
    setSelectedFormatIds(prev =>
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleConfirm = () => {
    if (selectedFormatIds.length === 0) {
      alert('Please select at least one format');
      return;
    }
    onConfirm(selectedFormatIds);
  };

  if (!isOpen) return null;

  // Get unique flavour types for display
  const flavourTypes = Array.from(new Set(selectedFlavours.map(f => f.type)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Formats to Generate
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose which formats to create products for based on your selected flavours
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Selected Flavours Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Selected Flavours ({selectedFlavours.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedFlavours.map(flavour => (
                <span
                  key={flavour.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {flavour.name}
                  <span className="ml-1 text-blue-600">({flavour.type})</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Flavour types: {flavourTypes.join(', ')}
            </p>
          </div>

          {/* Format Selection */}
          {eligibleFormats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No formats are eligible for the selected flavour types.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please check your format configurations or select different flavours.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Eligible Formats ({eligibleFormats.length})
              </h3>
              {eligibleFormats.map(format => (
                <label
                  key={format.id}
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFormatIds.includes(format.id)}
                    onChange={() => toggleFormat(format.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {format.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format.minFlavours === format.maxFlavours
                          ? `${format.minFlavours} flavour${format.minFlavours !== 1 ? 's' : ''}`
                          : `${format.minFlavours}-${format.maxFlavours} flavours`}
                      </span>
                    </div>
                    {format.description && (
                      <p className="mt-1 text-xs text-gray-600">
                        {format.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {format.eligibleFlavourTypes && format.eligibleFlavourTypes.length > 0 ? (
                        format.eligibleFlavourTypes.map(type => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          Accepts all flavour types
                        </span>
                      )}
                      {format.allowMixedTypes && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                          Mixed types OK
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {selectedFormatIds.length} format{selectedFormatIds.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isGenerating || selectedFormatIds.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : `Generate Products`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
