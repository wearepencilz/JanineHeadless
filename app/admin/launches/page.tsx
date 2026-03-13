'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
import TableFilters, { FilterConfig } from '@/app/admin/components/TableFilters';
import DeleteModal from '@/app/admin/components/DeleteModal';

interface Launch {
  id: string;
  title: string;
  slug: string;
  status: 'upcoming' | 'active' | 'ended' | 'archived';
  featured: boolean;
  activeStart?: string;
  activeEnd?: string;
  heroImage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function LaunchesPage() {
  const router = useRouter();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; title: string }>({
    show: false,
    id: '',
    title: '',
  });

  useEffect(() => {
    fetchLaunches();
  }, [statusFilter]);

  const fetchLaunches = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/launches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLaunches(data);
      }
    } catch (error) {
      console.error('Error fetching launches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || styles.archived;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteClick = (launch: Launch) => {
    setDeleteConfirm({ show: true, id: launch.id, title: launch.title });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/launches/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLaunches(launches.filter((l) => l.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', title: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete launch');
      }
    } catch (error) {
      console.error('Error deleting launch:', error);
      alert('Failed to delete launch');
    }
  };

  const filters: FilterConfig[] = [
    {
      type: 'select',
      label: 'Filter by status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'active', label: 'Active' },
        { value: 'ended', label: 'Ended' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  const columns: Column<Launch>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (launch) => (
        <div className="flex items-center">
          {launch.heroImage && (
            <img
              src={launch.heroImage}
              alt={launch.title}
              className="h-10 w-10 rounded object-cover mr-3"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{launch.title}</div>
            <div className="text-sm text-gray-500">{launch.slug}</div>
          </div>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'status',
      label: 'Status',
      render: (launch) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(launch.status)}`}>
          {launch.status}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'activePeriod',
      label: 'Active Period',
      render: (launch) => (
        <div className="text-sm text-gray-500">
          <div>{formatDate(launch.activeStart)}</div>
          <div className="text-xs text-gray-400">to {formatDate(launch.activeEnd)}</div>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (launch) => (
        launch.featured ? (
          <span className="text-yellow-600">★ Featured</span>
        ) : (
          <span className="text-gray-400">—</span>
        )
      ),
      className: 'whitespace-nowrap',
    },
  ];

  const actions: Action<Launch>[] = [
    {
      label: 'Edit',
      href: (launch) => `/admin/launches/${launch.id}`,
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
        title="Launches"
        description="Manage seasonal launches and featured product collections"
        createButton={{ label: 'Create Launch', href: '/admin/launches/new' }}
        filters={<TableFilters filters={filters} />}
        data={launches}
        columns={columns}
        actions={actions}
        keyExtractor={(launch) => launch.id}
        onRowClick={(launch) => router.push(`/admin/launches/${launch.id}`)}
        emptyMessage="No launches found"
        emptyAction={{ label: 'Create your first launch', href: '/admin/launches/new' }}
        loading={loading}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        title="Delete Launch"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', title: '' })}
      />
    </>
  );
}
