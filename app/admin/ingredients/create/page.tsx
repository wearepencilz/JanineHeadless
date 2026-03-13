'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '../../components/ImageUploader';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyMultiSelect from '@/app/admin/components/TaxonomyMultiSelect';
import { ingredientCategoryOptions, ingredientRoleOptions, ingredientDescriptorTags } from '@/types';

export default function CreateIngredientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latinName: '',
    origin: '',
    category: 'Fruit' as typeof ingredientCategoryOptions[number],
    roles: [] as string[],
    descriptors: [] as string[],
    description: '',
    story: '',
    tastingNotes: '',
    supplier: '',
    farm: '',
    seasonal: false,
    availableMonths: [] as number[],
    allergens: [] as string[],
    dietaryFlags: [] as string[],
    isOrganic: false,
    image: '',
    imageAlt: '',
  });

  const commonAllergens = ['dairy', 'nuts', 'gluten', 'soy', 'eggs', 'sesame'];
  const dietaryOptions = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tastingNotes: formData.tastingNotes.split(',').map(n => n.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        router.push('/admin/ingredients');
      } else {
        alert('Failed to create ingredient');
      }
    } catch (error) {
      console.error('Error creating ingredient:', error);
      alert('Failed to create ingredient');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleDescriptor = (descriptor: string) => {
    setFormData(prev => ({
      ...prev,
      descriptors: prev.descriptors.includes(descriptor)
        ? prev.descriptors.filter(d => d !== descriptor)
        : [...prev.descriptors, descriptor]
    }));
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const toggleDietaryFlag = (flag: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryFlags: prev.dietaryFlags.includes(flag)
        ? prev.dietaryFlags.filter(f => f !== flag)
        : [...prev.dietaryFlags, flag]
    }));
  };

  const toggleMonth = (monthIndex: number) => {
    setFormData(prev => ({
      ...prev,
      availableMonths: prev.availableMonths.includes(monthIndex)
        ? prev.availableMonths.filter(m => m !== monthIndex)
        : [...prev.availableMonths, monthIndex].sort((a, b) => a - b)
    }));
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/ingredients"
          className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
        >
          ← Back to Ingredients
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Add Ingredient</h1>
        <p className="text-gray-600 mt-1">Create a new ingredient with provenance details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Basic Info */}
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
              placeholder="e.g., Blood Orange"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latin Name
            </label>
            <input
              type="text"
              value={formData.latinName}
              onChange={(e) => setFormData({ ...formData, latinName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Citrus × sinensis"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin *
              </label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sicily"
              />
            </div>

            <TaxonomySelect
              category="ingredientCategories"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value as any })}
              label="Primary Category"
              required
            />
          </div>

          {/* Usage Roles */}
          <TaxonomyMultiSelect
            category="ingredientRoles"
            values={formData.roles}
            onChange={(values) => setFormData({ ...formData, roles: values })}
            label="Usage Roles"
            description="Select all applicable usage roles"
          />

          {/* Descriptor Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descriptor Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {ingredientDescriptorTags.map((descriptor) => (
                <button
                  key={descriptor}
                  type="button"
                  onClick={() => toggleDescriptor(descriptor)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    formData.descriptors.includes(descriptor)
                      ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  {descriptor}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">Add descriptive characteristics</p>
          </div>

          {/* Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this ingredient..."
            />
          </div>

          {/* Story */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Story & Provenance
            </label>
            <textarea
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell the story of this ingredient..."
            />
          </div>

          {/* Tasting Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasting Notes
            </label>
            <input
              type="text"
              value={formData.tastingNotes}
              onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="citrus, floral, bittersweet (comma separated)"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple notes with commas</p>
          </div>

          {/* Sourcing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm
              </label>
              <input
                type="text"
                value={formData.farm}
                onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Allergens */}
          <TaxonomyMultiSelect
            category="allergens"
            values={formData.allergens}
            onChange={(values) => setFormData({ ...formData, allergens: values })}
            label="Allergens"
          />

          {/* Dietary Flags */}
          <TaxonomyMultiSelect
            category="dietaryFlags"
            values={formData.dietaryFlags}
            onChange={(values) => setFormData({ ...formData, dietaryFlags: values })}
            label="Dietary Flags"
            description="Select dietary compatibility tags"
          />

          {/* Seasonal */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.seasonal}
                onChange={(e) => setFormData({ ...formData, seasonal: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Seasonal Ingredient</span>
            </label>
          </div>

          {formData.seasonal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Months
              </label>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => toggleMonth(index)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      formData.availableMonths.includes(index)
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Organic */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOrganic}
                onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Organic</span>
            </label>
          </div>

          {/* Image Upload */}
          <ImageUploader
            value={formData.image}
            onChange={(url: string) => setFormData({ ...formData, image: url })}
            altText={formData.imageAlt}
            onAltTextChange={(alt: string) => setFormData({ ...formData, imageAlt: alt })}
            aspectRatio="1:1"
            label="Ingredient Image"
            required={false}
          />
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Ingredient'}
          </button>
          <Link
            href="/admin/ingredients"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
