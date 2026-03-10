# Campaign Customization Fields

## Overview

Added customizable text fields to game campaigns for better branding and messaging control.

## New Database Fields

Migration: `lib/game/migrations/002_add_campaign_text_fields.sql`

### Campaign Table Additions:
- `display_title` - Custom title shown on game page (defaults to name if empty)
- `description` - Campaign description shown to players
- `ticket_success_title` - Title shown when player wins a ticket (e.g., "🎉 You Won!")
- `ticket_success_message` - Instructions shown with the claim code
- `reward_type` - Type of reward (e.g., "Free Scoop", "10% Off")
- `reward_description` - Detailed description of the reward

## Admin Interface Updates

### Create Campaign Form (`app/admin/games/new/CreateCampaignForm.tsx`)
Added fields:
- Campaign Name (Internal) - for admin use
- Display Title - shown to players
- Description - campaign description
- Reward Type - type of reward
- Reward Description - what the reward includes
- Ticket Success Title - custom win message title
- Ticket Success Message - custom redemption instructions

### Edit Campaign Form (`app/admin/games/[id]/CampaignEditForm.tsx`)
Same fields as create form, with ability to update existing campaigns.

## Frontend Display

### Game Page (`app/game/[campaignId]/page.tsx`)
- Uses `display_title` instead of `name` for page title
- Shows custom `description` if provided
- Updates page metadata for SEO

### Game Container (`components/game/GameContainer.tsx`)
- Displays custom `ticket_success_title` when player wins
- Shows `reward_type` prominently
- Uses custom `ticket_success_message` for redemption instructions

## API Updates

### Reward Allocator (`lib/game/reward-allocator.ts`)
- Fetches campaign-specific reward details
- Returns custom success title and message with reward
- Uses campaign `reward_type` and `ticket_success_message`

### Campaign API Routes
- `POST /api/game/campaigns` - accepts new fields
- `PUT /api/game/campaigns/[id]` - allows updating new fields

## Usage Example

```typescript
// Create campaign with custom messaging
{
  name: "Spring Hunt 2026",
  display_title: "Spring Ice Cream Hunt",
  description: "Find the hidden ice cream and win a free scoop!",
  reward_type: "Free Scoop",
  reward_description: "Redeem for one free scoop of any flavour",
  ticket_success_title: "🎉 You're a Winner!",
  ticket_success_message: "Show this code at the counter to claim your free scoop. Valid for 30 days!"
}
```

## Migration Instructions

Run the migration to add new fields:
```bash
# Apply migration
psql $DATABASE_URL -f lib/game/migrations/002_add_campaign_text_fields.sql
```

## Default Values

If fields are not provided:
- `display_title` defaults to campaign `name`
- `description` is optional
- `reward_type` defaults to "Free Pint"
- `ticket_success_title` defaults to "🎉 You Won!"
- `ticket_success_message` defaults to standard redemption text
