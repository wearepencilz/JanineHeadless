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

  const loadProducts = async (query: string = '*') => {
    setLoading(true);
    setError('');
    
    try {
      // If no query, fetch all products (or use a wildcard)
      const searchQuery = query.trim() || '*';
      const response = await fetch(`/api/shopify/products?q=${encodeURIComponent(searchQuery)}&limit=50`);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for configuration errors
        if (errorData.code === 'MISSING_STORE_DOMAIN' || errorData.code === 'MISSING_CREDENTIALS') {
          throw new Error('Shopify is not configured. Please add Shopify credentials to your environment variables.');
        }
        
        throw new Error(errorData.error || 'Failed to load products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      
      if (data.products.length === 0) {
        setError('No products found in your Shopify store');
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
    loadProducts('*'); // Always load fresh products when modal opens
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
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search Shopify Products</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {loading ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-900">Loading products...</p>
                </div>
              ) : products.length === 0 && !error ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-gray-900 mb-2">Search for products or browse all available products</p>
                  <button
                    type="button"
                    onClick={() => loadProducts('*')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Load all products
                  </button>
                </div>
              ) : products.length === 0 && error ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-gray-900 mb-3">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadProducts('*')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Try loading all products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {products.map(product => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white"
                    >
                      <div className="flex gap-4">
                        {product.featuredImage && (
                          <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={product.featuredImage.url}
                              alt={product.featuredImage.altText || product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{product.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Handle: <span className="font-mono text-xs">{product.handle}</span>
                          </p>
                          {product.priceRangeV2 && (
                            <p className="text-sm text-gray-600 mt-1">
                              From {product.priceRangeV2.minVariantPrice.currencyCode} ${product.priceRangeV2.minVariantPrice.amount}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSearchTerm('');
                  setProducts([]);
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
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
