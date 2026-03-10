import { Metadata } from 'next';
import Link from 'next/link';
import { findAll } from '@/lib/db-game';
import type { Campaign } from '@/types/game';

export const metadata: Metadata = {
  title: 'Game Campaigns | Admin',
};

/**
 * Fetch all campaigns
 */
async function getCampaigns(): Promise<Campaign[]> {
  try {
    const campaigns = await findAll<Campaign>('campaigns', {
      orderBy: 'created_at',
      order: 'DESC',
    });
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get status badge color
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'ended':
      return 'bg-gray-100 text-gray-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Check if campaign is currently active
 */
function isCampaignActive(campaign: Campaign): boolean {
  const now = new Date();
  const start = new Date(campaign.start_date);
  const end = new Date(campaign.end_date);
  return campaign.status === 'active' && now >= start && now <= end;
}

export default async function GamesAdminPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Manage pixel art game campaigns, rewards, and leaderboards
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/games/scan"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">🔍</span>
            Quick Scan
          </Link>
          <Link
            href="/admin/games/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Campaigns</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {campaigns.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Active Now</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {campaigns.filter(isCampaignActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Rewards</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {campaigns.reduce((sum, c) => sum + c.reward_total, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Winner Slots</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {campaigns.reduce((sum, c) => sum + ((c as any).winner_count || 100), 0)}
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Campaigns</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No campaigns yet</p>
            <Link
              href="/admin/games/new"
              className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
            >
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rewards
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const isActive = isCampaignActive(campaign);
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {campaign.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {isActive ? '🟢 Active' : campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{formatDate(campaign.start_date)}</div>
                        <div className="text-gray-500">
                          to {formatDate(campaign.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {campaign.timer_duration}s
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {campaign.reward_total} total
                            </div>
                            <div className="text-xs text-gray-500">
                              First {(campaign as any).winner_count || 100} win
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/game/${campaign.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Play
                        </Link>
                        <Link
                          href={`/leaderboard/${campaign.id}`}
                          target="_blank"
                          className="text-purple-600 hover:text-purple-900"
                          title="Public leaderboard for display"
                        >
                          Display
                        </Link>
                        <Link
                          href={`/admin/games/${campaign.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/games/${campaign.id}/leaderboard`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Leaderboard
                        </Link>
                        <Link
                          href={`/admin/games/${campaign.id}/rewards`}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Rewards
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Endpoints Reference */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          API Endpoints
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <span className="font-mono text-green-600">GET</span>
              <span className="ml-2 font-mono">/api/game/campaigns</span>
            </div>
            <span className="text-gray-600">List all campaigns</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <span className="font-mono text-green-600">GET</span>
              <span className="ml-2 font-mono">/api/game/campaigns/[id]</span>
            </div>
            <span className="text-gray-600">Get campaign by ID</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <span className="font-mono text-blue-600">POST</span>
              <span className="ml-2 font-mono">/api/game/sessions</span>
            </div>
            <span className="text-gray-600">Create game session</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <span className="font-mono text-blue-600">POST</span>
              <span className="ml-2 font-mono">/api/game/scores</span>
            </div>
            <span className="text-gray-600">Submit score</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-mono text-green-600">GET</span>
              <span className="ml-2 font-mono">
                /api/game/leaderboard/[campaignId]
              </span>
            </div>
            <span className="text-gray-600">Get leaderboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
