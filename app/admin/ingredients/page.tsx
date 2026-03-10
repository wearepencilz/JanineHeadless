'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Ingredient {
  id: string;
  name: string;
  latinName?: string;
  origin: string;
  category: string;
  image?: string;
  allergens: string[];
  seasonal: boolean;
}

export default function IngredientsPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchIngredients();
  }, [searchTerm, categoryFilter]);

  const fetchIngredients = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/ingredients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Handle paginated response
        setIngredients(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIngredients(ingredients.filter((i) => i.id !== id));
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete ingredient');
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.origin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ingredient.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['base', 'flavor', 'mix-in', 'topping', 'spice'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading ingredients...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Ingredients</h1>
          <p className="text-gray-600 mt-1">Manage your ingredient library</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/ingredients/seed"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Seed Data
          </Link>
          <Link
            href="/admin/ingredients/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Ingredient
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 mb-6 p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No ingredients match your filters' 
              : 'No ingredients yet'}
          </p>
          <Link
            href="/admin/ingredients/create"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first ingredient
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {ingredient.image && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ingredient.name}</h3>
                    {ingredient.latinName && (
                      <p className="text-sm text-gray-500 italic">{ingredient.latinName}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {ingredient.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  Origin: {ingredient.origin}
                </p>

                {ingredient.allergens && ingredient.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ingredient.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}

                {ingredient.seasonal && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded inline-block mb-3">
                    Seasonal
                  </span>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Link
                    href={`/admin/ingredients/${ingredient.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(ingredient.id, ingredient.name)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
