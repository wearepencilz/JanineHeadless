# Game Cache Fix Instructions

## Problem
The game is showing old behavior (no gaps, wrong scoring) even though the database has the correct configuration. This is a browser caching issue.

## Solution

### Step 1: Stop the dev server
Press `Ctrl+C` in your terminal to stop the Next.js dev server.

### Step 2: Clear Next.js cache
```bash
rm -rf .next
```

### Step 3: Restart the dev server
```bash
npm run dev
```

### Step 4: Hard refresh your browser
- **Chrome/Edge**: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- **Safari**: Press `Cmd+Option+R`
- **Firefox**: Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

### Step 5: Clear browser cache (if hard refresh doesn't work)
1. Open DevTools (F12 or Cmd+Option+I)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## What Should Happen After Cache Clear

### Level Layout
- **Ground platforms with gaps:**
  - Platform 1: x=0 to x=300
  - **GAP 1**: x=300 to x=400 (100px gap with hazard at bottom)
  - Platform 2: x=400 to x=700
  - **GAP 2**: x=700 to x=800 (100px gap with hazard at bottom)
  - Platform 3: x=800 to x=1100
  - Platform 4: x=1200 to x=1600

- **Floating platforms:**
  - Platform at x=500, y=400 (above gap 1)
  - Platform at x=900, y=350 (above gap 2)

- **Collectibles:**
  - 3 ingredients (50 points each)
  - 1 ice cream at x=1400 (far right, second screen)

- **Hazards:**
  - Hazard in gap 1 at x=350
  - Hazard in gap 2 at x=750

### Scoring
- Base score: 1000 points
- Time bonus: remaining_time × 10 points
- Ingredient bonus: ingredients_collected × 50 points
- **Total formula**: 1000 + (time × 10) + (ingredients × 50)

### Gameplay
- Player spawns at x=50 (left side, like Mario)
- All platforms are brown color (0x8B4513)
- Camera follows player with smooth scrolling
- World is 1600px wide (2 screens)
- Jump works on all platforms (checks both touching.down and blocked.down)

## Current Database Config
The database already has the correct configuration:
```json
{
  "platforms": [
    { "x": 0, "y": 550, "width": 300, "height": 50 },
    { "x": 400, "y": 550, "width": 300, "height": 50 },
    { "x": 800, "y": 550, "width": 300, "height": 50 },
    { "x": 1200, "y": 550, "width": 400, "height": 50 },
    { "x": 500, "y": 400, "width": 150, "height": 20 },
    { "x": 900, "y": 350, "width": 150, "height": 20 }
  ],
  "hazards": [
    { "x": 350, "y": 580 },
    { "x": 750, "y": 580 }
  ],
  "ingredients": [
    { "x": 150, "y": 450 },
    { "x": 550, "y": 300 },
    { "x": 1000, "y": 250 }
  ],
  "iceCreams": [
    { "x": 1400, "y": 200 }
  ],
  "spawnPoint": { "x": 50, "y": 450 },
  "worldWidth": 1600
}
```

## Background Asset Size
If you want to upload a new background image, it should be:
- **Width**: 1600px (matches world width)
- **Height**: 600px (matches game height)
- **Format**: PNG, JPEG, or WebP

## Verification
After clearing cache, you should see:
1. ✅ Two visible gaps in the ground platforms
2. ✅ Red hazards at the bottom of each gap
3. ✅ Player spawns at far left (x=50)
4. ✅ Ice cream is on the second screen (need to scroll right)
5. ✅ All platforms are brown
6. ✅ Ingredients worth 50 points each (not 100)
7. ✅ Jump works on all platforms
