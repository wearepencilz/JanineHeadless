'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';

interface Flavour {
  id: string;
  name: string;
}

export default function CreateBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [formData, setFormData] = useState({
    flavourId: '',
    batchNumber: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'testing' as 'testing' | 'approved' | 'rejected',
    recipe: '',
    tastingNotes: '',
  });

  useEffect(() => {
    fetchFlavours();
  }, []);

  const fetchFlavours = async () => {
    try {
      const res = await fetch('/api/flavours');
      const data = await res.json();
      setFlavours(data.data || data);
    } catch (error) {
      console.error('Error fetching flavours:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/batches');
      } else {
        alert('Error creating batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Error creating batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin/batches" className="text-blue-600 hover:text-blue-700">
          ← Back to Batches
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Batch</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flavour *
          </label>
          <select
            required
            value={formData.flavourId}
            onChange={(e) => setFormData({ ...formData, flavourId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a flavour</option>
            {flavours.map((flavour) => (
              <option key={flavour.id} value={flavour.id}>
                {flavour.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Batch Number *"
            type="text"
            isRequired
            value={formData.batchNumber}
            onChange={(value) => setFormData({ ...formData, batchNumber: value })}
            placeholder="e.g., B001, 2024-03-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="testing">Testing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <Textarea
            label="Recipe Notes"
            rows={4}
            value={formData.recipe}
            onChange={(value) => setFormData({ ...formData, recipe: value })}
            placeholder="Recipe adjustments, ingredient ratios..."
          />
        </div>

        <div>
          <Textarea
            label="Tasting Notes"
            rows={3}
            value={formData.tastingNotes}
            onChange={(value) => setFormData({ ...formData, tastingNotes: value })}
            placeholder="Flavor profile, texture, improvements needed..."
          />
        </div>

        <div>
          <Textarea
            label="General Notes"
            rows={3}
            value={formData.notes}
            onChange={(value) => setFormData({ ...formData, notes: value })}
            placeholder="Process notes, observations, next steps..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/batches"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            isDisabled={loading}
          >
            Create Batch
          </Button>
        </div>
      </form>
    </div>
  );
}
