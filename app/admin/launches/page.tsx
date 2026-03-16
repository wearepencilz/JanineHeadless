'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, TableCard } from '@/src/app/admin/components/ui/application/table/table';
import { Badge, BadgeWithDot } from '@/app/admin/components/ui/nav/badges';
import { Select } from '@/src/app/admin/components/ui/base/select/select';
import { Button } from '@/app/admin/components/ui/buttons/button';
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

const STATUS_COLOR: Record<string, 'blue' | 'success' | 'gray' | 'error'> = {
  upcoming: 'blue',
  active: 'success',
  ended: 'gray',
  archived: 'error',
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set';

export default function LaunchesPage() {
  const router = useRouter();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: '', title: '' });

  useEffect(() => {
    fetchLaunches();
  }, [statusFilter]);

  const fetchLaunches = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await fetch(`/api/launches?${params}`);
      if (response.ok) setLaunches(await response.json());
    } catch (error) {
      console.error('Error fetching launches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/launches/${deleteConfirm.id}`, { method: 'DELETE' });
    if (response.ok) {
      setLaunches(launches.filter((l) => l.id !== deleteConfirm.id));
      setDeleteConfirm({ show: false, id: '', title: '' });
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete launch');
    }
  };

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="Launches"
          badge={launches.length}
          description="Manage seasonal launches and featured product collections"
          contentTrailing={
            <div className="flex items-center gap-3">
              <Select
                placeholder="All statuses"
                selectedKey={statusFilter}
                onSelectionChange={(key) => setStatusFilter(key as string)}
                items={[
                  { id: 'all', label: 'All statuses' },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'active', label: 'Active' },
                  { id: 'ended', label: 'Ended' },
                  { id: 'archived', label: 'Archived' },
                ]}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
              <Link href="/admin/launches/new">
                <Button color="primary" size="sm">Create launch</Button>
              </Link>
            </div>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
          </div>
        ) : launches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-tertiary">No launches found</p>
            <Link href="/admin/launches/new">
              <Button color="secondary" size="sm">Create your first launch</Button>
            </Link>
          </div>
        ) : (
          <Table aria-label="Launches">
            <Table.Header>
              <Table.Head isRowHeader label="Title" />
              <Table.Head label="Status" />
              <Table.Head label="Active period" />
              <Table.Head label="Featured" />
              <Table.Head label="" />
            </Table.Header>
            <Table.Body items={launches}>
              {(launch) => (
                <Table.Row
                  key={launch.id}
                  id={launch.id}
                  onAction={() => router.push(`/admin/launches/${launch.id}`)}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {launch.heroImage && (
                        <img src={launch.heroImage} alt={launch.title} className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-primary">{launch.title}</p>
                        <p className="text-xs text-tertiary">{launch.slug}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <BadgeWithDot color={STATUS_COLOR[launch.status] ?? 'gray'}>
                      {launch.status}
                    </BadgeWithDot>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <p className="text-sm text-secondary">{formatDate(launch.activeStart)}</p>
                      <p className="text-xs text-tertiary">to {formatDate(launch.activeEnd)}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {launch.featured ? (
                      <Badge color="warning">Featured</Badge>
                    ) : (
                      <span className="text-sm text-tertiary">—</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/launches/${launch.id}`}>
                        <Button color="secondary" size="sm">Edit</Button>
                      </Link>
                      <Button
                        color="primary-destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ show: true, id: launch.id, title: launch.title })}
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
        title="Delete Launch"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', title: '' })}
      />
    </>
  );
}
