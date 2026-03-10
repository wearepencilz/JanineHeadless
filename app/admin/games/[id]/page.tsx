import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findById } from '@/lib/db-game';
import type { Campaign } from '@/types/game';
import CampaignEditForm from './CampaignEditForm';
import DeleteCampaignButton from './DeleteCampaignButton';
import ResetCampaignButton from './ResetCampaignButton';

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Edit Campaign | Admin',
};

/**
 * Fetch campaign by ID
 */
async function getCampaign(id: string): Promise<Campaign | null> {
  try {
    const campaign = await findById<Campaign>('campaigns', id);
    return campaign;
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

export default async function CampaignEditPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/games"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
          <p className="text-gray-600 mt-1">{campaign.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/game/${campaign.id}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Game
          </Link>
          <Link
            href={`/admin/games/${campaign.id}/leaderboard`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href={`/admin/games/${campaign.id}/rewards`}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Rewards
          </Link>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Information
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Campaign ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">
              {campaign.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">{campaign.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(campaign.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(campaign.updated_at).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Edit Form */}
      <CampaignEditForm campaign={campaign} />

      {/* Game URL */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-4">
          Public URLs
        </h3>
        
        <div className="space-y-3">
          {/* Game URL */}
          <div>
            <label className="text-xs font-medium text-blue-700 block mb-1">
              Game URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-2 rounded border border-blue-200 text-sm">
                /game/{campaign.id}
              </code>
              <Link
                href={`/game/${campaign.id}`}
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Open
              </Link>
            </div>
          </div>

          {/* Leaderboard URL */}
          <div>
            <label className="text-xs font-medium text-blue-700 block mb-1">
              Public Leaderboard (for display screens)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-4 py-2 rounded border border-blue-200 text-sm">
                /leaderboard/{campaign.id}
              </code>
              <Link
                href={`/leaderboard/${campaign.id}`}
                target="_blank"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Open
              </Link>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Clean view with no navigation - perfect for TV/monitor displays
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Danger Zone
        </h2>
        <div className="space-y-4">
          <ResetCampaignButton
            campaignId={campaign.id}
            campaignName={campaign.name}
          />
          <DeleteCampaignButton
            campaignId={campaign.id}
            campaignName={campaign.name}
          />
        </div>
      </div>
    </div>
  );
}
