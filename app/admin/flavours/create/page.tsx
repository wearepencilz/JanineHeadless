'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FlavourIngredientSelector from '@/app/admin/components/FlavourIngredientSelector';
import BaseStyleSelector from '@/app/admin/components/BaseStyleSelector';
import FormatEligibilitySelector from '@/app/admin/components/FormatEligibilitySelector';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyMultiSelect from '@/app/admin/components/TaxonomyMultiSelect';
import type { FlavourIngredient, FlavourType, BaseStyle, Status } from '@/types';

export default function CreateFlavourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    ingredients: [] as FlavourIngredient[],
    tastingNotes: '',
    story: '',
    
    // New Phase 3 fields
    type: 'gelato' as FlavourType,
    baseStyle: 'dairy' as BaseStyle,
    keyNotes: [] as string[],
    colour: '#FFFFFF',
    season: '',
    status: 'active' as Status,
    
    // Format eligibility
    canBeUsedInTwist: true,
    canBeSoldAsPint: true,
    canBeUsedInSandwich: true,
    
    // Admin fields
    sortOrder: 0,
    featured: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/flavours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/flavours');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create flavour');
      }
    } catch (error) {
      console.error('Error creating flavour:', error);
      alert('Failed to create flavour');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyNoteAdd = (note: string) => {
    if (note.trim() && !formData.keyNotes.includes(note.trim())) {
      setFormData({ ...formData, keyNotes: [...formData.keyNotes, note.trim()] });
    }
  };

  const handleKeyNoteRemove = (note: string) => {
    setFormData({ ...formData, keyNotes: formData.keyNotes.filter(n => n !== note) });
  };

  const handleFormatEligibilityChange = (field: 'canBeUsedInTwist' | 'canBeSoldAsPint' | 'canBeUsedInSandwich', value: boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/flavours"
          className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
        >
          ← Back to Flavours
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Add Flavour</h1>
        <p className="text-gray-600 mt-1">Create a new flavour with ingredients</p>
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
              placeholder="e.g., Salted Caramel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TaxonomySelect
              category="flavourTypes"
              value={formData.type}
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
                value={formData.status}
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
              value={formData.shortDescription}
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
              placeholder="Full description of this flavour..."
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
                  value={formData.colour}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colour}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <TaxonomySelect
              category="seasons"
              value={formData.season}
              onChange={(value) => setFormData({ ...formData, season: value })}
              label="Season"
              placeholder="Select season"
            />
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
              {formData.keyNotes.length > 0 && (
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
              value={formData.tastingNotes}
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
              value={formData.story}
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
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
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
            value={formData.baseStyle}
            onChange={(value) => setFormData({ ...formData, baseStyle: value })}
          />
        </div>

        {/* Format Eligibility Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FormatEligibilitySelector
            canBeUsedInTwist={formData.canBeUsedInTwist}
            canBeSoldAsPint={formData.canBeSoldAsPint}
            canBeUsedInSandwich={formData.canBeUsedInSandwich}
            onChange={handleFormatEligibilityChange}
          />
        </div>

        {/* Ingredients Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h2>
          <FlavourIngredientSelector
            selectedIngredients={formData.ingredients}
            onChange={(ingredients) => setFormData({ ...formData, ingredients })}
          />
          <p className="text-sm text-gray-500 mt-3">
            You can link this flavour to a Shopify product after creation
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Creating...' : 'Create Flavour'}
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
