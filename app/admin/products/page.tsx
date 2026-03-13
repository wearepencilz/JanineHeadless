'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  internalName: string;
  publicName: string;
  slug: string;
  status: string;
  formatId: string;
  primaryFlavourIds: string[];
  secondaryFlavourIds?: string[];
  componentIds?: string[];
  toppingIds?: string[];
  description?: string;
  shortCardCopy?: string;
  image?: string;
  price: number;
  tags?: string[];
  onlineOrderable: boolean;
}

interface Format {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter, formatFilter]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (formatFilter !== 'all') {
        params.append('formatId', formatFilter);
      }

      const [productsRes, formatsRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch('/api/formats'),
      ]);

      if (productsRes.ok && formatsRes.ok) {
        const productsData = await productsRes.json();
        const formatsData = await formatsRes.json();
        setProducts(productsData);
        setFormats(formatsData.data || formatsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter by search query
  const filteredProducts = products.filter(product =>
    product.publicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.internalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormatName = (formatId: string) => {
    const format = formats.find(f => f.id === formatId);
    return format?.name || 'Unknown';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sold-out':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage sellable products by combining formats with flavours and modifiers
            </p>
          </div>
          <Link
            href="/admin/products/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sold-out">Sold Out</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Format Filter */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                id="format"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Formats</option>
                {formats.map((format) => (
                  <option key={format.id} value={format.id}>
                    {format.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No products found. Create your first product to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="block bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.publicName}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {product.shortCardCopy || product.description?.substring(0, 100)}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Format:</span>
                    <span>{getFormatName(product.formatId)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Flavours:</span>
                    <span>{product.primaryFlavourIds.length}</span>
                  </div>

                  {product.toppingIds && product.toppingIds.length > 0 && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Modifiers:</span>
                      <span>{product.toppingIds.length}</span>
                    </div>
                  )}

                  {product.price > 0 && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Price:</span>
                      <span>${(product.price / 100).toFixed(2)}</span>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
