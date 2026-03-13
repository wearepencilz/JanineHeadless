'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateSlug } from '@/lib/slug';
import { LaunchDateRangePicker } from '@/app/admin/components/LaunchDateRangePicker';

interface Flavour {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  shopifyProductId?: string;
}

export default function NewLaunchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'upcoming',
    heroImage: '',
    story: '',
    description: '',
    activeStart: '',
    activeEnd: '',
    featured: false,
    featuredFlavourIds: [] as string[],
    featuredProductIds: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchFlavours(), fetchProducts()]);
      setDataLoading(false);
    };
    fetchData();
  }, []);

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
      setFlavours([]);
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
      setProducts([]);
    }
  };

  const toggleFlavour = (flavourId: string) => {
    const ids = formData.featuredFlavourIds.includes(flavourId)
      ? formData.featuredFlavourIds.filter(id => id !== flavourId)
      : [...formData.featuredFlavourIds, flavourId];
    setFormData(prev => ({ ...prev, featuredFlavourIds: ids }));
  };

  const toggleProduct = (productId: string) => {
    const ids = formData.featuredProductIds.includes(productId)
      ? formData.featuredProductIds.filter(id => id !== productId)
      : [...formData.featuredProductIds, productId];
    setFormData(prev => ({ ...prev, featuredProductIds: ids }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const launch = await response.json();
        router.push(`/admin/launches/${launch.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create launch');
      }
    } catch (err) {
      setError('An error occurred while creating the launch');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Auto-generate slug from title if slug hasn't been manually edited
    if (name === 'title' && !slugTouched) {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }));
    } else if (name === 'slug') {
      setSlugTouched(true);
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/launches" className="text-blue-600 hover:text-blue-800 text-sm">
          ← Back to Launches
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create New Launch</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
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
              value={formData.slug}
              onChange={handleChange}
              placeholder="auto-generated-from-title"
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
              value={formData.status}
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
              value={formData.description}
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
              value={formData.story}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Period
            </label>
            <LaunchDateRangePicker
              startDate={formData.activeStart}
              endDate={formData.activeEnd}
              onStartChange={(date) => setFormData(prev => ({ ...prev, activeStart: date }))}
              onEndChange={(date) => setFormData(prev => ({ ...prev, activeEnd: date }))}
            />
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
              value={formData.heroImage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured on homepage
            </label>
          </div>

          {/* Flavours Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Featured Flavours</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select flavours to feature in this launch. After creating the launch, you can auto-generate products from selected flavours.
            </p>
            {dataLoading ? (
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {flavours.length === 0 ? (
                  <p className="text-sm text-gray-500">No flavours available</p>
                ) : (
                  <div className="space-y-2">
                    {flavours.map((flavour) => (
                      <label key={flavour.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featuredFlavourIds.includes(flavour.id)}
                          onChange={() => toggleFlavour(flavour.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{flavour.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {formData.featuredFlavourIds.length} flavour(s) selected
            </p>
          </div>

          {/* Products Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Featured Products</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select products to feature in this launch.
            </p>
            {dataLoading ? (
              <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-500">No products available</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featuredProductIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                          {product.name}
                          {product.shopifyProductId && (
                            <span className="ml-2 text-xs text-gray-500">(Shopify)</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {formData.featuredProductIds.length} product(s) selected
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Launch'}
            </button>
            <Link
              href="/admin/launches"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
