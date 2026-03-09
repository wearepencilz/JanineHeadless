'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Ingredient {
  id: string;
  name: string;
}

interface ShopifyProduct {
  handle: string;
  title: string;
  id: string;
}

export default function CreateFlavourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'seasonal' | 'archived',
    shopifyProductHandle: '',
    ingredientIds: [] as string[],
    tastingNotes: '',
    story: '',
  });

  useEffect(() => {
    fetchIngredients();
    fetchShopifyProducts();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await fetch('/api/ingredients');
      const data = await res.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchShopifyProducts = async () => {
    try {
      const res = await fetch('/api/shopify/products');
      const data = await res.json();
      setShopifyProducts(data);
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/flavours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/flavours');
      } else {
        alert('Error creating flavour');
      }
    } catch (error) {
      console.error('Error creating flavour:', error);
      alert('Error creating flavour');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      ingredientIds: prev.ingredientIds.includes(id)
        ? prev.ingredientIds.filter((i) => i !== id)
        : [...prev.ingredientIds, id],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin/flavours" className="text-blue-600 hover:text-blue-700">
          ← Back to Flavours
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Flavour</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="seasonal">Seasonal</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link to Shopify Product
          </label>
          <select
            value={formData.shopifyProductHandle}
            onChange={(e) =>
              setFormData({ ...formData, shopifyProductHandle: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No product linked</option>
            {shopifyProducts.map((product) => (
              <option key={product.handle} value={product.handle}>
                {product.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Link this flavour to a Shopify product for e-commerce
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients
          </label>
          <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
            {ingredients.length === 0 ? (
              <p className="text-gray-500 text-sm">No ingredients available</p>
            ) : (
              <div className="space-y-2">
                {ingredients.map((ingredient) => (
                  <label key={ingredient.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ingredientIds.includes(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">{ingredient.name}</span>
                  </label>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="The inspiration behind this flavour..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/flavours"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Flavour'}
          </button>
        </div>
      </form>
    </div>
  );
}
