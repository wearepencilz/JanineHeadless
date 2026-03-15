'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WalkingSprite } from '@/types/sprite';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';
import { Checkbox } from '@/app/admin/components/ui/checkbox';

export default function EditSpritePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [sprite, setSprite] = useState<WalkingSprite | null>(null);

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
    is_active: true,
  });

  useEffect(() => {
    fetchSprite();
  }, [params.id]);

  const fetchSprite = async () => {
    try {
      const response = await fetch(`/api/sprites/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch sprite');
      
      const data = await response.json();
      setSprite(data.sprite);
      setFormData({
        name: data.sprite.name,
        description: data.sprite.description || '',
        idle_sprite_url: data.sprite.idle_sprite_url,
        walk_sprite_url: data.sprite.walk_sprite_url,
        jump_sprite_url: data.sprite.jump_sprite_url,
        frame_width: data.sprite.frame_width,
        frame_height: data.sprite.frame_height,
        walk_frame_count: data.sprite.walk_frame_count,
        walk_frame_rate: data.sprite.walk_frame_rate,
        is_active: data.sprite.is_active,
      });
    } catch (err) {
      setError('Failed to load sprite');
    } finally {
      setLoading(false);
    }
  };

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

      if (!response.ok) throw new Error('Upload failed');

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
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/sprites/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update sprite');
      }

      router.push('/admin/sprites');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sprite');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this sprite?')) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sprites/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sprite');

      router.push('/admin/sprites');
    } catch (err) {
      setError('Failed to delete sprite');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!sprite) {
    return <div className="text-center py-12">Sprite not found</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/sprites" className="text-blue-600 hover:text-blue-700">
          ← Back to Sprites
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Edit Walking Sprite</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <Input
            label="Name *"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            isRequired
          />
        </div>

        <div>
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            rows={3}
          />
        </div>

        <Checkbox
          isSelected={formData.is_active}
          onChange={(v) => setFormData({ ...formData, is_active: v })}
          label="Active"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Frame Width (px) *"
              type="number"
              value={String(formData.frame_width)}
              onChange={(value) => setFormData({ ...formData, frame_width: parseInt(value) })}
              isRequired
            />
          </div>

          <div>
            <Input
              label="Frame Height (px) *"
              type="number"
              value={String(formData.frame_height)}
              onChange={(value) => setFormData({ ...formData, frame_height: parseInt(value) })}
              isRequired
            />
          </div>

          <div>
            <Input
              label="Walk Frame Count *"
              type="number"
              value={String(formData.walk_frame_count)}
              onChange={(value) => setFormData({ ...formData, walk_frame_count: parseInt(value) })}
              isRequired
            />
          </div>

          <div>
            <Input
              label="Walk Frame Rate (fps) *"
              type="number"
              value={String(formData.walk_frame_rate)}
              onChange={(value) => setFormData({ ...formData, walk_frame_rate: parseInt(value) })}
              isRequired
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
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
            isDisabled={saving || !!uploading}
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
            isDisabled={deleting}
          >
            Delete
          </Button>
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
