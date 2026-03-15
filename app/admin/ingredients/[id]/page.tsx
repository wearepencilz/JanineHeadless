'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '../../components/ImageUploader';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyTagSelect from '@/app/admin/components/TaxonomyTagSelect';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Checkbox } from '@/app/admin/components/ui/checkbox';

export default function EditIngredientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latinName: '',
    origin: '',
    taxonomyCategory: '', // Changed from 'category'
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
              label="Category"
              required
            />
          </div>

          {/* Story */}
          <Textarea
            label="Story & Provenance"
            value={formData.story}
            onChange={(value) => setFormData({ ...formData, story: value })}
            rows={4}
            placeholder="Tell the story of this ingredient..."
          />

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
      </form>
    </EditPageLayout>
  );
}
