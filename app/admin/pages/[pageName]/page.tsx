'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface PageContent {
  title?: string;
  content?: string;
  [key: string]: any;
}

export default function PageEditPage() {
  const router = useRouter();
  const params = useParams();
  const pageName = params?.pageName as string;

  const [formData, setFormData] = useState<PageContent>({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/pages/${pageName}`);
      const data = await res.json();
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/pages/${pageName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Page saved successfully');
      } else {
        alert('Failed to save page');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 capitalize">
          Edit {pageName} Page
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">
              Page Title
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter page title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">
              Content
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter page content"
            />
            <p className="text-xs text-gray-500 mt-2">
              You can use HTML or Markdown formatting
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 h-10 px-4 text-sm"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
