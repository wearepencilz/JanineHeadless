'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Format, FormatCategory, ServingStyle } from '@/types';
import TaxonomySelect from '@/app/admin/components/TaxonomySelect';
import TaxonomyTagSelect from '@/app/admin/components/TaxonomyTagSelect';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import { useToast } from '@/app/admin/components/ToastContainer';
import ConfirmModal from '@/app/admin/components/ConfirmModal';

export default function EditFormatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [format, setFormat] = useState<Format | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    fetchFormat();
    checkUsage();
  }, [params.id]);

  const fetchFormat = async () => {
    try {
      const response = await fetch(`/api/formats/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormat(data);
      } else {
        toast.error('Format not found', 'Redirecting to formats list');
        router.push('/admin/formats');
      }
    } catch (error) {
      console.error('Error fetching format:', error);
      toast.error('Failed to load format', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const checkUsage = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const products = await response.json();
        const count = products.filter((p: any) => p.formatId === params.id).length;
        setUsageCount(count);
      }
    } catch (error) {
      console.error('Error checking usage:', error);
    }
  };

  const handleSave = async () => {
    if (!format) return;
    
    setSaving(true);

    try {
      const response = await fetch(`/api/formats/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(format),
      });

      if (response.ok) {
        const updatedFormat = await response.json();
        setFormat(updatedFormat);
        toast.success('Format updated', 'Your changes have been saved');
      } else {
        const error = await response.json();
        toast.error('Update failed', error.error || 'Failed to update format');
      }
    } catch (error) {
      console.error('Error updating format:', error);
      toast.error('Update failed', 'Unable to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/formats/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Format deleted', `${format?.name} has been removed`);
        router.push('/admin/formats');
      } else {
        const error = await response.json();
        toast.error('Delete failed', error.details?.message || error.error || 'Failed to delete format');
      }
    } catch (error) {
      console.error('Error deleting format:', error);
      toast.error('Delete failed', 'Unable to delete format');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (loading || !format) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading format...</div>
      </div>
    );
  }

  return (
    <>
      <EditPageLayout
        title="Edit Format"
        backHref="/admin/formats"
        backLabel="Back to Formats"
        onSave={handleSave}
        onDelete={() => setShowDeleteModal(true)}
        onCancel={() => router.push('/admin/formats')}
        saving={saving}
        deleteDisabled={usageCount > 0}
        deleteDisabledReason={`Cannot delete format that is used in ${usageCount} offering(s)`}
      >
      {usageCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            This format is used in {usageCount} offering{usageCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={format.name}
                onChange={(e) => setFormat({ ...format, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={format.slug}
                onChange={(e) => setFormat({ ...format, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={format.description}
                onChange={(e) => setFormat({ ...format, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TaxonomySelect
                category="formatCategories"
                value={format.category}
                onChange={(value) => setFormat({ ...format, category: value as FormatCategory })}
                label="Category"
                required
              />

              <TaxonomySelect
                category="servingStyles"
                value={format.servingStyle}
                onChange={(value) => setFormat({ ...format, servingStyle: value as ServingStyle })}
                label="Serving Style"
                required
              />
            </div>
          </div>
        </div>

        {/* Flavour Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Flavour Requirements</h3>
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={format.requiresFlavours}
                  onChange={(e) => setFormat({ ...format, requiresFlavours: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Requires Flavours</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-6">
                Check this if products using this format must include flavours
              </p>
            </div>

            {format.requiresFlavours && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Flavours *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={format.minFlavours}
                      onChange={(e) => setFormat({ ...format, minFlavours: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Flavours *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={format.maxFlavours}
                      onChange={(e) => setFormat({ ...format, maxFlavours: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <TaxonomyTagSelect
                    category="flavourTypes"
                    values={format.eligibleFlavourTypes || []}
                    onChange={(values) => setFormat({ 
                      ...format, 
                      eligibleFlavourTypes: values 
                    })}
                    label="Eligible Flavour Types"
                    description="Select which flavour types this format accepts. Leave empty to accept all types."
                  />
                  
                  {(!format.eligibleFlavourTypes || format.eligibleFlavourTypes.length === 0) && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        ⚠️ This format requires flavours but accepts all types. 
                        Consider specifying eligible types for better control.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Options</h3>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={format.canIncludeAddOns}
                onChange={(e) => setFormat({ ...format, canIncludeAddOns: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Can Include Add-ons</span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-6">
              Allow toppings, sauces, and other modifiers for this format
            </p>
          </div>
        </div>
      </div>
    </EditPageLayout>

    <ConfirmModal
      isOpen={showDeleteModal}
      variant="danger"
      title="Delete Format"
      message={`Are you sure you want to delete "${format?.name}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={handleDelete}
      onCancel={() => setShowDeleteModal(false)}
    />
    </>
  );
}
