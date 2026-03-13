'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
import TableFilters, { FilterConfig } from '@/app/admin/components/TableFilters';
import DeleteModal from '@/app/admin/components/DeleteModal';

interface Ingredient {
  id: string;
  name: string;
  latinName?: string;
  origin: string;
  category: string; // Legacy field
  taxonomyCategory?: string; // New taxonomy field
  image?: string;
  allergens: string[];
  seasonal: boolean;
  status?: string;
}

interface TaxonomyCategory {
  id: string;
  label: string;
  value: string;
}

export default function IngredientsPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [taxonomyCategories, setTaxonomyCategories] = useState<TaxonomyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ingredientsRes, settingsRes] = await Promise.all([
        fetch('/api/ingredients'),
        fetch('/api/settings'),
      ]);

      if (ingredientsRes.ok) {
        const data = await ingredientsRes.json();
        setIngredients(data.data || data);
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setTaxonomyCategories(settings.ingredientCategories || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (ingredient: Ingredient) => {
    setDeleteConfirm({ show: true, id: ingredient.id, name: ingredient.name });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/ingredients/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIngredients(ingredients.filter((i) => i.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', name: '' });
      } else {
        const error = await response.json();
        if (error.blockers) {
          alert(`Cannot delete ingredient:\n\n${error.blockers.join('\n')}`);
        } else {
          alert(error.error || 'Failed to delete ingredient');
        }
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Failed to delete ingredient');
    }
  };

  const getCategoryLabel = (ingredient: Ingredient) => {
    const categoryId = ingredient.taxonomyCategory || ingredient.category;
    const taxonomy = taxonomyCategories.find(t => t.id === categoryId || t.value === categoryId);
    return taxonomy?.label || categoryId || 'Uncategorized';
  };

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.latinName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ingredient.origin?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryId = ingredient.taxonomyCategory || ingredient.category;
    const matchesCategory = categoryFilter === 'all' || categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || ingredient.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filters: FilterConfig[] = [
    {
      type: 'search',
      placeholder: 'Search ingredients...',
      value: searchTerm,
      onChange: setSearchTerm,
    },
    {
      type: 'select',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { value: 'all', label: 'All Categories' },
        ...taxonomyCategories
          .filter(cat => !cat.archived)
          .map((cat) => ({
            value: cat.id,
            label: cat.label,
          })),
      ],
    },
    {
      type: 'select',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  const columns: Column<Ingredient>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (ingredient) => (
        <div className="flex items-center gap-3">
          {ingredient.image && (
            <img
              src={ingredient.image}
              alt={ingredient.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{ingredient.name}</div>
            {ingredient.latinName && (
              <div className="text-sm text-gray-500 italic">{ingredient.latinName}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (ingredient) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {getCategoryLabel(ingredient)}
        </span>
      ),
    },
    {
      key: 'origin',
      label: 'Origin',
      render: (ingredient) => (
        <div className="text-sm text-gray-900">{ingredient.origin || '-'}</div>
      ),
    },
    {
      key: 'allergens',
      label: 'Allergens',
      render: (ingredient) => {
        if (!ingredient.allergens || ingredient.allergens.length === 0) {
          return <span className="text-sm text-gray-400">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {ingredient.allergens.slice(0, 3).map((allergen) => (
              <span
                key={allergen}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
              >
                {allergen}
              </span>
            ))}
            {ingredient.allergens.length > 3 && (
              <span className="text-xs text-gray-500">
                +{ingredient.allergens.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'properties',
      label: 'Properties',
      render: (ingredient) => (
        <div className="flex flex-wrap gap-1">
          {ingredient.seasonal && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Seasonal
            </span>
          )}
          {ingredient.status === 'archived' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Archived
            </span>
          )}
        </div>
      ),
    },
  ];

  const actions: Action<Ingredient>[] = [
    {
      label: 'Edit',
      href: (ingredient) => `/admin/ingredients/${ingredient.id}`,
      stopPropagation: true,
    },
    {
      label: 'Delete',
      onClick: handleDeleteClick,
      className: 'text-red-600 hover:text-red-900',
      stopPropagation: true,
    },
  ];

  return (
    <>
      <DataTable
        title="Ingredients"
        description={`${filteredIngredients.length} ingredient${filteredIngredients.length !== 1 ? 's' : ''}`}
        createButton={{ label: 'Add Ingredient', href: '/admin/ingredients/create' }}
        secondaryButton={{ label: 'Seed Data', href: '/admin/ingredients/seed' }}
        filters={<TableFilters filters={filters} />}
        data={filteredIngredients}
        columns={columns}
        actions={actions}
        keyExtractor={(ingredient) => ingredient.id}
        onRowClick={(ingredient) => router.push(`/admin/ingredients/${ingredient.id}`)}
        emptyMessage={
          searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
            ? 'No ingredients match your filters'
            : 'No ingredients yet'
        }
        emptyAction={{ label: 'Add your first ingredient', href: '/admin/ingredients/create' }}
        loading={loading}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        title="Delete Ingredient"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This will check if the ingredient is used in any flavours.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
