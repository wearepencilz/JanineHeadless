'use client';

import { useState } from 'react';

interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  priceRangeV2?: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

interface Props {
  selectedProductId?: string;
  selectedProductHandle?: string;
  onSelect: (product: ShopifyProduct | null) => void;
}

export default function ShopifyProductPicker({ selectedProductId, selectedProductHandle, onSelect }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadProducts = async (query: string = '*') => {
    setLoading(true);
    setError('');
    
    try {
      // If no query, fetch all products (or use a wildcard)
      const searchQuery = query.trim() || '*';
      const response = await fetch(`/api/shopify/products?q=${encodeURIComponent(searchQuery)}&limit=50`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      
      if (data.products.length === 0) {
        setError('No products found');
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    await loadProducts(searchTerm);
  };

  const handleModalOpen = () => {
    setShowModal(true);
    if (!initialLoadDone) {
      loadProducts('*'); // Auto-load all products on first open
      setInitialLoadDone(true);
    }
  };

  const handleSelect = (product: ShopifyProduct) => {
    onSelect(product);
    setShowModal(false);
    setSearchTerm('');
    setProducts([]);
  };

  const handleUnlink = () => {
    onSelect(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchProducts();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Link to Shopify Product
      </label>
      
      {selectedProductId ? (
        <div className="border border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                Linked to Shopify Product
              </p>
              <p className="text-sm text-green-700 mt-1">
                Handle: <span className="font-mono">{selectedProductHandle}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                ID: {selectedProductId}
              </p>
            </div>
            <button
              type="button"
              onClick={handleUnlink}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Unlink
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleModalOpen}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <p className="text-sm text-gray-600">Click to search and link a Shopify product</p>
        </button>
      )}

      {/* Search Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Shopify Products</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={searchProducts}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-900">Loading products...</p>
                </div>
              ) : products.length === 0 && !error ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-gray-900">Search for products or browse all available products</p>
                </div>
              ) : products.length === 0 && error ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-gray-900">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadProducts('*')}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Load all products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {products.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {product.featuredImage && (
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={product.featuredImage.url}
                              alt={product.featuredImage.altText || product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{product.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Handle: <span className="font-mono text-xs">{product.handle}</span>
                          </p>
                          {product.priceRangeV2 && (
                            <p className="text-sm text-gray-600 mt-1">
                              From {product.priceRangeV2.minVariantPrice.currencyCode} {product.priceRangeV2.minVariantPrice.amount}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                            {product.id}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSearchTerm('');
                  setProducts([]);
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
