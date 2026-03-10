'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import FlavourIngredientSelector from '@/app/admin/components/FlavourIngredientSelector';
import ShopifyProductPicker from '@/app/admin/components/ShopifyProductPicker';
import SyncStatusIndicator from '@/app/admin/components/SyncStatusIndicator';
import BaseStyleSelector from '@/app/admin/components/BaseStyleSelector';
import FormatEligibilitySelector from '@/app/admin/components/FormatEligibilitySelector';
import FlavourUsagePanel from '@/app/admin/components/FlavourUsagePanel';
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

  const handleKeyNoteAdd = (note: string) => {
    if (!formData) return;
    if (note.trim() && !formData.keyNotes?.includes(note.trim())) {
      setFormData({ ...formData, keyNotes: [...(formData.keyNotes || []), note.trim()] });
    }
  };

  const handleKeyNoteRemove = (note: string) => {
    if (!formData) return;
    setFormData({ ...formData, keyNotes: formData.keyNotes?.filter(n => n !== note) || [] });
  };

  const handleFormatEligibilityChange = (field: 'canBeUsedInTwist' | 'canBeSoldAsPint' | 'canBeUsedInSandwich', value: boolean) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type || 'gelato'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as FlavourType })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gelato">Gelato</option>
                <option value="sorbet">Sorbet</option>
                <option value="special">Special</option>
                <option value="tasting-component">Tasting Component</option>
              </select>
            </div>

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
              Short Description *
            </label>
            <input
              type="text"
              required
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description for cards (1-2 sentences)"
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
            />
          </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <input
                type="text"
                value={formData.season || ''}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Spring, Summer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Notes
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a flavour note (e.g., nutty, floral)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleKeyNoteAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              {formData.keyNotes && formData.keyNotes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keyNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {note}
                      <button
                        type="button"
                        onClick={() => handleKeyNoteRemove(note)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story
            </label>
            <textarea
              rows={4}
              value={formData.story || ''}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="The inspiration behind this flavour..."
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

        {/* Base Style Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <BaseStyleSelector
            value={formData.baseStyle || 'dairy'}
            onChange={(value) => setFormData({ ...formData, baseStyle: value })}
          />
        </div>

        {/* Format Eligibility Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FormatEligibilitySelector
            canBeUsedInTwist={formData.canBeUsedInTwist ?? true}
            canBeSoldAsPint={formData.canBeSoldAsPint ?? true}
            canBeUsedInSandwich={formData.canBeUsedInSandwich ?? true}
            onChange={handleFormatEligibilityChange}
          />
        </div>

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
          <h2 className="text-lg font-semibold text-gray-900">Shopify Integration</h2>
          
          <ShopifyProductPicker
            selectedProductId={formData.shopifyProductId}
            selectedProductHandle={formData.shopifyProductHandle}
            onSelect={handleProductSelect}
          />

          <SyncStatusIndicator
            status={formData.syncStatus}
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
