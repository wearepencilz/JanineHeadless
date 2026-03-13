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
  shopifyProductId?: string;
  shopifyProductHandle?: string;
  syncStatus?: string;
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });

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
  // Handle ESC key to close delete confirmation
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && deleteConfirm.show) {
        setDeleteConfirm({ show: false, id: '', name: '' });
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [deleteConfirm.show]);

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
  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm({ show: true, id, name });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', name: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
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

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No products found. Create your first product to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flavours
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shopify
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="block"
                      >
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {product.publicName}
                        </div>
                        {product.shortCardCopy && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.shortCardCopy}
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getFormatName(product.formatId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.primaryFlavourIds.length}</div>
                      {product.toppingIds && product.toppingIds.length > 0 && (
                        <div className="text-xs text-gray-500">+{product.toppingIds.length} modifiers</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.price > 0 ? `$${(product.price / 100).toFixed(2)}` : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.shopifyProductId ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 inline-flex items-center gap-1 w-fit">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Linked
                          </span>
                          {product.shopifyProductHandle && (
                            <a
                              href={`https://admin.shopify.com/store/${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace('.myshopify.com', '')}/products/${product.shopifyProductHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              View →
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Not linked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDeleteClick(e, product.id, product.publicName)}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
