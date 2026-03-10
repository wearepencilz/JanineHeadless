# Game API Testing Guide

This guide helps you test the pixel art game API endpoints.

## Prerequisites

1. **PostgreSQL database** set up and migrated
2. **Development server** running (`npm run dev`)
3. **Test campaign** created in the database

## Quick Start

### 1. Set Up Database

```bash
# Add database URL to .env.local
echo "DATABASE_URL=postgresql://localhost:5432/janine_game" >> .env.local

# Run migration
npm run db:migrate
```

### 2. Run Automated Tests

```bash
# Start dev server in one terminal
npm run dev

# Run test script in another terminal
npx tsx scripts/test-game-api.ts
```

## Manual Testing with cURL

### Create a Test Campaign (via database)

First, you need a campaign. Run this in your PostgreSQL client or use a script:

```sql
INSERT INTO campaigns (
  name, 
  start_date, 
  end_date, 
  status, 
  timer_duration, 
  reward_total, 
  reward_remaining,
  level_config
) VALUES (
  'Test Campaign',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '1 day',
  'active',
  60,
  100,
  100,
  '{"platforms":[{"x":0,"y":400,"width":800,"height":50}],"iceCreams":[{"x":300,"y":250}],"spawnPoint":{"x":50,"y":350}}'::jsonb
) RETURNING id;
```

Save the returned campaign ID for the next steps.

### Test API Endpoints

Replace `{CAMPAIGN_ID}` with your actual campaign ID.

#### 1. Get All Campaigns

```bash
curl http://localhost:3000/api/game/campaigns
```

Expected: JSON array of campaigns

#### 2. Get Specific Campaign

```bash
curl http://localhost:3000/api/game/campaigns/{CAMPAIGN_ID}
```

Expected: Campaign details with `is_active: true`

#### 3. Create Game Session

```bash
curl -X POST http://localhost:3000/api/game/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "characterId": "vanilla-kid",
    "campaignId": "{CAMPAIGN_ID}"
  }'
```

Expected: `{ "sessionId": "...", "gameConfig": {...} }`

Save the `sessionId` for the next step.

#### 4. Submit Score

```bash
curl -X POST http://localhost:3000/api/game/scores \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{SESSION_ID}",
    "score": 1500,
    "completionTime": 45,
    "clientTimestamp": '$(date +%s000)'
  }'
```

Expected: `{ "valid": true, "rank": 1, "isWinner": true }`

#### 5. Get Leaderboard

```bash
curl http://localhost:3000/api/game/leaderboard/{CAMPAIGN_ID}
```

Expected: JSON with `entries` array and `totalPlayers` count

## Testing Anti-Cheat Features

### Test 1: Duplicate Session Rejection

Try submitting a score with the same session ID twice:

```bash
# First submission (should succeed)
curl -X POST http://localhost:3000/api/game/scores \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "{SESSION_ID}", "score": 1000, "completionTime": 30, "clientTimestamp": '$(date +%s000)'}'

# Second submission (should fail)
curl -X POST http://localhost:3000/api/game/scores \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "{SESSION_ID}", "score": 2000, "completionTime": 20, "clientTimestamp": '$(date +%s000)'}'
```

Expected: Second request returns `{ "valid": false, "message": "..." }`

### Test 2: Invalid Player Name

```bash
curl -X POST http://localhost:3000/api/game/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "A",
    "characterId": "vanilla-kid",
    "campaignId": "{CAMPAIGN_ID}"
  }'
```

Expected: 400 error - "Player name must be between 2 and 20 characters"

### Test 3: Negative Score

```bash
# Create session first, then submit negative score
curl -X POST http://localhost:3000/api/game/scores \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{NEW_SESSION_ID}",
    "score": -100,
    "completionTime": 30,
    "clientTimestamp": '$(date +%s000)'
  }'
```

Expected: 400 error - Score validation failed

### Test 4: Too Fast Completion

```bash
curl -X POST http://localhost:3000/api/game/scores \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{NEW_SESSION_ID}",
    "score": 1000,
    "completionTime": 5,
    "clientTimestamp": '$(date +%s000)'
  }'
```

Expected: 400 error - Completion time below minimum

### Test 5: Rate Limiting

Submit multiple scores rapidly from the same IP:

```bash
# Run this in a loop
for i in {1..5}; do
  # Create new session
  SESSION=$(curl -s -X POST http://localhost:3000/api/game/sessions \
    -H "Content-Type: application/json" \
    -d '{"playerName": "Player'$i'", "characterId": "vanilla-kid", "campaignId": "{CAMPAIGN_ID}"}' \
    | jq -r '.sessionId')
  
  # Submit score immediately
  curl -X POST http://localhost:3000/api/game/scores \
    -H "Content-Type: application/json" \
    -d '{"sessionId": "'$SESSION'", "score": 1000, "completionTime": 30, "clientTimestamp": '$(date +%s000)'}'
  
  echo ""
done
```

Expected: Some requests should be rate-limited after the first one

## Checking Database State

### View Campaigns

```sql
SELECT id, name, status, reward_remaining FROM campaigns;
```

### View Game Sessions

```sql
SELECT id, player_name, character_id, is_golden_spoon, created_at 
FROM game_sessions 
ORDER BY created_at DESC 
LIMIT 10;
```

### View Scores

```sql
SELECT s.player_name, s.score, s.completion_time, s.is_flagged, s.created_at
FROM scores s
ORDER BY s.score DESC, s.created_at ASC
LIMIT 10;
```

### View Leaderboard

```sql
SELECT 
  s.player_name,
  s.score,
  s.completion_time,
  gs.is_golden_spoon,
  ROW_NUMBER() OVER (ORDER BY s.score DESC, s.created_at ASC) as rank
FROM scores s
JOIN game_sessions gs ON s.session_id = gs.id
WHERE s.campaign_id = '{CAMPAIGN_ID}'
  AND s.is_valid = TRUE
  AND s.is_flagged = FALSE
ORDER BY s.score DESC, s.created_at ASC
LIMIT 100;
```

### View Validation Logs

```sql
SELECT validation_type, passed, reason, created_at
FROM validation_logs
ORDER BY created_at DESC
LIMIT 20;
```

## Troubleshooting

### "Database connection failed"

- Check that PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local`
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`

### "Campaign not found or not active"

- Verify campaign exists: `SELECT * FROM campaigns;`
- Check campaign dates are valid (start < now < end)
- Check status is 'active'

### "Session not found"

- Verify session was created successfully
- Check session ID is correct UUID format
- Query: `SELECT * FROM game_sessions WHERE id = '{SESSION_ID}';`

### "Rate limit exceeded"

- Wait 30 seconds between score submissions from same IP
- Or use different IP addresses for testing
- Check Vercel KV is configured if in production

## Next Steps

Once basic API testing works:

1. Implement reward allocation system (Task 8)
2. Add email/SMS notifications (Task 9)
3. Create reward claim endpoint (Task 10)
4. Build frontend game components (Tasks 11-16)
