'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, TableCard } from '@/src/app/admin/components/ui/application/table/table';
import { Badge, BadgeWithDot } from '@/src/app/admin/components/ui/base/badges/badges';
import { Select } from '@/src/app/admin/components/ui/base/select/select';
import { Button } from '@/app/admin/components/ui/buttons/button';
import DeleteModal from '@/app/admin/components/DeleteModal';

interface Ingredient {
  id: string;
  name: string;
  latinName?: string;
  origin: string;
  category: string;
  taxonomyCategory?: string;
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
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: '', name: '' });

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

  const handleDelete = async () => {
    const response = await fetch(`/api/ingredients/${deleteConfirm.id}`, { method: 'DELETE' });
    if (response.ok) {
      setIngredients(ingredients.filter((i) => i.id !== deleteConfirm.id));
      setDeleteConfirm({ show: false, id: '', name: '' });
    } else {
      const error = await response.json();
      alert(error.blockers ? `Cannot delete:\n\n${error.blockers.join('\n')}` : error.error || 'Failed to delete');
    }
  };

  const getCategoryLabel = (ingredient: Ingredient) => {
    const categoryId = ingredient.taxonomyCategory || ingredient.category;
    const taxonomy = taxonomyCategories.find((t) => t.id === categoryId || t.value === categoryId);
    return taxonomy?.label || categoryId || 'Uncategorized';
  };

  const filtered = ingredients.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.latinName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.origin?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryId = i.taxonomyCategory || i.category;
    const matchesCategory = categoryFilter === 'all' || categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="Ingredients"
          badge={filtered.length}
          description="Manage your ingredient library with provenance details"
          contentTrailing={
            <div className="flex items-center gap-3">
              <Select
                placeholder="All categories"
                selectedKey={categoryFilter}
                onSelectionChange={(key) => setCategoryFilter(key as string)}
                items={[
                  { id: 'all', label: 'All categories' },
                  ...taxonomyCategories.map((c) => ({ id: c.id, label: c.label })),
                ]}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
              <Select
                placeholder="All statuses"
                selectedKey={statusFilter}
                onSelectionChange={(key) => setStatusFilter(key as string)}
                items={[
                  { id: 'all', label: 'All statuses' },
                  { id: 'active', label: 'Active' },
                  { id: 'archived', label: 'Archived' },
                ]}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
              <Link href="/admin/ingredients/create">
                <Button color="primary" size="sm">Add ingredient</Button>
              </Link>
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-tertiary">No ingredients found</p>
            <Link href="/admin/ingredients/create">
              <Button color="secondary" size="sm">Add your first ingredient</Button>
            </Link>
          </div>
        ) : (
          <Table aria-label="Ingredients">
            <Table.Header>
              <Table.Head isRowHeader label="Name" />
              <Table.Head label="Category" />
              <Table.Head label="Origin" />
              <Table.Head label="Allergens" />
              <Table.Head label="Properties" />
              <Table.Head label="" />
            </Table.Header>
            <Table.Body items={filtered}>
              {(ingredient) => (
                <Table.Row
                  key={ingredient.id}
                  id={ingredient.id}
                  onAction={() => router.push(`/admin/ingredients/${ingredient.id}`)}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {ingredient.image && (
                        <img src={ingredient.image} alt={ingredient.name} className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-primary">{ingredient.name}</p>
                        {ingredient.latinName && (
                          <p className="text-xs text-tertiary italic">{ingredient.latinName}</p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="blue">{getCategoryLabel(ingredient)}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-secondary">{ingredient.origin || '—'}</span>
                  </Table.Cell>
                  <Table.Cell>
                    {!ingredient.allergens?.length ? (
                      <span className="text-sm text-tertiary">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {ingredient.allergens.slice(0, 3).map((a) => (
                          <Badge key={a} color="error">{a}</Badge>
                        ))}
                        {ingredient.allergens.length > 3 && (
                          <span className="text-xs text-tertiary">+{ingredient.allergens.length - 3}</span>
                        )}
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {ingredient.seasonal && <Badge color="success">Seasonal</Badge>}
                      {ingredient.status === 'archived' && <Badge color="gray">Archived</Badge>}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/ingredients/${ingredient.id}`}>
                        <Button color="secondary" size="sm">Edit</Button>
                      </Link>
                      <Button
                        color="primary-destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ show: true, id: ingredient.id, name: ingredient.name })}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

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
