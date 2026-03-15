'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Format } from '@/types';
import { Table, TableCard } from '@/src/app/admin/components/ui/application/table/table';
import { Badge } from '@/src/app/admin/components/ui/base/badges/badges';
import { Select } from '@/src/app/admin/components/ui/base/select/select';
import { Button } from '@/app/admin/components/ui/buttons/button';
import DeleteModal from '@/app/admin/components/DeleteModal';

const CATEGORY_COLOR: Record<string, 'purple' | 'blue' | 'orange' | 'success' | 'gray'> = {
  frozen: 'blue',
  food: 'orange',
  experience: 'purple',
  bundle: 'success',
};

export default function FormatsPage() {
  const router = useRouter();
  const [formats, setFormats] = useState<Format[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: '', name: '' });

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

  const handleDelete = async () => {
    const response = await fetch(`/api/formats/${deleteConfirm.id}`, { method: 'DELETE' });
    if (response.ok) {
      setFormats(formats.filter((f) => f.id !== deleteConfirm.id));
      setDeleteConfirm({ show: false, id: '', name: '' });
    } else {
      const error = await response.json();
      alert(error.details?.message || error.error || 'Failed to delete format');
    }
  };

  const filtered = formats.filter((f) =>
    categoryFilter === 'all' || f.category === categoryFilter
  );

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="Formats"
          badge={filtered.length}
          description="Manage product format templates"
          contentTrailing={
            <div className="flex items-center gap-3">
              <Select
                placeholder="All categories"
                selectedKey={categoryFilter}
                onSelectionChange={(key) => setCategoryFilter(key as string)}
                items={[
                  { id: 'all', label: 'All categories' },
                  { id: 'frozen', label: 'Frozen' },
                  { id: 'food', label: 'Food' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'bundle', label: 'Bundle' },
                ]}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
              <Link href="/admin/formats/create">
                <Button color="primary" size="sm">Add format</Button>
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
            <p className="text-sm text-tertiary">No formats found</p>
            <Link href="/admin/formats/create">
              <Button color="secondary" size="sm">Add your first format</Button>
            </Link>
          </div>
        ) : (
          <Table aria-label="Formats">
            <Table.Header>
              <Table.Head isRowHeader label="Name" />
              <Table.Head label="Category" />
              <Table.Head label="Description" />
              <Table.Head label="Serving" />
              <Table.Head label="Flavours" />
              <Table.Head label="" />
            </Table.Header>
            <Table.Body items={filtered}>
              {(format) => (
                <Table.Row
                  key={format.id}
                  id={format.id}
                  onAction={() => router.push(`/admin/formats/${format.id}`)}
                >
                  <Table.Cell>
                    <div>
                      <p className="text-sm font-medium text-primary">{format.name}</p>
                      <p className="text-xs text-tertiary">{format.slug}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={CATEGORY_COLOR[format.category] ?? 'gray'}>{format.category}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-secondary truncate max-w-xs block">{format.description}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="gray">{format.servingStyle}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {!format.requiresFlavours ? (
                      <span className="text-sm text-tertiary">N/A</span>
                    ) : (
                      <Badge color="purple">
                        {format.minFlavours === format.maxFlavours
                          ? `${format.minFlavours} flavour${format.minFlavours !== 1 ? 's' : ''}`
                          : `${format.minFlavours}–${format.maxFlavours} flavours`}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/formats/${format.id}`}>
                        <Button color="secondary" size="sm">Edit</Button>
                      </Link>
                      <Button
                        color="primary-destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ show: true, id: format.id, name: format.name })}
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
        title="Delete Format"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
