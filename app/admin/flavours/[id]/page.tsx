'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import FlavourIngredientSelector from '@/app/admin/components/FlavourIngredientSelector';
import ShopifyProductPicker from '@/app/admin/components/ShopifyProductPicker';
import SyncStatusIndicator from '@/app/admin/components/SyncStatusIndicator';
import FlavourUsagePanel from '@/app/admin/components/FlavourUsagePanel';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyMultiSelect from '@/app/admin/components/TaxonomyMultiSelect';
import type { Flavour, FlavourIngredient, SyncStatus, FlavourType, BaseStyle, Status } from '@/types';

export default function EditFlavourPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Flavour | null>(null);

  useEffect(() => {
    if (id) {
      fetchFlavour();
    }
  }, [id]);

  const fetchFlavour = async () => {
    try {
      const response = await fetch(`/api/flavours/${id}`);
      
      if (response.ok) {
        const flavour = await response.json();
        setFormData(flavour);
      } else {
        alert('Flavour not found');
        router.push('/admin/flavours');
      }
    } catch (error) {
      console.error('Error fetching flavour:', error);
      alert('Error loading flavour');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/flavours/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/flavours');
      } else {
        const error = await response.json();
        alert(error.error || 'Error updating flavour');
      }
    } catch (error) {
      console.error('Error updating flavour:', error);
      alert('Error updating flavour');
    } finally {
      setSaving(false);
    }
  };

  const handleProductSelect = (product: any) => {
    if (!formData) return;
    
    if (product) {
      setFormData({
        ...formData,
        shopifyProductId: product.id,
        shopifyProductHandle: product.handle,
        syncStatus: 'pending' as SyncStatus
      });
    } else {
      setFormData({
        ...formData,
        shopifyProductId: undefined,
        shopifyProductHandle: undefined,
        syncStatus: 'not_linked' as SyncStatus,
        lastSyncedAt: undefined,
        syncError: undefined
      });
    }
  };

  const handleIngredientsChange = (ingredients: FlavourIngredient[]) => {
    if (!formData) return;
    setFormData({ ...formData, ingredients });
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link 
          href="/admin/flavours" 
          className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
        >
          ← Back to Flavours
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Edit Flavour</h1>
        <p className="text-gray-600 mt-1">Update flavour details and Shopify integration</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TaxonomySelect
              category="flavourTypes"
              value={formData.type || 'gelato'}
              onChange={(value) => setFormData({ ...formData, type: value as FlavourType })}
              label="Type"
              required
              description="Determines which formats this flavour can be used in"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Notes *
            </label>
            <input
              type="text"
              required
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief, merchandisable descriptor (e.g., Browned butter, grilled corn, honey)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Longer editorial description (e.g., A sweet, savoury gelato built around grilled corn, browned butter, and honey)"
            />
          </div>

          {/* Base - Only show for gelato or special types */}
          {(formData.type === 'gelato' || formData.type === 'special') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base *
              </label>
              <select
                value={formData.baseStyle || 'dairy'}
                onChange={(e) => setFormData({ ...formData, baseStyle: e.target.value as BaseStyle })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dairy">Dairy</option>
                <option value="non-dairy">Non-Dairy</option>
                <option value="cheese">Cheese</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Flavour Tags - Connected to taxonomy */}
          <TaxonomyMultiSelect
            category="keyNotes"
            values={formData.keyNotes || []}
            onChange={(values) => setFormData({ ...formData, keyNotes: values })}
            label="Flavour Tags"
            description="Select tags that describe this flavour (e.g., smoky, sweet, summer)"
            allowCreate={true}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasting Notes
            </label>
            <textarea
              rows={3}
              value={formData.tastingNotes || ''}
              onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sweet, creamy, hints of vanilla..."
            />
          </div>
        </div>

        {/* Advanced Options - Collapsible */}
        <details className="bg-white rounded-lg border border-gray-200">
          <summary className="cursor-pointer p-6 font-medium text-gray-900 hover:bg-gray-50">
            Advanced Options
          </summary>
          <div className="px-6 pb-6 space-y-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colour
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.colour || '#FFFFFF'}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.colour || '#FFFFFF'}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archive Note
              </label>
              <textarea
                rows={4}
                value={formData.story || ''}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Context about this flavour (e.g., Served alongside Wild Tomatoes)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder ?? 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
            </div>
          </div>
        </details>

        {/* Ingredients Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h2>
          <FlavourIngredientSelector
            selectedIngredients={formData.ingredients || []}
            onChange={handleIngredientsChange}
          />
        </div>

        {/* Usage Tracking Card */}
        <FlavourUsagePanel flavourId={formData.id} />

        {/* Shopify Integration Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Shopify Integration</h2>
            {formData.shopifyProductId ? (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Linked to Shopify
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                Not linked
              </span>
            )}
          </div>
          
          {formData.shopifyProductId ? (
            // Linked State
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 mb-2">
                      Connected to Shopify Product
                    </p>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>
                        <span className="font-medium">Handle:</span>{' '}
                        <span className="font-mono text-xs">{formData.shopifyProductHandle}</span>
                      </p>
                      <p className="text-xs text-green-600">
                        Product ID: {formData.shopifyProductId}
                      </p>
                    </div>
                    {formData.shopifyProductHandle && (
                      <a
                        href={`https://admin.shopify.com/store/${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace('.myshopify.com', '')}/products/${formData.shopifyProductHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                      >
                        View in Shopify Admin
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleProductSelect(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium ml-4"
                  >
                    Unlink
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 This flavour is linked to a Shopify product. Changes to flavour details may need to be synced manually.
                </p>
              </div>
            </div>
          ) : (
            // Not Linked State
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  This flavour is not connected to Shopify. Link it to an existing product:
                </p>
                
                <ShopifyProductPicker
                  selectedProductId={formData.shopifyProductId}
                  selectedProductHandle={formData.shopifyProductHandle}
                  onSelect={handleProductSelect}
                />
              </div>
            </div>
          )}

          <SyncStatusIndicator
            status={formData.syncStatus || 'not_linked'}
            lastSyncedAt={formData.lastSyncedAt}
            syncError={formData.syncError}
            flavourId={formData.id}
            productId={formData.shopifyProductId}
            onResync={fetchFlavour}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/flavours"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
