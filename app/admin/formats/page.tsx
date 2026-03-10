'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Format } from '@/types';

export default function FormatsPage() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    try {
      const response = await fetch('/api/formats');
      if (response.ok) {
        const data = await response.json();
        setFormats(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching formats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/formats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFormats(formats.filter((f) => f.id !== id));
      } else {
        const error = await response.json();
        alert(error.details?.message || error.error || 'Failed to delete format');
      }
    } catch (error) {
      console.error('Error deleting format:', error);
      alert('Failed to delete format');
    }
  };

  const filteredFormats = formats.filter((format) => {
    const matchesSearch = format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         format.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || format.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['frozen', 'food', 'experience', 'bundle'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading formats...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Formats</h1>
          <p className="text-gray-600 mt-1">Manage product format templates</p>
        </div>
        <Link
          href="/admin/formats/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Format
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search formats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredFormats.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No formats match your filters' 
              : 'No formats yet'}
          </p>
          <Link
            href="/admin/formats/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first format
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormats.map((format) => (
            <div
              key={format.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{format.name}</h3>
                    <p className="text-sm text-gray-500">{format.slug}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {format.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {format.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {format.servingStyle}
                  </span>
                  {format.requiresFlavours && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {format.minFlavours === format.maxFlavours 
                        ? `${format.minFlavours} flavour${format.minFlavours !== 1 ? 's' : ''}`
                        : `${format.minFlavours}-${format.maxFlavours} flavours`}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Link
                    href={`/admin/formats/${format.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(format.id, format.name)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
