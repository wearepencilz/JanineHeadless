/**
 * Update an existing campaign's level layout
 * 
 * Usage: npx tsx scripts/update-campaign-layout.ts <campaign-id>
 */

import { updateById } from '@/lib/db-game';

const newLayout = {
  platforms: [
    // Ground level platforms (moved 16px higher)
    { x: 0, y: 358, width: 635, height: 16 },
    { x: 844, y: 399, width: 119, height: 16 },
    { x: 958, y: 311, width: 259, height: 16 },
    
    // Mid-level platforms (moved 16px higher)
    { x: 40, y: 190, width: 176, height: 16 },
    { x: 466, y: 205, width: 128, height: 16 },
    { x: 823, y: 158, width: 200, height: 16 },
  ],
  iceCreams: [
    { x: 915, y: 93 },
  ],
  ingredients: [
    { x: 128, y: 125 },
    { x: 518, y: 141 },
    { x: 884, y: 342 },
  ],
  hazards: [],
  spawnPoint: { x: 48, y: 286 },
  worldWidth: 1208,
};

async function updateCampaignLayout(campaignId: string) {
  try {
    console.log(`Updating campaign ${campaignId} with new layout...`);
    
    const result = await updateById('campaigns', campaignId, {
      level_config: JSON.stringify(newLayout),
    });
    
    if (result) {
      console.log('✅ Campaign updated successfully!');
      console.log('New layout:', JSON.stringify(newLayout, null, 2));
    } else {
      console.error('❌ Campaign not found');
    }
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    throw error;
  }
}

// Get campaign ID from command line
const campaignId = process.argv[2];

if (!campaignId) {
  console.error('Usage: npx tsx scripts/update-campaign-layout.ts <campaign-id>');
  console.error('Example: npx tsx scripts/update-campaign-layout.ts 32c8a714-1ae8-4e6a-bfdf-76b5e8c8e8e8');
  process.exit(1);
}

updateCampaignLayout(campaignId)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
