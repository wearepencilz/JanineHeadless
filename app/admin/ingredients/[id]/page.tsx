'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '../../components/ImageUploader';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyTagSelect from '@/app/admin/components/TaxonomyTagSelect';
import EditPageLayout from '@/app/admin/components/EditPageLayout';

export default function EditIngredientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latinName: '',
    origin: '',
    category: 'flavor',
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchIngredient();
  }, [params.id]);

  const fetchIngredient = async () => {
    try {
      const response = await fetch(`/api/ingredients/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...data,
          tastingNotes: Array.isArray(data.tastingNotes) 
            ? data.tastingNotes.join(', ') 
            : data.tastingNotes || '',
          allergens: data.allergens || [],
          availableMonths: data.availableMonths || [],
          imageAlt: data.imageAlt || '',
          animalDerived: data.animalDerived || false,
          vegetarian: data.vegetarian !== false, // Default to true if not set
        });
      } else {
        alert('Ingredient not found');
        router.push('/admin/ingredients');
      }
    } catch (error) {
      console.error('Error fetching ingredient:', error);
      alert('Failed to load ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/ingredients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tastingNotes: formData.tastingNotes.split(',').map(n => n.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        router.push('/admin/ingredients');
      } else {
        alert('Failed to update ingredient');
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Failed to update ingredient');
    } finally {
      setSaving(false);
    }
  };

  const toggleMonth = (monthIndex: number) => {
    setFormData(prev => ({
      ...prev,
      availableMonths: prev.availableMonths.includes(monthIndex)
        ? prev.availableMonths.filter(m => m !== monthIndex)
        : [...prev.availableMonths, monthIndex].sort((a, b) => a - b)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading ingredient...</div>
      </div>
    );
  }

  return (
    <EditPageLayout
      title="Edit Ingredient"
      backHref="/admin/ingredients"
      backLabel="Back to Ingredients"
      onSave={() => handleSubmit(new Event('submit') as any)}
      onCancel={() => router.push('/admin/ingredients')}
      saving={saving}
    >
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
              onChange={(value) => setFormData({ ...formData, category: value })}
              label="Category"
              required
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
          <TaxonomyTagSelect
            category="tastingNotes"
            values={formData.tastingNotes.split(',').map(t => t.trim()).filter(Boolean)}
            onChange={(values) => setFormData({ ...formData, tastingNotes: values.join(', ') })}
            label="Tasting Notes"
            description="Select common tasting note descriptors"
            allowCreate={true}
          />

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
          <TaxonomyTagSelect
            category="allergens"
            values={formData.allergens}
            onChange={(values) => setFormData({ ...formData, allergens: values })}
            label="Allergens"
          />

          {/* Dietary Facts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Facts
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.animalDerived}
                  onChange={(e) => setFormData({ ...formData, animalDerived: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Contains animal-derived ingredients</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.vegetarian}
                  onChange={(e) => setFormData({ ...formData, vegetarian: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Suitable for vegetarians</span>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Dietary claims (vegan, dairy-free, etc.) are computed automatically from these facts
            </p>
          </div>

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
      </form>
    </EditPageLayout>
  );
}
