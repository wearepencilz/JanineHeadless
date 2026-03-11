'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Campaign } from '@/types/game';
import AssetUploader from './AssetUploader';

interface CampaignEditFormProps {
  campaign: Campaign;
}

export default function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: campaign.name,
    display_title: (campaign as any).display_title || '',
    description: (campaign as any).description || '',
    status: campaign.status as string,
    start_date: new Date(campaign.start_date).toISOString().slice(0, 16),
    end_date: new Date(campaign.end_date).toISOString().slice(0, 16),
    timer_duration: campaign.timer_duration,
    reward_total: campaign.reward_total,
    winner_count: (campaign as any).winner_count || 100,
    reward_type: (campaign as any).reward_type || '',
    reward_description: (campaign as any).reward_description || '',
    ticket_success_title: (campaign as any).ticket_success_title || '',
    ticket_success_message: (campaign as any).ticket_success_message || '',
    player_sprite_url: (campaign as any).player_sprite_url || '',
    player_jump_sprite_url: (campaign as any).player_jump_sprite_url || '',
    icecream_sprite_url: (campaign as any).icecream_sprite_url || '',
    ingredient_sprite_url: (campaign as any).ingredient_sprite_url || '',
    platform_sprite_url: (campaign as any).platform_sprite_url || '',
    background_url: (campaign as any).background_url || '',
    hazard_sprite_url: (campaign as any).hazard_sprite_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Submitting campaign update with data:', formData);
      
      const response = await fetch(`/api/game/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          display_title: formData.display_title,
          description: formData.description,
          status: formData.status,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          timer_duration: parseInt(formData.timer_duration.toString()),
          reward_total: parseInt(formData.reward_total.toString()),
          winner_count: parseInt(formData.winner_count.toString()),
          reward_type: formData.reward_type,
          reward_description: formData.reward_description,
          ticket_success_title: formData.ticket_success_title,
          ticket_success_message: formData.ticket_success_message,
          player_sprite_url: formData.player_sprite_url,
          player_jump_sprite_url: formData.player_jump_sprite_url,
          icecream_sprite_url: formData.icecream_sprite_url,
          ingredient_sprite_url: formData.ingredient_sprite_url,
          platform_sprite_url: formData.platform_sprite_url,
          background_url: formData.background_url,
          hazard_sprite_url: formData.hazard_sprite_url,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Campaign update failed:', data);
        throw new Error(data.error || 'Failed to update campaign');
      }

      const result = await response.json();
      console.log('Campaign updated successfully:', result);
      
      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/game/campaigns/${campaign.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete campaign');
      }

      router.push('/admin/games');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Edit Campaign Settings
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Campaign updated successfully!
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Name (Internal)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Internal identifier for admin use
          </p>
        </div>

        {/* Display Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Title
          </label>
          <input
            type="text"
            value={formData.display_title}
            onChange={(e) => setFormData({ ...formData, display_title: e.target.value })}
            placeholder="Leave empty to use campaign name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Title shown to players (defaults to campaign name if empty)
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Campaign description shown to players"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Timer Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timer Duration (seconds)
          </label>
          <input
            type="number"
            value={formData.timer_duration}
            onChange={(e) =>
              setFormData({
                ...formData,
                timer_duration: parseInt(e.target.value),
              })
            }
            min="10"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            How long players have to complete the game
          </p>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Winner Count
            </label>
            <input
              type="number"
              value={formData.winner_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  winner_count: parseInt(e.target.value),
                })
              }
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              First X players to complete get rewards
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Rewards
            </label>
            <input
              type="number"
              value={formData.reward_total}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reward_total: parseInt(e.target.value),
                })
              }
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Number of physical rewards available
            </p>
          </div>
        </div>

        {/* Reward Configuration */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Reward Details
          </h3>
          
          <div className="space-y-4">
            {/* Reward Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Type
              </label>
              <input
                type="text"
                value={formData.reward_type}
                onChange={(e) => setFormData({ ...formData, reward_type: e.target.value })}
                placeholder="e.g., Free Scoop, 10% Off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Reward Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Description
              </label>
              <textarea
                value={formData.reward_description}
                onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                placeholder="e.g., Redeem for one free scoop of any flavour"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ticket Success Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Success Title
              </label>
              <input
                type="text"
                value={formData.ticket_success_title}
                onChange={(e) => setFormData({ ...formData, ticket_success_title: e.target.value })}
                placeholder="e.g., 🎉 You Won!"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Title shown when player wins a reward
              </p>
            </div>

            {/* Ticket Success Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Success Message
              </label>
              <textarea
                value={formData.ticket_success_message}
                onChange={(e) => setFormData({ ...formData, ticket_success_message: e.target.value })}
                placeholder="e.g., Show this code at the counter to claim your reward!"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Instructions shown with the claim code
              </p>
            </div>
          </div>
        </div>

        {/* Game Assets Section */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4">
            Game Assets (Sprites)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload custom sprites for your game. Leave empty to use default colored shapes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AssetUploader
              label="Player Sprite"
              description="Character sprite - appears as the playable character"
              recommendedSize="32×48px (width × height)"
              currentUrl={formData.player_sprite_url}
              onUpload={(url) => setFormData({ ...formData, player_sprite_url: url })}
            />

            <AssetUploader
              label="Player Jump Sprite"
              description="Character sprite when jumping - switches automatically in air"
              recommendedSize="32×48px (width × height)"
              currentUrl={formData.player_jump_sprite_url}
              onUpload={(url) => setFormData({ ...formData, player_jump_sprite_url: url })}
            />

            <AssetUploader
              label="Ice Cream Sprite"
              description="Goal collectible - player must reach this to win"
              recommendedSize="32×32px (square)"
              currentUrl={formData.icecream_sprite_url}
              onUpload={(url) => setFormData({ ...formData, icecream_sprite_url: url })}
            />

            <AssetUploader
              label="Ingredient Sprite"
              description="Collectible items - must collect all 3 before ice cream unlocks"
              recommendedSize="24×24px (square)"
              currentUrl={formData.ingredient_sprite_url}
              onUpload={(url) => setFormData({ ...formData, ingredient_sprite_url: url })}
            />

            <AssetUploader
              label="Platform Texture"
              description="Platform surface - should be tileable/repeatable pattern"
              recommendedSize="Any size, tileable recommended"
              currentUrl={formData.platform_sprite_url}
              onUpload={(url) => setFormData({ ...formData, platform_sprite_url: url })}
            />

            <AssetUploader
              label="Hazard Sprite"
              description="Dangerous obstacles - touching these ends the game"
              recommendedSize="20×20px (square)"
              currentUrl={formData.hazard_sprite_url}
              onUpload={(url) => setFormData({ ...formData, hazard_sprite_url: url })}
            />

            <AssetUploader
              label="Background Image"
              description="Game background - displayed behind all game elements"
              recommendedSize="1600×600px (full scrolling world)"
              currentUrl={formData.background_url}
              onUpload={(url) => setFormData({ ...formData, background_url: url })}
            />
          </div>

          {/* Sprite Guidelines */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              📐 Sprite Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use PNG format with transparency for best results</li>
              <li>• Pixel art should use nearest-neighbor scaling (no anti-aliasing)</li>
              <li>• Keep file sizes under 2MB per sprite</li>
              <li>• Platform textures should tile seamlessly (repeatable edges)</li>
              <li>• All sprites will be rendered with pixel-perfect scaling</li>
              <li>• Leave sprites empty to use default colored shapes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete Campaign
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/games')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Campaign?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this campaign? This will also delete all
              associated game sessions, scores, and rewards. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
