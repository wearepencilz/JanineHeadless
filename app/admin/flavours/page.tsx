'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Flavour } from '@/types';

export default function FlavoursPage() {
  const router = useRouter();
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFlavours();
  }, [searchTerm, statusFilter]);

  const fetchFlavours = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/flavours?${params.toString()}`);
      const data = await response.json();
      setFlavours(data.data || data);
    } catch (error) {
      console.error('Error fetching flavours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/flavours/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchFlavours();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete flavour');
      }
    } catch (error) {
      console.error('Error deleting flavour:', error);
      alert('Failed to delete flavour');
    }
  };

  const getSyncStatusBadge = (status: string) => {
    const configs = {
      synced: { label: 'Synced', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
      not_linked: { label: 'Not Linked', color: 'bg-gray-100 text-gray-800' }
    };
    const config = configs[status as keyof typeof configs] || configs.not_linked;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading flavours...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Flavours</h1>
          <p className="text-gray-600 mt-1">Manage your flavour archive</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/flavours/seed"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Seed Data
          </Link>
          <Link
            href="/admin/flavours/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Flavour
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search flavours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="seasonal">Seasonal</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {flavours.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'No flavours match your filters' 
              : 'No flavours yet'}
          </p>
          <Link
            href="/admin/flavours/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first flavour
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flavours.map((flavour) => (
                <tr key={flavour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{flavour.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {flavour.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        flavour.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : flavour.status === 'upcoming'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {flavour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flavour.ingredients?.length || 0} ingredients
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSyncStatusBadge(flavour.syncStatus || 'not_linked')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/flavours/${flavour.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(flavour.id, flavour.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
