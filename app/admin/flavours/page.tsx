'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Flavour {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'seasonal' | 'archived';
  shopifyProductHandle?: string;
  ingredientIds: string[];
  createdAt: string;
}

export default function FlavoursPage() {
  const router = useRouter();
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlavours();
  }, []);

  const fetchFlavours = async () => {
    try {
      const res = await fetch('/api/flavours');
      const data = await res.json();
      setFlavours(data);
    } catch (error) {
      console.error('Error fetching flavours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flavour?')) return;

    try {
      await fetch(`/api/flavours/${id}`, { method: 'DELETE' });
      fetchFlavours();
    } catch (error) {
      console.error('Error deleting flavour:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Flavours</h1>
        <Link
          href="/admin/flavours/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Flavour
        </Link>
      </div>

      {flavours.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No flavours yet</p>
          <Link
            href="/admin/flavours/create"
            className="text-blue-600 hover:text-blue-700"
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
                  Shopify Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flavours.map((flavour) => (
                <tr key={flavour.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                          : flavour.status === 'seasonal'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {flavour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flavour.shopifyProductHandle ? (
                      <span className="text-blue-600">{flavour.shopifyProductHandle}</span>
                    ) : (
                      <span className="text-gray-400">Not linked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/flavours/${flavour.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(flavour.id)}
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
