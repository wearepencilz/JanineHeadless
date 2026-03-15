'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Table, TableCard } from '@/src/app/admin/components/ui/application/table/table';
import { Button } from '@/app/admin/components/ui/buttons/button';
import DeleteModal from '@/app/admin/components/DeleteModal';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  image?: string;
}

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: 0, title: '' });

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setNews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    await fetch(`/api/news/${deleteConfirm.id}`, { method: 'DELETE' });
    setNews(news.filter((n) => n.id !== deleteConfirm.id));
    setDeleteConfirm({ show: false, id: 0, title: '' });
  };

  return (
    <>
      <TableCard.Root>
        <TableCard.Header
          title="News"
          badge={news.length}
          description="Manage news articles and updates"
          contentTrailing={
            <Link href="/admin/news/new">
              <Button color="primary" size="sm">New article</Button>
            </Link>
          }
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-600" />
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-tertiary">No news articles yet</p>
            <Link href="/admin/news/new">
              <Button color="secondary" size="sm">Create your first article</Button>
            </Link>
          </div>
        ) : (
          <Table aria-label="News">
            <Table.Header>
              <Table.Head isRowHeader label="Article" />
              <Table.Head label="Date" />
              <Table.Head label="" />
            </Table.Header>
            <Table.Body items={news}>
              {(item) => (
                <Table.Row
                  key={item.id}
                  id={String(item.id)}
                  onAction={() => router.push(`/admin/news/${item.id}`)}
                >
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-primary">{item.title}</p>
                        <p className="text-xs text-tertiary line-clamp-1">{item.content}</p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-secondary">{new Date(item.date).toLocaleDateString()}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/news/${item.id}`}>
                        <Button color="secondary" size="sm">Edit</Button>
                      </Link>
                      <Button
                        color="primary-destructive"
                        size="sm"
                        onClick={() => setDeleteConfirm({ show: true, id: item.id, title: item.title })}
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
        title="Delete News Article"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: 0, title: '' })}
      />
    </>
  );
}
