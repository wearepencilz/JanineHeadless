#!/usr/bin/env tsx
/**
 * Update all campaigns with new platform layout (16px higher)
 * Run with: npx tsx scripts/update-all-campaigns-layout.ts
 */

import { queryWithRetry, updateById } from '../lib/db-game';

const newLayout = {
  platforms: [
    // Ground level platforms (moved 16px higher)
    { x: 0, y: 358, width: 635, height: 16 },      // Starting platform (was 374)
    { x: 844, y: 399, width: 119, height: 16 },    // Middle platform (was 415)
    { x: 958, y: 311, width: 259, height: 16 },    // End platform (was 327)
    
    // Mid-level platforms (moved 16px higher)
    { x: 40, y: 190, width: 176, height: 16 },     // Platform 1 (was 206)
    { x: 466, y: 205, width: 128, height: 16 },    // Platform 2 (was 221)
    { x: 823, y: 158, width: 200, height: 16 },    // Platform 3 (was 174)
  ],
  iceCreams: [
    { x: 915, y: 93 }, // Goal - stays same
  ],
  ingredients: [
    { x: 128, y: 125 },   // Stays same
    { x: 518, y: 141 },   // Stays same
    { x: 884, y: 342 },   // Stays same
  ],
  hazards: [],
  spawnPoint: { x: 48, y: 286 }, // Moved 16px higher (was 302)
  worldWidth: 1208,
};

async function updateAllCampaigns() {
  try {
    console.log('🎮 Updating all campaigns with new platform layout...\n');

    // Get all campaigns
    const result = await queryWithRetry(
      'SELECT id, name FROM campaigns ORDER BY created_at DESC'
    );

    if (result.rows.length === 0) {
      console.log('No campaigns found.');
      return;
    }

    console.log(`Found ${result.rows.length} campaign(s) to update:\n`);

    // Update each campaign
    for (const campaign of result.rows) {
      console.log(`Updating: ${campaign.name} (${campaign.id})`);
      
      await updateById('campaigns', campaign.id, {
        level_config: JSON.stringify(newLayout)
      });
      
      console.log(`✅ Updated successfully\n`);
    }

    console.log('🎉 All campaigns updated with new layout!');
    console.log('\nChanges applied:');
    console.log('- All platforms moved 16px higher');
    console.log('- Spawn point moved 16px higher (y=286)');
    console.log('- Jump velocity already set to -520 for higher jumps');
    console.log('\nPlayers can now play existing campaigns with the new layout.');

  } catch (error) {
    console.error('❌ Error updating campaigns:', error);
    process.exit(1);
  }
}

// Run the update
updateAllCampaigns()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
