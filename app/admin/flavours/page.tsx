'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Flavour } from '@/types';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
import TableFilters, { FilterConfig } from '@/app/admin/components/TableFilters';
import DeleteModal from '@/app/admin/components/DeleteModal';

export default function FlavoursPage() {
  const router = useRouter();
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchFlavours();
  }, [searchTerm, statusFilter]);

  const fetchFlavours = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/flavours?${params.toString()}`);
      const data = await response.json();
      setFlavours(data.data || data);
    } catch (error) {
      console.error('Error fetching flavours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (flavour: Flavour) => {
    setDeleteConfirm({ show: true, id: flavour.id, name: flavour.name });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/flavours/${deleteConfirm.id}`, { method: 'DELETE' });
      if (response.ok) {
        setFlavours(flavours.filter((f) => f.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', name: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete flavour');
      }
    } catch (error) {
      console.error('Error deleting flavour:', error);
      alert('Failed to delete flavour');
    }
  };

  const filters: FilterConfig[] = [
    {
      type: 'search',
      placeholder: 'Search flavours...',
      value: searchTerm,
      onChange: setSearchTerm,
    },
    {
      type: 'select',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'seasonal', label: 'Seasonal' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  const columns: Column<Flavour>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (flavour) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{flavour.name}</div>
          <div className="text-sm text-gray-500 truncate max-w-md">
            {flavour.description}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (flavour) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            flavour.status === 'active'
              ? 'bg-green-100 text-green-800'
              : flavour.status === 'upcoming'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {flavour.status}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'ingredients',
      label: 'Ingredients',
      render: (flavour) => (
        <div className="text-sm text-gray-500">
          {flavour.ingredients?.length || 0} ingredients
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ];

  const actions: Action<Flavour>[] = [
    {
      label: 'Edit',
      href: (flavour) => `/admin/flavours/${flavour.id}`,
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
        title="Flavours"
        description="Manage your flavour archive"
        createButton={{ label: 'Add Flavour', href: '/admin/flavours/create' }}
        secondaryButton={{ label: 'Seed Data', href: '/admin/flavours/seed' }}
        filters={<TableFilters filters={filters} />}
        data={flavours}
        columns={columns}
        actions={actions}
        keyExtractor={(flavour) => flavour.id}
        onRowClick={(flavour) => router.push(`/admin/flavours/${flavour.id}`)}
        emptyMessage={
          searchTerm || statusFilter !== 'all'
            ? 'No flavours match your filters'
            : 'No flavours yet'
        }
        emptyAction={{ label: 'Create your first flavour', href: '/admin/flavours/create' }}
        loading={loading}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        title="Delete Flavour"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
