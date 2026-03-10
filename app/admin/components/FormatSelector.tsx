'use client';

import { Format } from '@/types';

interface FormatSelectorProps {
  formats: Format[];
  selectedFormat: Format | null;
  onSelect: (format: Format) => void;
}

export default function FormatSelector({ formats, selectedFormat, onSelect }: FormatSelectorProps) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Select the format that defines the structure of this offering
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formats.map((format) => (
          <button
            key={format.id}
            type="button"
            onClick={() => onSelect(format)}
            className={`text-left p-4 border-2 rounded-lg transition-all ${
              selectedFormat?.id === format.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{format.name}</h3>
              {selectedFormat?.id === format.id && (
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-3">{format.description}</p>

            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center">
                <span className="font-medium mr-2">Category:</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded">{format.category}</span>
              </div>
              
              {format.requiresFlavours && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">Flavours:</span>
                  <span>
                    {format.minFlavours === format.maxFlavours
                      ? `Exactly ${format.minFlavours}`
                      : `${format.minFlavours}-${format.maxFlavours}`}
                  </span>
                </div>
              )}

              <div className="flex items-center">
                <span className="font-medium mr-2">Serving:</span>
                <span>{format.servingStyle}</span>
              </div>

              {format.canIncludeAddOns && (
                <div className="flex items-center text-green-600">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Supports add-ons</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedFormat && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Format Constraints</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {selectedFormat.requiresFlavours && (
              <li>
                • Requires {selectedFormat.minFlavours === selectedFormat.maxFlavours
                  ? `exactly ${selectedFormat.minFlavours}`
                  : `${selectedFormat.minFlavours} to ${selectedFormat.maxFlavours}`} flavour(s)
              </li>
            )}
            {selectedFormat.allowMixedTypes ? (
              <li>• Can mix different flavour types (gelato + sorbet)</li>
            ) : (
              <li>• Cannot mix different flavour types</li>
            )}
            {selectedFormat.canIncludeAddOns && (
              <li>• Can include add-ons and toppings</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
