'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FlavourIngredientSelector from '@/app/admin/components/FlavourIngredientSelector';
import FlavourUsagePanel from '@/app/admin/components/FlavourUsagePanel';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyTagSelect from '@/app/admin/components/TaxonomyTagSelect';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import type { Flavour, FlavourIngredient, FlavourType, BaseStyle, Status } from '@/types';

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
    <EditPageLayout
      title="Edit Flavour"
      backHref="/admin/flavours"
      backLabel="Back to Flavours"
      onSave={() => handleSubmit(new Event('submit') as any)}
      onCancel={() => router.push('/admin/flavours')}
      saving={saving}
      maxWidth="4xl"
    >
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
          <TaxonomyTagSelect
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
      </form>
    </EditPageLayout>
  );
}
