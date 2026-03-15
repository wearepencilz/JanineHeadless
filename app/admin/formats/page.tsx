'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Format } from '@/types';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
import TableFilters, { FilterConfig } from '@/app/admin/components/TableFilters';
import DeleteModal from '@/app/admin/components/DeleteModal';
import { Badge } from '@/app/admin/components/ui/badge';

export default function FormatsPage() {
  const router = useRouter();
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    try {
      const response = await fetch('/api/formats');
      if (response.ok) {
        const data = await response.json();
        setFormats(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching formats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (format: Format) => {
    setDeleteConfirm({ show: true, id: format.id, name: format.name });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/formats/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFormats(formats.filter((f) => f.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', name: '' });
      } else {
        const error = await response.json();
        alert(error.details?.message || error.error || 'Failed to delete format');
      }
    } catch (error) {
      console.error('Error deleting format:', error);
      alert('Failed to delete format');
    }
  };

  const filteredFormats = formats.filter((format) => {
    const matchesSearch = format.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         format.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || format.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filters: FilterConfig[] = [
    {
      type: 'search',
      placeholder: 'Search formats...',
      value: searchTerm,
      onChange: setSearchTerm,
    },
    {
      type: 'select',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'frozen', label: 'Frozen' },
        { value: 'food', label: 'Food' },
        { value: 'experience', label: 'Experience' },
        { value: 'bundle', label: 'Bundle' },
      ],
    },
  ];

  const columns: Column<Format>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (format) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{format.name}</div>
          <div className="text-sm text-gray-500">{format.slug}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (format) => (
        <Badge variant="info">{format.category}</Badge>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'description',
      label: 'Description',
      render: (format) => (
        <div className="text-sm text-gray-600 truncate max-w-xs">
          {format.description}
        </div>
      ),
    },
    {
      key: 'servingStyle',
      label: 'Serving',
      render: (format) => (
        <Badge variant="gray">{format.servingStyle}</Badge>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'flavours',
      label: 'Flavours',
      render: (format) => {
        if (!format.requiresFlavours) {
          return <span className="text-sm text-gray-400">N/A</span>;
        }
        return (
          <Badge variant="purple">
            {format.minFlavours === format.maxFlavours
              ? `${format.minFlavours} flavour${format.minFlavours !== 1 ? 's' : ''}`
              : `${format.minFlavours}-${format.maxFlavours} flavours`}
          </Badge>
        );
      },
      className: 'whitespace-nowrap',
    },
  ];

  const actions: Action<Format>[] = [
    {
      label: 'Edit',
      href: (format) => `/admin/formats/${format.id}`,
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
        title="Formats"
        description="Manage product format templates"
        createButton={{ label: 'Add Format', href: '/admin/formats/create' }}
        filters={<TableFilters filters={filters} />}
        data={filteredFormats}
        columns={columns}
        actions={actions}
        keyExtractor={(format) => format.id}
        onRowClick={(format) => router.push(`/admin/formats/${format.id}`)}
        emptyMessage={
          searchTerm || categoryFilter !== 'all'
            ? 'No formats match your filters'
            : 'No formats yet'
        }
        emptyAction={{ label: 'Add your first format', href: '/admin/formats/create' }}
        loading={loading}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        title="Delete Format"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
