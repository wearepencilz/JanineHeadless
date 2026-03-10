'use client';

import { useState, useEffect } from 'react';
import type { Ingredient, FlavourIngredient, Allergen, DietaryFlag, IngredientCategory } from '@/types';

interface Props {
  selectedIngredients: FlavourIngredient[];
  onChange: (ingredients: FlavourIngredient[]) => void;
}

export default function FlavourIngredientSelector({ selectedIngredients, onChange }: Props) {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [calculatedAllergens, setCalculatedAllergens] = useState<Allergen[]>([]);
  const [calculatedDietaryFlags, setCalculatedDietaryFlags] = useState<DietaryFlag[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: 'flavor' as IngredientCategory,
    origin: '',
    allergens: [] as Allergen[],
    dietaryFlags: [] as DietaryFlag[],
    seasonal: false,
    description: ''
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    calculateMetadata();
  }, [selectedIngredients, allIngredients]);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ingredients?pageSize=100');
      const data = await response.json();
      setAllIngredients(data.data || data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetadata = () => {
    const ingredientIds = selectedIngredients.map(si => si.ingredientId);
    const ingredients = allIngredients.filter(ing => ingredientIds.includes(ing.id));
    
    // Calculate allergens
    const allergenSet = new Set<Allergen>();
    ingredients.forEach(ing => {
      ing.allergens.forEach(allergen => allergenSet.add(allergen));
    });
    setCalculatedAllergens(Array.from(allergenSet));
    
    // Calculate dietary flags
    const flags: DietaryFlag[] = [];
    const hasAnimalProducts = ingredients.some(ing => 
      ing.allergens.includes('dairy') || ing.allergens.includes('eggs')
    );
    if (!hasAnimalProducts && ingredients.length > 0) {
      flags.push('vegan', 'vegetarian');
    } else if (ingredients.length > 0) {
      flags.push('vegetarian');
    }
    
    if (!ingredients.some(ing => ing.allergens.includes('gluten'))) flags.push('gluten-free');
    if (!ingredients.some(ing => ing.allergens.includes('dairy'))) flags.push('dairy-free');
    if (!ingredients.some(ing => ing.allergens.includes('nuts'))) flags.push('nut-free');
    
    setCalculatedDietaryFlags(flags);
  };

  const addIngredient = (ingredient: Ingredient) => {
    const maxOrder = selectedIngredients.length > 0 
      ? Math.max(...selectedIngredients.map(si => si.displayOrder))
      : -1;
    
    const newIngredient: FlavourIngredient = {
      ingredientId: ingredient.id,
      displayOrder: maxOrder + 1,
      quantity: '',
      notes: ''
    };
    
    onChange([...selectedIngredients, newIngredient]);
    setShowModal(false);
    setSearchTerm('');
  };

  const createIngredient = async () => {
    if (!newIngredient.name.trim() || !newIngredient.origin.trim()) {
      alert('Name and origin are required');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIngredient)
      });

      if (!response.ok) {
        throw new Error('Failed to create ingredient');
      }

      const created = await response.json();
      
      // Add to local list
      setAllIngredients([...allIngredients, created]);
      
      // Add to selected ingredients
      addIngredient(created);
      
      // Reset form
      setNewIngredient({
        name: '',
        category: 'Fruit',
        origin: '',
        allergens: [],
        dietaryFlags: [],
        seasonal: false,
        description: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating ingredient:', error);
      alert('Failed to create ingredient');
    } finally {
      setCreating(false);
    }
  };

  const removeIngredient = (ingredientId: string) => {
    const filtered = selectedIngredients.filter(si => si.ingredientId !== ingredientId);
    // Reorder
    const reordered = filtered.map((si, index) => ({ ...si, displayOrder: index }));
    onChange(reordered);
  };

  const updateIngredient = (ingredientId: string, updates: Partial<FlavourIngredient>) => {
    const updated = selectedIngredients.map(si =>
      si.ingredientId === ingredientId ? { ...si, ...updates } : si
    );
    onChange(updated);
  };

  const moveIngredient = (ingredientId: string, direction: 'up' | 'down') => {
    const index = selectedIngredients.findIndex(si => si.ingredientId === ingredientId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedIngredients.length) return;
    
    const reordered = [...selectedIngredients];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    
    // Update display orders
    const withOrders = reordered.map((si, idx) => ({ ...si, displayOrder: idx }));
    onChange(withOrders);
  };

  const filteredIngredients = allIngredients.filter(ing => {
    const alreadySelected = selectedIngredients.some(si => si.ingredientId === ing.id);
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    return !alreadySelected && matchesSearch;
  });

  const sortedSelected = [...selectedIngredients].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Ingredients
        </label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Selected Ingredients List */}
      {sortedSelected.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <p className="text-gray-500 text-sm">No ingredients added yet</p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add your first ingredient
          </button>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg divide-y divide-gray-200">
          {sortedSelected.map((si, index) => {
            const ingredient = allIngredients.find(ing => ing.id === si.ingredientId);
            if (!ingredient) return null;
            
            return (
              <div key={si.ingredientId} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => moveIngredient(si.ingredientId, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveIngredient(si.ingredientId, 'down')}
                      disabled={index === sortedSelected.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                        <p className="text-sm text-gray-500">{ingredient.category} • {ingredient.origin}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(si.ingredientId)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Quantity (e.g., 30%, 2 cups)"
                        value={si.quantity || ''}
                        onChange={(e) => updateIngredient(si.ingredientId, { quantity: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={si.notes || ''}
                        onChange={(e) => updateIngredient(si.ingredientId, { notes: e.target.value })}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calculated Metadata */}
      {sortedSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-blue-900">Auto-calculated Metadata</h4>
          
          {calculatedAllergens.length > 0 && (
            <div>
              <p className="text-xs text-blue-700 mb-1">Allergens:</p>
              <div className="flex flex-wrap gap-1">
                {calculatedAllergens.map(allergen => (
                  <span key={allergen} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {calculatedDietaryFlags.length > 0 && (
            <div>
              <p className="text-xs text-blue-700 mb-1">Dietary Flags:</p>
              <div className="flex flex-wrap gap-1">
                {calculatedDietaryFlags.map(flag => (
                  <span key={flag} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Add Ingredient</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showCreateForm ? '← Back to Search' : '+ Create New'}
                </button>
              </div>
              
              {!showCreateForm ? (
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newIngredient.category}
                      onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value as IngredientCategory })}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="base">Base</option>
                      <option value="flavor">Flavor</option>
                      <option value="mix-in">Mix-in</option>
                      <option value="topping">Topping</option>
                      <option value="spice">Spice</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Origin *"
                    value={newIngredient.origin}
                    onChange={(e) => setNewIngredient({ ...newIngredient, origin: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={createIngredient}
                    disabled={creating}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
                  >
                    {creating ? 'Creating...' : 'Create & Add Ingredient'}
                  </button>
                </div>
              )}
            </div>
            
            {!showCreateForm && (
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <p className="text-center text-gray-500">Loading ingredients...</p>
                ) : filteredIngredients.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No ingredients found</p>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Create a new ingredient
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredIngredients.map(ingredient => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => addIngredient(ingredient)}
                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                            {ingredient.latinName && (
                              <p className="text-sm text-gray-500 italic">{ingredient.latinName}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">
                              {ingredient.category} • {ingredient.origin}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {ingredient.category}
                          </span>
                        </div>
                        
                        {ingredient.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {ingredient.allergens.map(allergen => (
                              <span key={allergen} className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setShowCreateForm(false);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
