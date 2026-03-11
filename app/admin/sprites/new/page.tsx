'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSpritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    idle_sprite_url: '',
    walk_sprite_url: '',
    jump_sprite_url: '',
    frame_width: 32,
    frame_height: 48,
    walk_frame_count: 4,
    walk_frame_rate: 10,
  });

  const handleFileUpload = async (
    file: File,
    field: 'idle_sprite_url' | 'walk_sprite_url' | 'jump_sprite_url'
  ) => {
    setUploading(field);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, [field]: data.url }));
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sprites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create sprite');
      }

      router.push('/admin/sprites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sprite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/sprites" className="text-blue-600 hover:text-blue-700">
          ← Back to Sprites
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Add New Walking Sprite</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Width (px) *
            </label>
            <input
              type="number"
              value={formData.frame_width}
              onChange={(e) => setFormData({ ...formData, frame_width: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frame Height (px) *
            </label>
            <input
              type="number"
              value={formData.frame_height}
              onChange={(e) => setFormData({ ...formData, frame_height: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Walk Frame Count *
            </label>
            <input
              type="number"
              value={formData.walk_frame_count}
              onChange={(e) => setFormData({ ...formData, walk_frame_count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Walk Frame Rate (fps) *
            </label>
            <input
              type="number"
              value={formData.walk_frame_rate}
              onChange={(e) => setFormData({ ...formData, walk_frame_rate: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idle Sprite *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'idle_sprite_url')}
              className="w-full"
              disabled={uploading === 'idle_sprite_url'}
            />
            {formData.idle_sprite_url && (
              <img src={formData.idle_sprite_url} alt="Idle preview" className="mt-2 h-24 object-contain" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Walk Sprite Sheet *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'walk_sprite_url')}
              className="w-full"
              disabled={uploading === 'walk_sprite_url'}
            />
            {formData.walk_sprite_url && (
              <img src={formData.walk_sprite_url} alt="Walk preview" className="mt-2 h-24 object-contain" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jump Sprite *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'jump_sprite_url')}
              className="w-full"
              disabled={uploading === 'jump_sprite_url'}
            />
            {formData.jump_sprite_url && (
              <img src={formData.jump_sprite_url} alt="Jump preview" className="mt-2 h-24 object-contain" />
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !!uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Sprite'}
          </button>
          <Link
            href="/admin/sprites"
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
