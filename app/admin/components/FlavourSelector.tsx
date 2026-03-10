'use client';

import { Format, Flavour } from '@/types';

interface FlavourSelectorProps {
  format: Format;
  flavours: Flavour[];
  selectedFlavourIds: string[];
  onSelect: (flavourIds: string[]) => void;
}

export default function FlavourSelector({ format, flavours, selectedFlavourIds, onSelect }: FlavourSelectorProps) {
  // Ensure flavours is an array
  const flavoursArray = Array.isArray(flavours) ? flavours : [];
  
  // Filter flavours based on format eligibility
  const eligibleFlavours = flavoursArray.filter(flavour => {
    const formatName = format.name.toLowerCase();
    
    // Only filter by specific flags if the format requires it
    if (formatName.includes('twist')) {
      return flavour.canBeUsedInTwist;
    }
    if (formatName.includes('pint')) {
      return flavour.canBeSoldAsPint;
    }
    if (formatName.includes('sandwich')) {
      return flavour.canBeUsedInSandwich;
    }
    
    // For all other formats (Soft Serve, Tasting, etc.), show all flavours regardless of status
    // This allows using archived flavours in new offerings
    return true;
  });

  const handleToggle = (flavourId: string) => {
    if (selectedFlavourIds.includes(flavourId)) {
      onSelect(selectedFlavourIds.filter(id => id !== flavourId));
    } else {
      // Check if we've reached max flavours
      if (selectedFlavourIds.length >= format.maxFlavours) {
        // If single selection, replace
        if (format.maxFlavours === 1) {
          onSelect([flavourId]);
        }
        return;
      }
      onSelect([...selectedFlavourIds, flavourId]);
    }
  };

  const formatName = format.name.toLowerCase();
  const isTwist = formatName.includes('twist');

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Select {format.minFlavours === format.maxFlavours
            ? `exactly ${format.minFlavours}`
            : `${format.minFlavours} to ${format.maxFlavours}`} flavour(s) for this offering
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {eligibleFlavours.length} eligible flavours available
        </p>
      </div>

      {/* Selection Counter */}
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Selected: {selectedFlavourIds.length} / {format.maxFlavours}
          </span>
          {selectedFlavourIds.length > 0 && (
            <button
              type="button"
              onClick={() => onSelect([])}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          )}
        </div>
        {selectedFlavourIds.length < format.minFlavours && (
          <p className="text-xs text-orange-600 mt-1">
            Need {format.minFlavours - selectedFlavourIds.length} more flavour(s)
          </p>
        )}
      </div>

      {/* Twist Builder */}
      {isTwist && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Twist Combination</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-blue-700 mb-1">Flavour A</p>
              <div className="p-2 bg-white border border-blue-300 rounded text-sm">
                {selectedFlavourIds[0]
                  ? flavoursArray.find(f => f.id === selectedFlavourIds[0])?.name
                  : 'Not selected'}
              </div>
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Flavour B</p>
              <div className="p-2 bg-white border border-blue-300 rounded text-sm">
                {selectedFlavourIds[1]
                  ? flavoursArray.find(f => f.id === selectedFlavourIds[1])?.name
                  : 'Not selected'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flavour Grid */}
      {eligibleFlavours.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500">No eligible flavours found for this format</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {eligibleFlavours.map((flavour) => {
            const isSelected = selectedFlavourIds.includes(flavour.id);
            const isDisabled = !isSelected && selectedFlavourIds.length >= format.maxFlavours;

            return (
              <button
                key={flavour.id}
                type="button"
                onClick={() => handleToggle(flavour.id)}
                disabled={isDisabled}
                className={`text-left p-3 border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{flavour.name}</h4>
                  {isSelected && (
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {flavour.type}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {flavour.baseStyle}
                  </span>
                </div>

                {flavour.colour && (
                  <div className="flex items-center mt-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                      style={{ backgroundColor: flavour.colour }}
                    />
                    <span className="text-xs text-gray-500">{flavour.colour}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
