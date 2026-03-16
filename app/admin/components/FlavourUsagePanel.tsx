'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/app/admin/components/ui/nav/badges';
import type { OfferingStatus } from '@/types';

interface UsageOffering {
  id: string;
  name: string;
  formatName: string;
  status: OfferingStatus;
}

interface FlavourUsagePanelProps {
  flavourId: string;
}

const STATUS_COLOR: Record<string, 'success' | 'blue' | 'gray' | 'orange' | 'error'> = {
  active: 'success',
  scheduled: 'blue',
  draft: 'gray',
  'sold-out': 'orange',
  archived: 'error',
};

export default function FlavourUsagePanel({ flavourId }: FlavourUsagePanelProps) {
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [offerings, setOfferings] = useState<UsageOffering[]>([]);

  useEffect(() => { fetchUsage(); }, [flavourId]);

  const fetchUsage = async () => {
    try {
      const response = await fetch(`/api/flavours/${flavourId}/usage`);
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.usageCount);
        setOfferings(data.offerings);
      }
    } catch (error) {
      console.error('Error fetching flavour usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Tracking</h2>
        <div className="text-sm text-gray-500">Loading usage data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Tracking</h2>

      {usageCount === 0 ? (
        <div className="text-sm text-gray-500">
          This flavour is not currently used in any offerings.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-700">
            Used in <span className="font-semibold">{usageCount}</span> offering{usageCount !== 1 ? 's' : ''}
          </div>
          <div className="space-y-2">
            {offerings.map((offering) => (
              <div key={offering.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{offering.name}</div>
                  <div className="text-xs text-gray-500">Format: {offering.formatName}</div>
                </div>
                <Badge color={STATUS_COLOR[offering.status] ?? 'gray'} size="sm">
                  {offering.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-xs text-yellow-800">
              ⚠️ This flavour is in use. Archiving it may affect active offerings.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
