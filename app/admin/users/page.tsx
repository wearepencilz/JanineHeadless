'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Table, TableCard } from '@/src/app/admin/components/ui/application/table/table';
import { Button } from '@/app/admin/components/ui/buttons/button';
import ConfirmModal from '@/app/admin/components/ConfirmModal';
import { useToast } from '@/app/admin/components/ToastContainer';
import { Edit01, Trash01 } from '@untitledui/icons';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
};

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: '', name: '' });

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    const res = await fetch(`/api/users/${deleteConfirm.id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users.filter((u) => u.id !== deleteConfirm.id));
      toast.success('User deleted', `"${deleteConfirm.name}" has been removed`);
    } else {
      toast.error('Delete failed', 'Could not delete user');
    }
    setDeleteConfirm({ show: false, id: '', name: '' });
  };

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="Users"
          badge={users.length}
          description="Manage CMS admin users and access"
          contentTrailing={
            <Link href="/admin/users/new">
              <Button color="primary" size="sm">New user</Button>
            </Link>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-tertiary">No users yet</p>
          </div>
        ) : (
          <Table aria-label="Users">
            <Table.Header>
              <Table.Head isRowHeader label="User" />
              <Table.Head label="Role" />
              <Table.Head label="Status" />
              <Table.Head label="" />
            </Table.Header>
            <Table.Body items={users}>
              {(user) => (
                <Table.Row key={user.id} id={user.id}>
                  <Table.Cell>
                    <div>
                      <p className="text-sm font-medium text-primary">{user.name}</p>
                      <p className="text-xs text-tertiary">@{user.username} · {user.email}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-secondary">{ROLE_LABELS[user.role] ?? user.role}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <span className={`text-xs font-medium ${user.active ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/users/${user.id}`}>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded" title="Edit">
                          <Edit01 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded"
                        title="Delete"
                        onClick={() => setDeleteConfirm({ show: true, id: user.id, name: user.name })}
                      >
                        <Trash01 className="w-4 h-4" />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      <ConfirmModal
        isOpen={deleteConfirm.show}
        variant="danger"
        title="Delete User"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
