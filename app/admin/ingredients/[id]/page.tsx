'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from '../../components/ImageUploader';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyTagSelect from '@/app/admin/components/TaxonomyTagSelect';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import RelatedItems from '@/app/admin/components/RelatedItems';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Checkbox } from '@/app/admin/components/ui/checkbox';

interface RelatedFlavour {
  id: string;
  name: string;
}

export default function EditIngredientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usedInFlavours, setUsedInFlavours] = useState<RelatedFlavour[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    latinName: '',
    origin: '',
    taxonomyCategory: '',
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
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  useEffect(() => { fetchIngredient(); }, [params.id]);

  const fetchIngredient = async () => {
    try {
      const [ingredientRes, flavoursRes] = await Promise.all([
        fetch(`/api/ingredients/${params.id}`),
        fetch('/api/flavours'),
      ]);
      if (ingredientRes.ok) {
        const data = await ingredientRes.json();
        setFormData({
          name: data.name || '',
          latinName: data.latinName || '',
          origin: data.origin || '',
          taxonomyCategory: data.taxonomyCategory || data.category || '',
          story: data.story || '',
          tastingNotes: Array.isArray(data.tastingNotes) ? data.tastingNotes.join(', ') : data.tastingNotes || '',
          supplier: data.supplier || '',
          farm: data.farm || '',
          seasonal: data.seasonal || false,
          availableMonths: data.availableMonths || [],
          allergens: data.allergens || [],
          animalDerived: data.animalDerived || false,
          vegetarian: data.vegetarian !== false,
          isOrganic: data.isOrganic || false,
          image: data.image || '',
          imageAlt: data.imageAlt || '',
        });
      } else {
        alert('Ingredient not found');
        router.push('/admin/ingredients');
      }
      if (flavoursRes.ok) {
        const flavoursData = await flavoursRes.json();
        const flavours = flavoursData.data || flavoursData;
        setUsedInFlavours(
          flavours
            .filter((f: any) => f.ingredients?.some((ing: any) => ing.ingredientId === params.id))
            .map((f: any) => ({ id: f.id, name: f.name }))
        );
      }
    } catch (error) {
      console.error('Error fetching ingredient:', error);
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
        : [...prev.availableMonths, monthIndex].sort((a, b) => a - b),
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
      maxWidth="7xl"
    >
      <div className="grid grid-cols-3 gap-6">

        {/* Left: main form */}
        <div className="col-span-2 space-y-6">

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Ingredient details</h2>
              <p className="text-sm text-gray-500 mt-0.5">Name, origin, story and sourcing information.</p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <Input label="Name" type="text" isRequired value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="e.g., Blood Orange" />
              <Input label="Latin Name" type="text" value={formData.latinName} onChange={(v) => setFormData({ ...formData, latinName: v })} placeholder="e.g., Citrus × sinensis" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Origin" type="text" isRequired value={formData.origin} onChange={(v) => setFormData({ ...formData, origin: v })} placeholder="e.g., Sicily" />
                <TaxonomySelect category="ingredientCategories" value={formData.taxonomyCategory} onChange={(v) => setFormData({ ...formData, taxonomyCategory: v })} label="Category" required />
              </div>
              <Textarea label="Story & Provenance" value={formData.story} onChange={(v) => setFormData({ ...formData, story: v })} rows={4} placeholder="Tell the story of this ingredient..." />
              <TaxonomyTagSelect
                category="tastingNotes"
                values={formData.tastingNotes.split(',').map(t => t.trim()).filter(Boolean)}
                onChange={(values) => setFormData({ ...formData, tastingNotes: values.join(', ') })}
                label="Tasting Notes"
                description="Select common tasting note descriptors"
                allowCreate={true}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Supplier" type="text" value={formData.supplier} onChange={(v) => setFormData({ ...formData, supplier: v })} />
                <Input label="Farm" type="text" value={formData.farm} onChange={(v) => setFormData({ ...formData, farm: v })} />
              </div>
              <TaxonomyTagSelect category="allergens" values={formData.allergens} onChange={(values) => setFormData({ ...formData, allergens: values })} label="Allergens" />
            </div>
          </form>

          {/* Advanced options */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Advanced options</h2>
              <p className="text-sm text-gray-500 mt-0.5">Dietary facts, seasonality and organic status.</p>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Dietary facts</p>
                <div className="space-y-2">
                  <Checkbox isSelected={formData.animalDerived} onChange={(v) => setFormData({ ...formData, animalDerived: v })} label="Contains animal-derived ingredients" />
                  <Checkbox isSelected={formData.vegetarian} onChange={(v) => setFormData({ ...formData, vegetarian: v })} label="Suitable for vegetarians" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Dietary claims are computed automatically from these facts.</p>
              </div>
              <Checkbox isSelected={formData.isOrganic} onChange={(v) => setFormData({ ...formData, isOrganic: v })} label="Organic" />
              <Checkbox isSelected={formData.seasonal} onChange={(v) => setFormData({ ...formData, seasonal: v })} label="Seasonal ingredient" />
              {formData.seasonal && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Available months</p>
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
            </div>
          </div>

        </div>

        {/* Right: related + image */}
        <div className="col-span-1 space-y-6">

          <RelatedItems
            title="Used in flavours"
            description={usedInFlavours.length > 0 ? `Appears in ${usedInFlavours.length} flavour${usedInFlavours.length !== 1 ? 's' : ''}.` : undefined}
            items={usedInFlavours.map(f => ({ id: f.id, name: f.name, href: `/admin/flavours/${f.id}` }))}
            emptyMessage="Not used in any flavours yet."
            badgeColor="blue"
          />

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Image</h2>
              <p className="text-sm text-gray-500 mt-0.5">Upload a photo of this ingredient.</p>
            </div>
            <div className="px-6 py-6">
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
          </div>

        </div>
      </div>
    </EditPageLayout>
  );
}
