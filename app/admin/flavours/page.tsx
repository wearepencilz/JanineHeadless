'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Flavour } from '@/types';
import { Table, TableCard } from '@/src/app/admin/components/ui/application/table/table';
import { Badge } from '@/src/app/admin/components/ui/base/badges/badges';
import { Select } from '@/src/app/admin/components/ui/base/select/select';
import { Button } from '@/app/admin/components/ui/buttons/button';
import DeleteModal from '@/app/admin/components/DeleteModal';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'gray'> = {
  active: 'success',
  seasonal: 'warning',
  upcoming: 'warning',
  archived: 'gray',
};

export default function FlavoursPage() {
  const router = useRouter();
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: '', name: '' });

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

  const handleDelete = async () => {
    const response = await fetch(`/api/flavours/${deleteConfirm.id}`, { method: 'DELETE' });
    if (response.ok) {
      setFlavours(flavours.filter((f) => f.id !== deleteConfirm.id));
      setDeleteConfirm({ show: false, id: '', name: '' });
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete flavour');
    }
  };

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="Flavours"
          badge={flavours.length}
          description="Manage your flavour archive"
          contentTrailing={
            <div className="flex items-center gap-3">
              <Select
                placeholder="All statuses"
                selectedKey={statusFilter}
                onSelectionChange={(key) => setStatusFilter(key as string)}
                items={[
                  { id: 'all', label: 'All statuses' },
                  { id: 'active', label: 'Active' },
                  { id: 'seasonal', label: 'Seasonal' },
                  { id: 'archived', label: 'Archived' },
                ]}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
              <Link href="/admin/flavours/create">
                <Button color="primary" size="sm">Add flavour</Button>
              </Link>
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
          </div>
        ) : flavours.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-tertiary">No flavours yet</p>
            <Link href="/admin/flavours/create">
              <Button color="secondary" size="sm">Create your first flavour</Button>
            </Link>
          </div>
        ) : (
          <Table aria-label="Flavours">
            <Table.Header>
              <Table.Head isRowHeader label="Name" />
              <Table.Head label="Status" />
              <Table.Head label="Ingredients" />
              <Table.Head label="" />
            </Table.Header>
            <Table.Body items={flavours}>
              {(flavour) => (
                <Table.Row
                  key={flavour.id}
                  id={flavour.id}
                  onAction={() => router.push(`/admin/flavours/${flavour.id}`)}
                >
                  <Table.Cell>
                    <div>
                      <p className="text-sm font-medium text-primary">{flavour.name}</p>
                      {flavour.description && (
                        <p className="text-xs text-tertiary truncate max-w-md">{flavour.description}</p>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={STATUS_COLOR[flavour.status] ?? 'gray'}>
                      {flavour.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-tertiary">
                      {flavour.ingredients?.length || 0} ingredient{(flavour.ingredients?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/flavours/${flavour.id}`}>
                        <Button color="secondary" size="sm">Edit</Button>
                      </Link>
                      <Button
                        color="primary-destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ show: true, id: flavour.id, name: flavour.name })}
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
        title="Delete Flavour"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
