'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Offering, Format, Flavour } from '@/types';
import ShopifyProductPicker from '../../components/ShopifyProductPicker';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [format, setFormat] = useState<Format | null>(null);
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [creatingShopifyProduct, setCreatingShopifyProduct] = useState(false);

  const [formData, setFormData] = useState({
    internalName: '',
    publicName: '',
    description: '',
    shortCardCopy: '',
    price: '',
    compareAtPrice: '',
    status: 'draft',
    tags: '',
    inventoryTracked: false,
    inventoryQuantity: '',
    onlineOrderable: true,
    pickupOnly: false,
    shopifyProductId: '',
    shopifyProductHandle: '',
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    try {
      const [offeringRes, flavoursRes] = await Promise.all([
        fetch(`/api/products/${params.id}`),
        fetch('/api/flavours'),
      ]);

      if (offeringRes.ok && flavoursRes.ok) {
        const offeringData = await offeringRes.json();
        const flavoursData = await flavoursRes.json();
        
        setOffering(offeringData);
        setFlavours(flavoursData.data || flavoursData);

        // Fetch format
        const formatRes = await fetch(`/api/formats/${offeringData.formatId}`);
        if (formatRes.ok) {
          setFormat(await formatRes.json());
        }

        // Populate form
        setFormData({
          internalName: offeringData.internalName || '',
          publicName: offeringData.publicName || '',
          description: offeringData.description || '',
          shortCardCopy: offeringData.shortCardCopy || '',
          price: offeringData.price ? (offeringData.price / 100).toFixed(2) : '',
          compareAtPrice: offeringData.compareAtPrice ? (offeringData.compareAtPrice / 100).toFixed(2) : '',
          status: offeringData.status || 'draft',
          tags: (offeringData.tags || []).join(', '),
          inventoryTracked: offeringData.inventoryTracked || false,
          inventoryQuantity: offeringData.inventoryQuantity?.toString() || '',
          onlineOrderable: offeringData.onlineOrderable !== undefined ? offeringData.onlineOrderable : true,
          pickupOnly: offeringData.pickupOnly || false,
          shopifyProductId: offeringData.shopifyProductId || '',
          shopifyProductHandle: offeringData.shopifyProductHandle || '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    try {
      const price = formData.price ? Math.round(parseFloat(formData.price) * 100) : 0;
      const compareAtPrice = formData.compareAtPrice ? Math.round(parseFloat(formData.compareAtPrice) * 100) : undefined;

      const payload = {
        internalName: formData.internalName,
        publicName: formData.publicName,
        description: formData.description,
        shortCardCopy: formData.shortCardCopy,
        price,
        compareAtPrice,
        status: formData.status,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        inventoryTracked: formData.inventoryTracked,
        inventoryQuantity: formData.inventoryQuantity ? parseInt(formData.inventoryQuantity) : undefined,
        onlineOrderable: formData.onlineOrderable,
        pickupOnly: formData.pickupOnly,
        shopifyProductId: formData.shopifyProductId || undefined,
        shopifyProductHandle: formData.shopifyProductHandle || undefined,
      };

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        setErrors([error.error || 'Failed to update product']);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors(['Failed to update product']);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        setErrors(['Failed to delete product']);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrors(['Failed to delete product']);
    }
  }

  async function handleCreateShopifyProduct() {
    // Validate before attempting to create
    const validationErrors: string[] = [];
    
    const currentPrice = formData.price ? parseFloat(formData.price) : 0;
    if (!currentPrice || currentPrice <= 0) {
      validationErrors.push('Price must be greater than $0 to create a Shopify product');
    }
    
    if (!offering?.formatId) {
      validationErrors.push('Offering must have a format');
    }
    
    if (!offering?.primaryFlavourIds || offering.primaryFlavourIds.length === 0) {
      validationErrors.push('Offering must have at least one flavour');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!confirm('Create a new Shopify product for this offering?')) {
      return;
    }

    setCreatingShopifyProduct(true);
    setErrors([]);

    try {
      const response = await fetch(`/api/products/${params.id}/create-shopify-product`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message from API
        const errorMessage = data.details 
          ? `${data.error}: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}`
          : data.error || 'Failed to create Shopify product';
        throw new Error(errorMessage);
      }

      // Update form data with new Shopify product info
      setFormData(prev => ({
        ...prev,
        shopifyProductId: data.shopifyProduct.id,
        shopifyProductHandle: data.shopifyProduct.handle,
      }));

      // Update offering state immediately
      if (offering) {
        setOffering({
          ...offering,
          shopifyProductId: data.shopifyProduct.id,
          shopifyProductHandle: data.shopifyProduct.handle,
          syncStatus: 'synced',
          lastSyncedAt: data.offering.lastSyncedAt,
        });
      }

      // Refresh offering data from server to ensure consistency
      await fetchData();

      alert(`✅ Shopify product created successfully!\n\nTitle: ${data.shopifyProduct.title}\nHandle: ${data.shopifyProduct.handle}\n\nThe offering is now linked to this product.`);
    } catch (error) {
      console.error('Error creating Shopify product:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to create Shopify product']);
    } finally {
      setCreatingShopifyProduct(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!offering || !format) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const primaryFlavours = flavours.filter(f => offering.primaryFlavourIds.includes(f.id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update product details and configuration
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Format & Flavours Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Format & Flavours</h3>
        <div className="text-sm text-blue-800">
          <p><span className="font-medium">Format:</span> {format.name}</p>
          <p><span className="font-medium">Flavours:</span> {primaryFlavours.map(f => f.name).join(', ')}</p>
          <p className="text-xs text-blue-600 mt-1">
            Note: Format and flavours cannot be changed after creation. Create a new offering to use different format/flavours.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name *
                </label>
                <input
                  type="text"
                  value={formData.internalName}
                  onChange={(e) => setFormData({ ...formData, internalName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Name *
                </label>
                <input
                  type="text"
                  value={formData.publicName}
                  onChange={(e) => setFormData({ ...formData, publicName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Card Copy
              </label>
              <input
                type="text"
                value={formData.shortCardCopy}
                onChange={(e) => setFormData({ ...formData, shortCardCopy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare At Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="sold-out">Sold Out</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Shopify Integration */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shopify Integration</h3>
              
              {!formData.shopifyProductId && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3">
                    This offering is not linked to a Shopify product yet. You can either create a new one or link to an existing product below.
                  </p>
                  {(!formData.price || parseFloat(formData.price) <= 0) && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Set a price greater than $0 before creating a Shopify product
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateShopifyProduct}
                    disabled={creatingShopifyProduct || !formData.price || parseFloat(formData.price) <= 0}
                    className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creatingShopifyProduct ? 'Creating Product...' : '✨ Create New Shopify Product'}
                  </button>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.shopifyProductId ? 'Linked Shopify Product' : 'Or Link to Existing Product'}
                </label>
                <ShopifyProductPicker
                  selectedProductId={formData.shopifyProductId}
                  selectedProductHandle={formData.shopifyProductHandle}
                  onSelect={(product) => {
                    if (product) {
                      setFormData({
                        ...formData,
                        shopifyProductId: product.id,
                        shopifyProductHandle: product.handle,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        shopifyProductId: '',
                        shopifyProductHandle: '',
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.inventoryTracked}
                  onChange={(e) => setFormData({ ...formData, inventoryTracked: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Track Inventory</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.onlineOrderable}
                  onChange={(e) => setFormData({ ...formData, onlineOrderable: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Online Orderable</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.pickupOnly}
                  onChange={(e) => setFormData({ ...formData, pickupOnly: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Pickup Only</span>
              </label>
            </div>

            {formData.inventoryTracked && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inventory Quantity
                </label>
                <input
                  type="number"
                  value={formData.inventoryQuantity}
                  onChange={(e) => setFormData({ ...formData, inventoryQuantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
