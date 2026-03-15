import { Metadata } from 'next';
import Link from 'next/link';
import { findAll } from '@/lib/db-game';
import type { WalkingSprite } from '@/types/sprite';
import { Badge } from '@/src/app/admin/components/ui/base/badges/badges';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Walking Sprites | Admin',
};

export default async function SpritesPage() {
  const sprites = await findAll<WalkingSprite>('walking_sprites', {
    orderBy: 'created_at',
    order: 'DESC',
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Walking Sprites</h1>
        <Link
          href="/admin/sprites/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Sprite
        </Link>
      </div>

      {sprites.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No sprites yet</p>
          <Link
            href="/admin/sprites/new"
            className="text-blue-600 hover:text-blue-700"
          >
            Create your first sprite
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprites.map((sprite) => (
            <Link
              key={sprite.id}
              href={`/admin/sprites/${sprite.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold">{sprite.name}</h3>
                {!sprite.is_active && (
                  <Badge color="gray" size="sm">Inactive</Badge>
                )}
              </div>

              {sprite.description && (
                <p className="text-gray-600 text-sm mb-4">{sprite.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-100 rounded p-2">
                  <img
                    src={sprite.idle_sprite_url}
                    alt="Idle"
                    className="w-full h-16 object-contain"
                  />
                  <p className="text-xs text-center mt-1 text-gray-600">Idle</p>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <img
                    src={sprite.walk_sprite_url}
                    alt="Walk"
                    className="w-full h-16 object-contain"
                  />
                  <p className="text-xs text-center mt-1 text-gray-600">Walk</p>
                </div>
                <div className="bg-gray-100 rounded p-2">
                  <img
                    src={sprite.jump_sprite_url}
                    alt="Jump"
                    className="w-full h-16 object-contain"
                  />
                  <p className="text-xs text-center mt-1 text-gray-600">Jump</p>
                </div>
              </div>

              <div className="text-sm text-gray-500 space-y-1">
                <p>Size: {sprite.frame_width}x{sprite.frame_height}px</p>
                <p>Walk frames: {sprite.walk_frame_count} @ {sprite.walk_frame_rate}fps</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
