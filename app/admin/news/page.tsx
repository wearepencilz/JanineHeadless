'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number; title: string }>({
    show: false,
    id: 0,
    title: '',
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item: NewsItem) => {
    setDeleteConfirm({ show: true, id: item.id, title: item.title });
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/news/${deleteConfirm.id}`, { method: 'DELETE' });
      setNews(news.filter((n) => n.id !== deleteConfirm.id));
      setDeleteConfirm({ show: false, id: 0, title: '' });
    } catch (error) {
      console.error('Failed to delete news:', error);
      alert('Failed to delete news article');
    }
  };

  const columns: Column<NewsItem>[] = [
    {
      key: 'title',
      label: 'Article',
      render: (item) => (
        <div className="flex items-center">
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="h-10 w-10 rounded object-cover mr-3"
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{item.title}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{item.content}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {new Date(item.date).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const actions: Action<NewsItem>[] = [
    {
      label: 'Edit',
      href: (item) => `/admin/news/${item.id}`,
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
        title="News"
        description="Manage news articles and updates"
        createButton={{ label: 'New Article', href: '/admin/news/new' }}
        data={news}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => String(item.id)}
        onRowClick={(item) => router.push(`/admin/news/${item.id}`)}
        emptyMessage="No news articles yet"
        emptyAction={{ label: 'Create your first article', href: '/admin/news/new' }}
        loading={loading}
      />

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
