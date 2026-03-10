'use client';

interface FormatEligibilitySelectorProps {
  canBeUsedInTwist: boolean;
  canBeSoldAsPint: boolean;
  canBeUsedInSandwich: boolean;
  onChange: (field: 'canBeUsedInTwist' | 'canBeSoldAsPint' | 'canBeUsedInSandwich', value: boolean) => void;
}

export default function FormatEligibilitySelector({
  canBeUsedInTwist,
  canBeSoldAsPint,
  canBeUsedInSandwich,
  onChange
}: FormatEligibilitySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Format Eligibility
      </label>
      <p className="text-xs text-gray-500 mb-3">
        By default, flavours can be used in all formats (Soft Serve, Tasting, etc.). 
        Only check these boxes if the flavour has special eligibility for these specific formats.
      </p>
      
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={canBeUsedInTwist}
            onChange={(e) => onChange('canBeUsedInTwist', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Can be used in Twist</div>
            <div className="text-xs text-gray-500">Eligible for soft serve twist combinations (2 flavours)</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={canBeSoldAsPint}
            onChange={(e) => onChange('canBeSoldAsPint', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Can be sold as Pint</div>
            <div className="text-xs text-gray-500">Available as packaged take-home pint</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={canBeUsedInSandwich}
            onChange={(e) => onChange('canBeUsedInSandwich', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Can be used in Sandwich</div>
            <div className="text-xs text-gray-500">Suitable for ice cream sandwich filling</div>
          </div>
        </label>
      </div>
      
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Flavours are automatically eligible for Soft Serve, Tasting, and other general formats. 
          These checkboxes are for special format requirements only.
        </p>
      </div>
    </div>
  );
}
