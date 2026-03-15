'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '../../components/ImageUploader';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyTagSelect from '@/app/admin/components/TaxonomyTagSelect';
import { ingredientCategoryOptions, ingredientRoleOptions, ingredientDescriptorTags } from '@/types';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Checkbox } from '@/app/admin/components/ui/checkbox';

export default function CreateIngredientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latinName: '',
    origin: '',
    taxonomyCategory: '', // Changed from 'category'
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
    animalDerived: false,
    vegetarian: true,
    isOrganic: false,
    image: '',
    imageAlt: '',
  });

  const commonAllergens = ['dairy', 'nuts', 'gluten', 'soy', 'eggs', 'sesame'];
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
          <Input
            label="Name"
            type="text"
            isRequired
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="e.g., Blood Orange"
          />

          <Input
            label="Latin Name"
            type="text"
            value={formData.latinName}
            onChange={(value) => setFormData({ ...formData, latinName: value })}
            placeholder="e.g., Citrus × sinensis"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origin"
              type="text"
              isRequired
              value={formData.origin}
              onChange={(value) => setFormData({ ...formData, origin: value })}
              placeholder="e.g., Sicily"
            />

            <TaxonomySelect
              category="ingredientCategories"
              value={formData.taxonomyCategory}
              onChange={(value) => setFormData({ ...formData, taxonomyCategory: value })}
              label="Primary Category"
              required
            />
          </div>

          {/* Usage Roles */}
          <TaxonomyTagSelect
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

          {/* Description */}
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            rows={3}
            placeholder="Brief description of this ingredient..."
          />

          {/* Story */}
          <Textarea
            label="Story & Provenance"
            value={formData.story}
            onChange={(value) => setFormData({ ...formData, story: value })}
            rows={4}
            placeholder="Tell the story of this ingredient..."
          />

          {/* Tasting Notes */}
          <Input
            label="Tasting Notes"
            type="text"
            value={formData.tastingNotes}
            onChange={(value) => setFormData({ ...formData, tastingNotes: value })}
            placeholder="citrus, floral, bittersweet (comma separated)"
            helperText="Separate multiple notes with commas"
          />

          {/* Sourcing */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Supplier"
              type="text"
              value={formData.supplier}
              onChange={(value) => setFormData({ ...formData, supplier: value })}
            />

            <Input
              label="Farm"
              type="text"
              value={formData.farm}
              onChange={(value) => setFormData({ ...formData, farm: value })}
            />
          </div>

          {/* Allergens */}
          <TaxonomyTagSelect
            category="allergens"
            values={formData.allergens}
            onChange={(values) => setFormData({ ...formData, allergens: values })}
            label="Allergens"
          />

          {/* Dietary Facts */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Dietary Facts</p>
            <div className="space-y-2">
              <Checkbox
                isSelected={formData.animalDerived}
                onChange={(v) => setFormData({ ...formData, animalDerived: v })}
                label="Contains animal-derived ingredients"
              />
              <Checkbox
                isSelected={formData.vegetarian}
                onChange={(v) => setFormData({ ...formData, vegetarian: v })}
                label="Suitable for vegetarians"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Dietary claims (vegan, dairy-free, etc.) are computed automatically from these facts
            </p>
          </div>

          {/* Seasonal */}
          <Checkbox
            isSelected={formData.seasonal}
            onChange={(v) => setFormData({ ...formData, seasonal: v })}
            label="Seasonal Ingredient"
          />

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
          <Checkbox
            isSelected={formData.isOrganic}
            onChange={(v) => setFormData({ ...formData, isOrganic: v })}
            label="Organic"
          />

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
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            isDisabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Ingredient'}
          </Button>
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
