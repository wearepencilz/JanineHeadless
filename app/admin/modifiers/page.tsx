'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
import TableFilters, { FilterConfig } from '@/app/admin/components/TableFilters';
import DeleteModal from '@/app/admin/components/DeleteModal';

interface Modifier {
  id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  status: string;
  availableForFormatIds: string[];
  allergens: string[];
  dietaryFlags: string[];
  image?: string;
}

export default function ModifiersPage() {
  const router = useRouter();
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchModifiers();
  }, [typeFilter, statusFilter]);

  const fetchModifiers = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/modifiers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setModifiers(data);
      }
    } catch (error) {
      console.error('Error fetching modifiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      topping: 'bg-purple-100 text-purple-800',
      sauce: 'bg-orange-100 text-orange-800',
      crunch: 'bg-yellow-100 text-yellow-800',
      drizzle: 'bg-pink-100 text-pink-800',
      'premium-addon': 'bg-blue-100 text-blue-800',
      'pack-in': 'bg-green-100 text-green-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)}`;
  };

  const handleDeleteClick = (modifier: Modifier) => {
    setDeleteConfirm({ show: true, id: modifier.id, name: modifier.name });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/modifiers/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModifiers(modifiers.filter((m) => m.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', name: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete modifier');
      }
    } catch (error) {
      console.error('Error deleting modifier:', error);
      alert('Failed to delete modifier');
    }
  };

  const filters: FilterConfig[] = [
    {
      type: 'select',
      label: 'Type',
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'topping', label: 'Topping' },
        { value: 'sauce', label: 'Sauce' },
        { value: 'crunch', label: 'Crunch' },
        { value: 'drizzle', label: 'Drizzle' },
        { value: 'premium-addon', label: 'Premium Add-on' },
        { value: 'pack-in', label: 'Pack-in' },
      ],
    },
    {
      type: 'select',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  const columns: Column<Modifier>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (modifier) => (
        <div className="flex items-center">
          {modifier.image && (
            <img
              src={modifier.image}
              alt={modifier.name}
              className="h-10 w-10 rounded object-cover mr-3"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{modifier.name}</div>
            <div className="text-sm text-gray-500">{modifier.slug}</div>
          </div>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'type',
      label: 'Type',
      render: (modifier) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(modifier.type)}`}>
          {modifier.type}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'price',
      label: 'Price',
      render: (modifier) => (
        <div className="text-sm text-gray-900">{formatPrice(modifier.price)}</div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'status',
      label: 'Status',
      render: (modifier) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          modifier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {modifier.status}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'formats',
      label: 'Formats',
      render: (modifier) => (
        <div className="text-sm text-gray-500">
          {modifier.availableForFormatIds.length} format(s)
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ];

  const actions: Action<Modifier>[] = [
    {
      label: 'Edit',
      href: (modifier) => `/admin/modifiers/${modifier.id}`,
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
        title="Modifiers"
        description="Manage toppings, sauces, and add-ons for products"
        createButton={{ label: 'Create Modifier', href: '/admin/modifiers/new' }}
        filters={<TableFilters filters={filters} />}
        data={modifiers}
        columns={columns}
        actions={actions}
        keyExtractor={(modifier) => modifier.id}
        onRowClick={(modifier) => router.push(`/admin/modifiers/${modifier.id}`)}
        emptyMessage="No modifiers found"
        emptyAction={{ label: 'Create your first modifier', href: '/admin/modifiers/new' }}
        loading={loading}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        title="Delete Modifier"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
