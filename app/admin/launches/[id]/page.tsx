'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/lib/slug';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import FormatSelectionModal from '@/app/admin/components/FormatSelectionModal';
import ConfirmModal from '@/app/admin/components/ConfirmModal';
import { useToast } from '@/app/admin/components/ToastContainer';

interface Launch {
  id: string;
  title: string;
  slug: string;
  status: string;
  heroImage?: string;
  story?: string;
  description?: string;
  activeStart?: string;
  activeEnd?: string;
  featured: boolean;
  featuredFlavourIds: string[];
  featuredProductIds: string[];
}

interface Flavour {
  id: string;
  name: string;
  type: string;
}

interface Product {
  id: string;
  internalName?: string;
  publicName?: string;
  name?: string; // Legacy field for backwards compatibility
  shopifyProductId?: string;
}

interface Format {
  id: string;
  name: string;
  description?: string;
  eligibleFlavourTypes?: string[];
  minFlavours: number;
  maxFlavours: number;
  allowMixedTypes?: boolean;
}

export default function EditLaunchPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchLaunch();
    fetchFlavours();
    fetchProducts();
    fetchFormats();
  }, [params.id]);

  const fetchLaunch = async () => {
    try {
      const response = await fetch(`/api/launches/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setLaunch(data);
      } else {
        setError('Launch not found');
      }
    } catch (err) {
      setError('Failed to load launch');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlavours = async () => {
    try {
      const response = await fetch('/api/flavours?pageSize=1000');
      if (response.ok) {
        const result = await response.json();
        // Flavours API returns paginated response: { data: [], total, page, pageSize }
        setFlavours(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error('Failed to load flavours', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        // Products API returns plain array
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const fetchFormats = async () => {
    try {
      const response = await fetch('/api/formats');
      if (response.ok) {
        const data = await response.json();
        setFormats(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load formats', err);
    }
  };

  const handleGenerateProducts = async (selectedFormatIds: string[]) => {
    if (!launch || launch.featuredFlavourIds.length === 0) {
      return;
    }

    setGenerating(true);
    setError('');
    setShowFormatModal(false);

    try {
      const response = await fetch(`/api/launches/${params.id}/generate-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flavourIds: launch.featuredFlavourIds,
          formatIds: selectedFormatIds
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const message = data.message || `Successfully generated ${data.created} product(s)`;
        alert(message);
        // Refresh products and launch data
        await fetchProducts();
        await fetchLaunch();
      } else {
        const data = await response.json();
        console.error('Generate products error:', data);
        setError(data.error || 'Failed to generate products');
        alert(`Error: ${data.error || 'Failed to generate products'}`);
      }
    } catch (err) {
      setError('An error occurred while generating products');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenFormatModal = () => {
    if (!launch || launch.featuredFlavourIds.length === 0) {
      alert('Please select at least one flavour first');
      return;
    }
    setShowFormatModal(true);
  };

  const toggleFlavour = (flavourId: string) => {
    if (!launch) return;
    const ids = launch.featuredFlavourIds.includes(flavourId)
      ? launch.featuredFlavourIds.filter(id => id !== flavourId)
      : [...launch.featuredFlavourIds, flavourId];
    setLaunch({ ...launch, featuredFlavourIds: ids });
  };

  const toggleProduct = (productId: string) => {
    if (!launch) return;
    const ids = launch.featuredProductIds.includes(productId)
      ? launch.featuredProductIds.filter(id => id !== productId)
      : [...launch.featuredProductIds, productId];
    setLaunch({ ...launch, featuredProductIds: ids });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!launch) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/launches/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(launch),
      });

      if (response.ok) {
        router.push('/admin/launches');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update launch');
      }
    } catch (err) {
      setError('An error occurred while updating the launch');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/launches/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Launch deleted', `${launch?.title} has been removed`);
        router.push('/admin/launches');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete launch');
        toast.error('Delete failed', data.error || 'Unable to delete launch');
      }
    } catch (err) {
      setError('An error occurred while deleting the launch');
      toast.error('Delete failed', 'Unable to delete launch');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!launch) return;
    const { name, value, type } = e.target;
    
    // Auto-generate slug from title if slug hasn't been manually edited
    if (name === 'title' && !slugTouched) {
      setLaunch({
        ...launch,
        title: value,
        slug: generateSlug(value)
      });
    } else if (name === 'slug') {
      setSlugTouched(true);
      setLaunch({
        ...launch,
        slug: generateSlug(value)
      });
    } else {
      setLaunch({
        ...launch,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!launch) {
    return (
      <EditPageLayout
        title="Edit Launch"
        backHref="/admin/launches"
        backLabel="Back to Launches"
        onSave={() => {}}
        onCancel={() => router.push('/admin/launches')}
        error={error || 'Launch not found'}
      >
        <div />
      </EditPageLayout>
    );
  }

  return (
    <EditPageLayout
      title="Edit Launch"
      backHref="/admin/launches"
      backLabel="Back to Launches"
      onSave={() => handleSubmit(new Event('submit') as any)}
      onDelete={() => setShowDeleteModal(true)}
      onCancel={() => router.push('/admin/launches')}
      saving={saving}
      deleting={deleting}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg px-6 py-4 space-y-6">

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={launch.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={launch.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Auto-generated from title, but you can edit it
            </p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={launch.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={launch.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-2">
              Story
            </label>
            <textarea
              id="story"
              name="story"
              rows={6}
              value={launch.story || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Period
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="activeStart" className="block text-xs text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="activeStart"
                  name="activeStart"
                  value={launch.activeStart || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="activeEnd" className="block text-xs text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="activeEnd"
                  name="activeEnd"
                  value={launch.activeEnd || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              When this launch will be active and visible to customers
            </p>
          </div>

          <div>
            <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image URL
            </label>
            <input
              type="text"
              id="heroImage"
              name="heroImage"
              value={launch.heroImage || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {launch.heroImage && (
              <img src={launch.heroImage} alt="Hero preview" className="mt-2 h-32 w-auto rounded" />
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={launch.featured}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured on homepage
            </label>
          </div>

          {/* Flavours Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Featured Flavours</h3>
              <button
                type="button"
                onClick={handleOpenFormatModal}
                disabled={generating || launch.featuredFlavourIds.length === 0}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {generating ? 'Generating...' : 'Generate Products from Flavours'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Select flavours to feature in this launch. You can auto-generate products from selected flavours.
            </p>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {flavours.length === 0 ? (
                <p className="text-sm text-gray-500">No flavours available</p>
              ) : (
                <div className="space-y-2">
                  {flavours.map((flavour) => (
                    <label key={flavour.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={launch.featuredFlavourIds.includes(flavour.id)}
                        onChange={() => toggleFlavour(flavour.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {flavour.name}
                        <span className="ml-2 text-xs text-gray-500">({flavour.type})</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {launch.featuredFlavourIds.length} flavour(s) selected
            </p>
          </div>

          {/* Products Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Featured Products</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select products to feature in this launch. Products can be auto-generated from flavours above.
            </p>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-gray-500">No products available</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={launch?.featuredProductIds?.includes(product.id) || false}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {product.name || product.publicName || product.internalName || 'Unnamed Product'}
                        {product.shopifyProductId && (
                          <span className="ml-2 text-xs text-gray-500">(Shopify)</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {launch.featuredProductIds?.length || 0} product(s) selected
            </p>
          </div>

        </div>
      </form>

      {/* Format Selection Modal */}
      <FormatSelectionModal
        isOpen={showFormatModal}
        onClose={() => setShowFormatModal(false)}
        onConfirm={handleGenerateProducts}
        formats={formats}
        selectedFlavours={flavours.filter(f => launch.featuredFlavourIds.includes(f.id))}
        isGenerating={generating}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        variant="danger"
        title="Delete Launch"
        message={`Are you sure you want to delete "${launch?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </EditPageLayout>
  );
}
